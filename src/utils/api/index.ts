import { Get, Post, Patch, Delete } from '../http';

const byId = (basePath: string, id: string | number) => `${basePath}/${id}`;

const createCrudApi = (basePath: string) => ({
  list: (params?: Record<string, any>) => Get(basePath, params),
  getById: (id: string | number) => Get(byId(basePath, id)),
  create: (data?: any) => Post(basePath, data),
  update: (id: string | number, data?: any) => Patch(byId(basePath, id), data),
  remove: (id: string | number) => Delete(byId(basePath, id)),
});

export const api = {
  auth: {
    register: (data: any) => Post('auth/register', data),
    login: (data: any) => Post('auth/login', data),
    logout: () => Post('auth/logout', undefined),
    getCurrentUser: () => Get('auth/me'),
    updateCurrentUser: (data: any) => Patch('auth/me', data),
    forgotPassword: (data: any) => Post('auth/forgot-password', data),
    resetPassword: (data: any) => Post('auth/reset-password', data),
    changePassword: (data: any) => Post('auth/change-password', data),
  },

  profile: {
    personal: {
      get: () => Get('profile/personal'),
      update: (data: any) => Patch('profile/personal', data),
      updateForm: (data: any) => Post('profile/personal', data),
    },
    business: {
      get: () => Get('profile/business'),
      update: (data: any) => Patch('profile/business', data),
    },
    verificationStatus: {
      get: () => Get('profile/verification-status'),
    },
    banking: {
      get: () => Get('profile/banking'),
      create: (data: any) => Post('profile/banking', data),
      update: (id: string | number, data: any) =>
        Patch(`profile/banking/${id}`, data),
      remove: (id: string | number) => Delete(`profile/banking/${id}`),
    },
    appSettings: {
      get: () => Get('profile/app-settings'),
      update: (data: any) => Patch('profile/app-settings', data),
    },
    notifications: {
      get: () => Get('profile/notifications'),
      update: (data: any) => Patch('profile/notifications', data),
    },
  },

  marketplace: {
    listPublicListings: (params?: Record<string, any>) =>
      Get('public/listings', params),
    createSellerListing: (data: any) => Post('seller/listings', data),
    createSellerListingForm: (data: any) => Post('seller/listings', data),
    getMyListings: () => Get('seller/listings/my'),
    getSellerListing: (id: string | number) => Get(byId('seller/listings', id)),
    updateSellerListing: (id: string | number, data: any) =>
      Patch(byId('seller/listings', id), data),
    updateSellerListingForm: (id: string | number, data: any) =>
      Patch(byId('seller/listings', id), data),
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
      list: (params?: Record<string, any>) => Get('admin/users', params),
      getById: (id: string | number) => Get(byId('admin/users', id)),
      verify: (id: string | number, data: any) =>
        Patch(`admin/users/${id}/verify`, data),
      updateStatus: (id: string | number, data: any) =>
        Patch(`admin/users/${id}/status`, data),
    },
    listings: {
      list: (params?: Record<string, any>) => Get('admin/listings', params),
      getById: (id: string | number) => Get(byId('admin/listings', id)),
      review: (id: string | number, data: any) =>
        Patch(`admin/listings/${id}/review`, data),
    },
    categories: {
      create: (data: any) => Post('admin/categories', data),
      list: () => Get('admin/categories'),
      update: (id: string | number, data: any) =>
        Patch(`admin/categories/${id}`, data),
      remove: (id: string | number) => Delete(`admin/categories/${id}`),
    },
    commodities: {
      create: (data: any) => Post('admin/commodities', data),
      listByCategory: (categoryId: string | number) =>
        Get(`admin/categories/${categoryId}/commodities`),
      getById: (id: string | number) => Get(byId('admin/commodities', id)),
      update: (id: string | number, data: any) =>
        Patch(byId('admin/commodities', id), data),
      remove: (id: string | number) => Delete(byId('admin/commodities', id)),
      createRate: (id: string | number, data: any) =>
        Post(`admin/${id}/rates`, data),
      listRates: (id: string | number) => Get(`admin/${id}/rates`),
      updateRate: (rateId: string | number, data: any) =>
        Patch(`admin/rates/${rateId}`, data),
    },
    units: {
      create: (data: any) => Post('admin/units', data),
      list: () => Get('admin/units'),
      update: (id: string | number, data: any) =>
        Patch(`admin/units/${id}`, data),
      remove: (id: string | number) => Delete(`admin/units/${id}`),
    },
    paymentTerms: {
      create: (data: any) => Post('admin/payment-terms', data),
      list: () => Get('admin/payment-terms'),
      update: (id: string | number, data: any) =>
        Patch(`admin/payment-terms/${id}`, data),
    },
    paymentOptions: {
      create: (data: any) => Post('admin/payment-options', data),
      list: () => Get('admin/payment-options'),
      update: (id: string | number, data: any) =>
        Patch(`admin/payment-options/${id}`, data),
    },
    buyRequests: createCrudApi('admin/buyrequests'),
    sellRequests: createCrudApi('admin/sellrequests'),
    deals: createCrudApi('admin/deals'),
    payments: createCrudApi('admin/payments'),
  },
};

export default api;
