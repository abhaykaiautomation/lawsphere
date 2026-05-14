import axios, { AxiosError, AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';

function createApiClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
  });

  instance.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('lawsphere_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  instance.interceptors.response.use(
    (res) => res.data,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('lawsphere_token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    },
  );

  return instance;
}

export const api = createApiClient();
