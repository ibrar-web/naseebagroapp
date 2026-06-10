import { Get, Post, Patch, Delete } from '../http';

const byId = (basePath: string, id: string | number) => `${basePath}/${id}`;
const protectedRequest = { authRequired: true };

type MyPostsListParams = {
  status?: string;
  search?: string;
  category_id?: string;
  page?: number;
  limit?: number;
  sort?: string;
  [key: string]: any;
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
        Get('public/market-rates/home', params),
      listMarketRatesAll: (params?: Record<string, any>) =>
        Get('public/market-rates', params),
      listHomeCategoryListing: (params?: Record<string, any>) =>
        Get('public/featured-categories', params),
      // market place screen with filters for buyer
      listMarketSuppliesListing: (params?: Record<string, any>) =>
        Get('public/supplies', params),
      DetailMarketSuppliesListing: (
        id: string | number,
        params?: Record<string, any>,
      ) => Get(byId('public/supplies', id), params),
      // market place api for seller
      listMarketDemandsListing: (params?: Record<string, any>) =>
        Get('public/demand', params),
      DetailMarketDemandsListing: (
        id: string | number,
        params?: Record<string, any>,
      ) => Get(byId('public/demand', id), params),
      listCategories: () => Get('public/categories'),
    },
  },
  buyer: {
    sendBuyrequest: (id: string | number, data?: any) =>
      Post('buyer/supplies/make-request', data, protectedRequest),
    listMyDemands: (params?: MyPostsListParams) =>
      Get('buyer/my-posts/demands', params, protectedRequest),
    myDemandDetails: (id: string | number) =>
      Get(byId('buyer/my-posts/demands', id), undefined, protectedRequest),
    ListDemandOffers: (params?: MyPostsListParams) =>
      Get('buyer/my-posts/offers', params, protectedRequest),
    myDemandOfferDetails: (id: string | number) =>
      Get(byId('buyer/my-posts/offers', id), undefined, protectedRequest),
    markFavouriteSupply: (id: string | number) =>
      Post(byId('buyer/supplies/favourites', id), undefined, protectedRequest),
    removeFavouriteSupply: (id: string | number) =>
      Delete(
        byId('buyer/supplies/favourites', id),
        undefined,
        protectedRequest,
      ),
    // get category form
    getBuyerCategoryform: (id: string) =>
      Get(byId('public/buyer/form', id), undefined),
    // submit demand request
    createBuyDemandPost: (data?: any) =>
      Post('buyer/demands/create', data, protectedRequest),
  },

  seller: {
    sendDemandOffer: (id: string | number, data?: any) =>
      Post('seller/demands/send-offer', data, protectedRequest),
    ListMyPosts: (params?: MyPostsListParams) =>
      Get('seller/my-posts/supplies', params, protectedRequest),
    myPostDetails: (id: string | number) =>
      Get(byId('seller/my-posts/supplies', id), undefined, protectedRequest),
    ListMyPostsOffers: (params?: MyPostsListParams) =>
      Get('seller/my-posts/offers', params, protectedRequest),
    myPostOffersDetails: (id: string | number) =>
      Get(byId('seller/my-posts/offers', id), undefined, protectedRequest),
    // get category form
    getSellerCategoryform: (id: string) =>
      Get(byId('public/seller/form', id), undefined),
    // submit supply request
    createSupplyPost: (data?: any) =>
      Post('seller/supplies/create', data, protectedRequest),
  },
};

export default api;
