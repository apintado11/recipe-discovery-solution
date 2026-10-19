import axios from 'axios';
import { readSession } from '../auth/session';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = readSession()?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
