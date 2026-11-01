// Frontend-only public configuration. Never put private credentials in VITE_* values.
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL = (apiBaseUrl ?? (import.meta.env.DEV ? 'http://localhost:5000' : '')).replace(/\/$/, '');
export const INSTAGRAM_USER_ID = import.meta.env.VITE_INSTAGRAM_USER_ID || '9274549005988652';
