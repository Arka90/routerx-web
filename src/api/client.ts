import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

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
      // Handle unauthorized access (e.g., redirect to login or clear token)
      Cookies.remove('session-token');
      Cookies.remove('user-email');
      
      // We don't want to redirect if we're already on a login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
          window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
