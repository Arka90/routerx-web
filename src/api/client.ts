import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { getActiveOrgId } from '@/stores/authStore';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://routerx-api.heyarka.cloud/';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('session-token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Which workspace this request acts on. The server verifies membership
    // regardless, so this selects rather than authorises.
    const orgId = getActiveOrgId();
    if (orgId !== null && config.headers) {
      config.headers['X-Org-Id'] = String(orgId);
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // The session was revoked or expired. Sessions are server-side now, so
      // a 401 is authoritative rather than a guess about token age.
      Cookies.remove('session-token');
      Cookies.remove('user-email');
      Cookies.remove('active-org');

      const path = typeof window !== 'undefined' ? window.location.pathname : '';

      // An invite link is viewable signed out; bouncing off it would lose
      // the token the page needs.
      if (
        path &&
        !path.startsWith('/auth') &&
        !path.startsWith('/invites') &&
        !path.startsWith('/status')
      ) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

/**
 * For endpoints that are meant to work signed out — the public status page
 * and its subscription flow. Deliberately has no auth interceptor: attaching
 * a stale token would turn a public page into a 401 redirect, and the page
 * people read during an outage must not depend on being logged in.
 */
export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});
