import axios from 'axios';
import CryptoJS from 'crypto-js';

const instance = axios.create({
    baseURL: '/',
});

instance.interceptors.request.use((config) => {
    const encrypted = localStorage.getItem('adminToken');
    if (encrypted) {
        try {
            const bytes = CryptoJS.AES.decrypt(encrypted, "secretKey");
            const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);
            if (decryptedToken) {
                config.headers.Authorization = `Bearer ${decryptedToken}`;
            }
        } catch (e) {
            console.error("Token decryption failed:", e);
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default instance;
