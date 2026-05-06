import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ENV } from '../environment';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor — attach auth token
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // const token = await AsyncStorage.getItem('authToken');
    // if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Response interceptor — handle global errors
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    if (status === 401) {
      // Token expired — dispatch logout or redirect to login
    }
    if (status === 500) {
      console.error('[API] Server error', error.response?.data);
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
