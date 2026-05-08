import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { Alert } from 'react-native';
import { ENV } from '../environment';

export type ApiEnvelope<T = unknown> = {
  status: number;
  message: string;
  data: T;
};

export type ApiErrorPayload = {
  status?: number;
  message: string;
  data?: unknown;
};

type ApiRequestConfig = InternalAxiosRequestConfig & {
  showErrorAlert?: boolean;
  successMessage?: string;
};

const AUTH_TOKEN_STORAGE_KEY = 'authToken';
const ACCESS_TOKEN_STORAGE_KEY = 'accessToken';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

const isFormDataPayload = (data: unknown) =>
  typeof FormData !== 'undefined' && data instanceof FormData;

const getToken = async () =>
  (await AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY)) ??
  (await AsyncStorage.getItem(ACCESS_TOKEN_STORAGE_KEY));

const resolveErrorMessage = (
  error: AxiosError<ApiEnvelope | ApiErrorPayload>,
) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.response?.status) {
    const statusMessages: Record<number, string> = {
      400: 'Invalid request. Please check the entered information.',
      401: 'Your session has expired. Please login again.',
      403: 'You do not have permission to perform this action.',
      404: 'The requested resource was not found.',
      409: 'This request conflicts with existing data.',
      422: 'Some fields are invalid. Please review and try again.',
      500: 'Server error. Please try again later.',
    };

    return (
      statusMessages[error.response.status] ??
      `Request failed with status ${error.response.status}`
    );
  }

  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please check your connection and try again.';
  }

  if (error.message === 'Network Error') {
    return 'Network error. Please check your internet connection.';
  }

  return error.message || 'Something went wrong. Please try again.';
};

const shouldShowErrorAlert = (
  config?: InternalAxiosRequestConfig,
  status?: number,
) => {
  const requestConfig = config as ApiRequestConfig | undefined;

  if (requestConfig?.showErrorAlert === false) {
    return false;
  }

  return !status || status >= 400;
};

const showErrorAlert = (
  error: AxiosError<ApiEnvelope | ApiErrorPayload>,
  message: string,
) => {
  const status = error.response?.status;

  if (!shouldShowErrorAlert(error.config, status)) {
    return;
  }

  const title =
    status === 401
      ? 'Session expired'
      : status && status >= 500
      ? 'Server error'
      : 'Request failed';

  Alert.alert(title, message);
};

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (isFormDataPayload(config.data)) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiEnvelope | ApiErrorPayload>) => {
    const message = resolveErrorMessage(error);
    const status = error.response?.status;

    if (status === 401) {
      void AsyncStorage.multiRemove([
        AUTH_TOKEN_STORAGE_KEY,
        ACCESS_TOKEN_STORAGE_KEY,
      ]);
    }

    if (status && status >= 500) {
      console.error('[API] Server error', error.response?.data);
    }

    showErrorAlert(error, message);

    return Promise.reject(error);
  },
);

export default axiosInstance;
