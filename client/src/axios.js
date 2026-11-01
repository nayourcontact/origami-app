import axios from 'axios';
import { API_BASE_URL } from './config.js';

const instance = axios.create({ baseURL: API_BASE_URL || '/', withCredentials: true });
let csrfToken = null;
let sessionPromise = null;

export function setCsrfToken(value) { csrfToken = value || null; sessionPromise = null; }
export function clearCsrfToken() { csrfToken = null; sessionPromise = null; }

export async function getAdminSession() {
    if (!sessionPromise) {
        sessionPromise = instance.get('/api/admin/session', { skipCsrf: true })
            .then(({data}) => { setCsrfToken(data.csrfToken); return data; })
            .catch(error => { sessionPromise = null; clearCsrfToken(); throw error; });
    }
    return sessionPromise;
}
instance.interceptors.request.use(async config => {
    const method = (config.method || 'get').toLowerCase();
    const unsafe = !['get', 'head', 'options'].includes(method);
    const url = new URL(config.url, window.location.origin);
    const isLogin = url.pathname === '/api/admin/login';
    if (unsafe && !isLogin && !config.skipCsrf) {
        if (!csrfToken) await getAdminSession();
        config.headers.set('X-CSRF-Token', csrfToken);
    }
    return config;
});
export default instance;
