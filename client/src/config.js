const configuredUrl = import.meta.env.VITE_API_BASE_URL || '';
const normalizedUrl = configuredUrl.replace(/\/+$/, '');

export const API_BASE_URL = import.meta.env.DEV
    ? (normalizedUrl || 'http://localhost:5000').replace(/\/api$/, '')
    : normalizedUrl.replace(/\/api$/, '');

export const INSTAGRAM_USER_ID =
    import.meta.env.VITE_INSTAGRAM_USER_ID || '9274549005988652';