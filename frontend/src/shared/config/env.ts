export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5134/api';
export const HUB_BASE_URL: string = API_BASE_URL.replace(/\/api\/?$/, '');
export const TOKEN_STORAGE_KEY = 'bookingclone.token';
export const REFRESH_TOKEN_STORAGE_KEY = 'bookingclone.refresh_token';
export const USER_STORAGE_KEY = 'bookingclone.user';
