import axiosInstance from '../index';
import http, { QueryParams, RequestBody } from '../http';

const byId = (basePath: string, id: string | number) => `${basePath}/${id}`;

const createCrudApi = (basePath: string) => ({
  list: <T = unknown>(params?: QueryParams) =>
    http.getRequest<T>(basePath, params),
  getById: <T = unknown>(id: string | number) =>
    http.getRequest<T>(byId(basePath, id)),
  create: <T = unknown>(data?: RequestBody) =>
    http.createRequest<T>(basePath, data),
  update: <T = unknown>(id: string | number, data?: RequestBody) =>
    http.updateRequest<T>(byId(basePath, id), data),
  remove: <T = unknown>(id: string | number) =>
    http.deleteRequest<T>(byId(basePath, id)),
});

export const api = {
  auth: {
    register: <T = unknown>(data: RequestBody) =>
      http.createRequest<T>('auth/register', data),
    registerAdmin: <T = unknown>(data: RequestBody) =>
      http.createRequest<T>('auth/admin/register', data),
    login: <T = unknown>(data: RequestBody) =>
      http.createRequest<T>('auth/login', data),
    logout: <T = unknown>() => http.createRequest<T>('auth/logout'),
    getCurrentUser: <T = unknown>() => http.getRequest<T>('auth/me'),
    updateCurrentUser: <T = unknown>(data: RequestBody) =>
      http.updateRequest<T>('auth/me', data),
    forgotPassword: <T = unknown>(data: RequestBody) =>
      http.createRequest<T>('auth/forgot-password', data),
    resetPassword: <T = unknown>(data: RequestBody) =>
      http.createRequest<T>('auth/reset-password', data),
    changePassword: <T = unknown>(data: RequestBody) =>
      http.createRequest<T>('auth/change-password', data),
  },

  profile: {
    personal: {
      get: <T = unknown>() => http.getRequest<T>('profile/personal'),
      update: <T = unknown>(data: RequestBody) =>
        http.updateRequest<T>('profile/personal', data),
      updateForm: <T = unknown>(data: RequestBody) =>
        http.updateFormRequest<T>('profile/personal', data),
    },
    business: {
      get: <T = unknown>() => http.getRequest<T>('profile/business'),
      update: <T = unknown>(data: RequestBody) =>
        http.updateRequest<T>('profile/business', data),
    },
    appSettings: {
      get: <T = unknown>() => http.getRequest<T>('profile/app-settings'),
      update: <T = unknown>(data: RequestBody) =>
        http.updateRequest<T>('profile/app-settings', data),
    },
    notifications: {
      get: <T = unknown>() => http.getRequest<T>('profile/notifications'),
      update: <T = unknown>(data: RequestBody) =>
        http.updateRequest<T>('profile/notifications', data),
    },
  },

  marketplace: {
    listPublicListings: <T = unknown>(params?: QueryParams) =>
      http.getRequest<T>('public/listings', params),
    createSellerListing: <T = unknown>(data: RequestBody) =>
      http.createRequest<T>('seller/listings', data),
    createSellerListingForm: <T = unknown>(data: RequestBody) =>
      http.createFormRequest<T>('seller/listings', data),
    getMyListings: <T = unknown>() => http.getRequest<T>('seller/listings/my'),
    getSellerListing: <T = unknown>(id: string | number) =>
      http.getRequest<T>(byId('seller/listings', id)),
    updateSellerListing: <T = unknown>(
      id: string | number,
      data: RequestBody,
    ) => http.updateRequest<T>(byId('seller/listings', id), data),
    updateSellerListingForm: <T = unknown>(
      id: string | number,
      data: RequestBody,
    ) => http.updateFormRequest<T>(byId('seller/listings', id), data),
  },

  buyer: {
    requests: createCrudApi('buyer/buyrequest'),
    deals: createCrudApi('buyer/buydeals'),
    payments: createCrudApi('buyer/buypayment'),
  },

  seller: {
    payments: createCrudApi('seller/sellpayment'),
    analytics: createCrudApi('seller/analytics'),
  },

  admin: {
    users: {
      list: <T = unknown>(params?: QueryParams) =>
        http.getRequest<T>('admin/users', params),
      getById: <T = unknown>(id: string | number) =>
        http.getRequest<T>(byId('admin/users', id)),
      verify: <T = unknown>(id: string | number, data: RequestBody) =>
        http.updateRequest<T>(`admin/users/${id}/verify`, data),
      updateStatus: <T = unknown>(id: string | number, data: RequestBody) =>
        http.updateRequest<T>(`admin/users/${id}/status`, data),
    },
    listings: {
      list: <T = unknown>(params?: QueryParams) =>
        http.getRequest<T>('admin/listings', params),
      getById: <T = unknown>(id: string | number) =>
        http.getRequest<T>(byId('admin/listings', id)),
      review: <T = unknown>(id: string | number, data: RequestBody) =>
        http.updateRequest<T>(`admin/listings/${id}/review`, data),
    },
    categories: {
      create: <T = unknown>(data: RequestBody) =>
        http.createFormRequest<T>('admin/categories', data),
      list: <T = unknown>() => http.getRequest<T>('admin/categories'),
      update: <T = unknown>(id: string | number, data: RequestBody) =>
        http.updateFormRequest<T>(`admin/categories/${id}`, data),
      remove: <T = unknown>(id: string | number) =>
        http.deleteRequest<T>(`admin/categories/${id}`),
    },
    commodities: {
      create: <T = unknown>(data: RequestBody) =>
        http.createFormRequest<T>('admin/commodities', data),
      listByCategory: <T = unknown>(categoryId: string | number) =>
        http.getRequest<T>(`admin/categories/${categoryId}/commodities`),
      getById: <T = unknown>(id: string | number) =>
        http.getRequest<T>(byId('admin/commodities', id)),
      update: <T = unknown>(id: string | number, data: RequestBody) =>
        http.updateFormRequest<T>(byId('admin/commodities', id), data),
      remove: <T = unknown>(id: string | number) =>
        http.deleteRequest<T>(byId('admin/commodities', id)),
      createRate: <T = unknown>(id: string | number, data: RequestBody) =>
        http.createRequest<T>(`admin/${id}/rates`, data),
      listRates: <T = unknown>(id: string | number) =>
        http.getRequest<T>(`admin/${id}/rates`),
      updateRate: <T = unknown>(rateId: string | number, data: RequestBody) =>
        http.updateRequest<T>(`admin/rates/${rateId}`, data),
    },
    units: {
      create: <T = unknown>(data: RequestBody) =>
        http.createRequest<T>('admin/units', data),
      list: <T = unknown>() => http.getRequest<T>('admin/units'),
      update: <T = unknown>(id: string | number, data: RequestBody) =>
        http.updateRequest<T>(`admin/units/${id}`, data),
      remove: <T = unknown>(id: string | number) =>
        http.deleteRequest<T>(`admin/units/${id}`),
    },
    paymentTerms: {
      create: <T = unknown>(data: RequestBody) =>
        http.createRequest<T>('admin/payment-terms', data),
      list: <T = unknown>() => http.getRequest<T>('admin/payment-terms'),
      update: <T = unknown>(id: string | number, data: RequestBody) =>
        http.updateRequest<T>(`admin/payment-terms/${id}`, data),
    },
    paymentOptions: {
      create: <T = unknown>(data: RequestBody) =>
        http.createRequest<T>('admin/payment-options', data),
      list: <T = unknown>() => http.getRequest<T>('admin/payment-options'),
      update: <T = unknown>(id: string | number, data: RequestBody) =>
        http.updateRequest<T>(`admin/payment-options/${id}`, data),
    },
    buyRequests: createCrudApi('admin/buyrequests'),
    sellRequests: createCrudApi('admin/sellrequests'),
    deals: createCrudApi('admin/deals'),
    payments: createCrudApi('admin/payments'),
  },
} as const;

export { axiosInstance, http };
export default api;
