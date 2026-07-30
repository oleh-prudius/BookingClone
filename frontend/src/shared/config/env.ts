export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5134/api';
export const SENTRY_DSN: string | undefined = import.meta.env.VITE_SENTRY_DSN || undefined;
export const UMAMI_SCRIPT_URL: string | undefined = import.meta.env.VITE_UMAMI_SCRIPT_URL || undefined;
export const UMAMI_WEBSITE_ID: string | undefined = import.meta.env.VITE_UMAMI_WEBSITE_ID || undefined;
export const HUB_BASE_URL: string = API_BASE_URL.replace(/\/api\/?$/, '');
export const TOKEN_STORAGE_KEY = 'bookingclone.token';
export const REFRESH_TOKEN_STORAGE_KEY = 'bookingclone.refresh_token';
export const USER_STORAGE_KEY = 'bookingclone.user';
