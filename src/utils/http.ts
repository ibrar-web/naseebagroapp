import axiosInstance from './index';

export const get = <T = any>(url: string, params?: object): Promise<T> =>
  axiosInstance.get<T>(url, { params }).then(r => r.data);

export const post = <T = any>(url: string, data?: object): Promise<T> =>
  axiosInstance.post<T>(url, data).then(r => r.data);

export const put = <T = any>(url: string, data?: object): Promise<T> =>
  axiosInstance.put<T>(url, data).then(r => r.data);

export const patch = <T = any>(url: string, data?: object): Promise<T> =>
  axiosInstance.patch<T>(url, data).then(r => r.data);

export const del = <T = any>(url: string): Promise<T> =>
  axiosInstance.delete<T>(url).then(r => r.data);
