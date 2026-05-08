import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import axiosInstance, { ApiEnvelope } from './index';

export type QueryParams = Record<string, string | number | boolean | undefined>;
export type RequestBody = Record<string, unknown> | FormData | undefined;

export class ApiClientError extends Error {
  status?: number;
  data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.data = data;
  }
}

const isApiEnvelope = <T>(body: unknown): body is ApiEnvelope<T> =>
  Boolean(
    body &&
      typeof body === 'object' &&
      'status' in body &&
      'message' in body &&
      'data' in body,
  );

const transformResponseData = <T>(
  response: AxiosResponse<ApiEnvelope<T> | T>,
) => {
  const body = response.data;

  if (isApiEnvelope<T>(body)) {
    return body.data;
  }

  return body as T;
};

const toFormData = (payload?: RequestBody) => {
  if (!payload || payload instanceof FormData) {
    return payload;
  }

  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(item => formData.append(key, item as never));
      return;
    }

    formData.append(key, value as never);
  });

  return formData;
};

const normalizeError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiEnvelope | { message?: string }>;
    const message =
      axiosError.response?.data?.message ??
      axiosError.message ??
      'Request failed';

    return new ApiClientError(
      message,
      axiosError.response?.status,
      axiosError.response?.data,
    );
  }

  if (error instanceof Error) {
    return error;
  }

  return new ApiClientError('Request failed');
};

const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await axiosInstance.request<ApiEnvelope<T> | T>(config);
    return transformResponseData<T>(response);
  } catch (error) {
    throw normalizeError(error);
  }
};

export const http = {
  getRequest: <T = unknown>(
    url: string,
    params?: QueryParams,
    config?: AxiosRequestConfig,
  ) => request<T>({ ...config, method: 'GET', url, params }),

  createRequest: <T = unknown>(
    url: string,
    data?: RequestBody,
    config?: AxiosRequestConfig,
  ) => request<T>({ ...config, method: 'POST', url, data }),

  replaceRequest: <T = unknown>(
    url: string,
    data?: RequestBody,
    config?: AxiosRequestConfig,
  ) => request<T>({ ...config, method: 'PUT', url, data }),

  updateRequest: <T = unknown>(
    url: string,
    data?: RequestBody,
    config?: AxiosRequestConfig,
  ) => request<T>({ ...config, method: 'PATCH', url, data }),

  deleteRequest: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'DELETE', url }),

  createFormRequest: <T = unknown>(
    url: string,
    data?: RequestBody,
    config?: AxiosRequestConfig,
  ) =>
    request<T>({
      ...config,
      method: 'POST',
      url,
      data: toFormData(data),
    }),

  updateFormRequest: <T = unknown>(
    url: string,
    data?: RequestBody,
    config?: AxiosRequestConfig,
  ) =>
    request<T>({
      ...config,
      method: 'PATCH',
      url,
      data: toFormData(data),
    }),
};

export default http;
