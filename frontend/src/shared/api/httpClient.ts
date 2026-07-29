import axios from 'axios';
import { API_BASE_URL } from '@shared/config/env';
import { tokenStorage } from '@shared/lib/tokenStorage';
import { notifyError } from '@shared/lib/notify';

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  // ASP.NET Core model binding expects repeated keys (?ids=1&ids=2), not the
  // bracket-suffixed form axios uses by default (?ids[]=1&ids[]=2) — without
  // this, every array query param (categoryIds, starRatings, ...) is silently
  // dropped by the backend and filters that use them are no-ops.
  paramsSerializer: { indexes: null },
});

httpClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;

    if (status === 401) {
      tokenStorage.clear();
      notifyError('Your session has expired. Please log in again.');
      window.dispatchEvent(new Event('auth:logout'));
    } else if (status === undefined) {
      notifyError('Network error. Please check your connection.');
    } else if (status >= 500) {
      notifyError('Something went wrong on our end. Please try again later.');
    }

    return Promise.reject(error);
  },
);
