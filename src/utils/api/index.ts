import { Get, Post, Patch, Delete } from '../http';

const byId = (basePath: string, id: string | number) => `${basePath}/${id}`;
const protectedRequest = { authRequired: true };

const createCrudApi = (basePath: string, authRequired = false) => {
  const options = authRequired ? protectedRequest : undefined;

  return {
    list: (params?: Record<string, any>) => Get(basePath, params, options),
    getById: (id: string | number) =>
      Get(byId(basePath, id), undefined, options),
    create: (data?: any) => Post(basePath, data, options),
    update: (id: string | number, data?: any) =>
      Patch(byId(basePath, id), data, options),
    remove: (id: string | number) =>
      Delete(byId(basePath, id), undefined, options),
  };
};

export const api = {
  auth: {
    register: (data: any) => Post('auth/register', data),
    login: (data: any) => Post('auth/login', data),
    logout: () => Post('auth/logout', undefined, protectedRequest),
    getCurrentUser: () => Get('auth/me', undefined, protectedRequest),
    updateCurrentUser: (data: any) => Patch('auth/me', data, protectedRequest),
    forgotPassword: (data: any) => Post('auth/forgot-password', data),
    resetPassword: (data: any) => Post('auth/reset-password', data),
    changePassword: (data: any) =>
      Post('auth/change-password', data, protectedRequest),
  },

  profile: {
    personal: {
      get: () => Get('profile/personal', undefined, protectedRequest),
      update: (data: any) => Patch('profile/personal', data, protectedRequest),
      updateForm: (data: any) =>
        Patch('profile/personal', data, protectedRequest),
    },
    business: {
      get: () => Get('profile/business', undefined, protectedRequest),
      update: (data: any) => Patch('profile/business', data, protectedRequest),
    },
    verificationStatus: {
      get: () =>
        Get(
          'profile/personal/verification-status',
          undefined,
          protectedRequest,
        ),
    },
    banking: {
      get: () => Get('profile/personal/banking', undefined, protectedRequest),
      create: (data: any) =>
        Post('profile/personal/banking', data, protectedRequest),
      update: (id: string | number, data: any) =>
        Patch(`profile/personal/banking/${id}`, data, protectedRequest),
      remove: (id: string | number) =>
        Delete(`profile/personal/banking/${id}`, undefined, protectedRequest),
    },
    appSettings: {
      get: () => Get('profile/app-settings', undefined, protectedRequest),
      update: (data: any) =>
        Patch('profile/app-settings', data, protectedRequest),
    },
    notifications: {
      get: () => Get('profile/notifications', undefined, protectedRequest),
      update: (data: any) =>
        Patch('profile/notifications', data, protectedRequest),
    },
  },

  marketplace: {
    public: {
      listCommodities: (params?: Record<string, any>) =>
        Get('public/commodities', params),
      listListings: (params?: Record<string, any>) =>
        Get('public/listings', params),
      listMarketRates: (params?: Record<string, any>) =>
        Get('public/market-rates', params),
    },
    private: {
      createSellerListing: (data: any) =>
        Post('seller/listings', data, protectedRequest),
      createSellerListingForm: (data: any) =>
        Post('seller/listings', data, protectedRequest),
      getMyListings: () =>
        Get('seller/listings/my', undefined, protectedRequest),
      getSellerListing: (id: string | number) =>
        Get(byId('seller/listings', id), undefined, protectedRequest),
      updateSellerListing: (id: string | number, data: any) =>
        Patch(byId('seller/listings', id), data, protectedRequest),
      updateSellerListingForm: (id: string | number, data: any) =>
        Patch(byId('seller/listings', id), data, protectedRequest),
      removeSellerListing: (id: string | number) =>
        Delete(byId('seller/listings', id), undefined, protectedRequest),
    },
  },
  posts: {
    getSellerListing: (id: string | number) =>
      Get(byId('seller/listings', id), undefined, protectedRequest),
  },
  deals: {
    getMyDeals: (id: string | number) =>
      Get(byId('seller/listings', id), undefined, protectedRequest),
  },
  buyer: {
    requests: createCrudApi('buyer/buyrequest', true),
    deals: createCrudApi('buyer/buydeals', true),
    payments: createCrudApi('buyer/buypayment', true),
  },

  seller: {
    payments: createCrudApi('seller/sellpayment', true),
    analytics: createCrudApi('seller/analytics', true),
  },
};

export default api;
