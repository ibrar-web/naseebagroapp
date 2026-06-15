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
    notificationList: (params?: { limit?: number; offset?: number }) =>
      Get('profile/notifications/list', params, protectedRequest),
    markNotificationRead: (id: string) =>
      Patch(`profile/notifications/list/${id}/read`, undefined, protectedRequest),
    markAllNotificationsRead: () =>
      Patch('profile/notifications/list/read-all', undefined, protectedRequest),
    savedListings: (params?: { limit?: number; offset?: number }) =>
      Get('profile/saved-listings', params, protectedRequest),
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
      Get('buyer/demands', params, protectedRequest),
    myDemandDetails: (id: string | number) =>
      Get(byId('buyer/demands', id), undefined, protectedRequest),
    ListDemandOffers: (params?: MyPostsListParams) =>
      Get('buyer/offers', params, protectedRequest),
    myDemandOfferDetails: (id: string | number) =>
      Get(byId('buyer/offers', id), undefined, protectedRequest),
    counterOffer: (id: string, data: { offered_price: number; note?: string }) =>
      Post(`buyer/offers/${id}/counter`, data, protectedRequest),
    acceptOffer: (id: string) =>
      Post(`buyer/offers/${id}/accept`, undefined, protectedRequest),
    rejectOffer: (id: string) =>
      Post(`buyer/offers/${id}/reject`, undefined, protectedRequest),
    listNotifications: (params?: { limit?: number; offset?: number }) =>
      Get('buyer/notifications', params, protectedRequest),
    markNotificationRead: (id: string) =>
      Patch(`buyer/notifications/${id}/read`, undefined, protectedRequest),
    markAllNotificationsRead: () =>
      Patch('buyer/notifications/read-all', undefined, protectedRequest),
    markFavouriteSupply: (id: string | number) =>
      Post(byId('buyer/supplies/favourites', id), undefined, protectedRequest),
    removeFavouriteSupply: (id: string | number) =>
      Delete(
        byId('buyer/supplies/favourites', id),
        undefined,
        protectedRequest,
      ),
    listFavourites: (params?: { limit?: number; offset?: number }) =>
      Get('buyer/supplies/favourites', params, protectedRequest),
    // get category form
    getBuyerCategoryform: (id: string) =>
      Get(byId('public/buyer/form', id), undefined),
    // submit demand request
    createBuyDemandPost: (data?: any) =>
      Post('buyer/demands/create', data, protectedRequest),
  },

  seller: {
    //this api use in market place to send offer on demand
    sendDemandOffer: (id: string | number, data?: any) =>
      Post('seller/demands/send-offer', data, protectedRequest),
    ListMyPosts: (params?: MyPostsListParams) =>
      Get('seller/supplies', params, protectedRequest),
    myPostDetails: (id: string | number) =>
      Get(byId('seller/supplies', id), undefined, protectedRequest),
    ListMyPostsOffers: (params?: MyPostsListParams) =>
      Get('seller/offers', params, protectedRequest),
    myPostOffersDetails: (id: string | number) =>
      Get(byId('seller/offers', id), undefined, protectedRequest),
    counterOffer: (id: string, data: { offered_price: number; note?: string }) =>
      Post(`seller/offers/${id}/counter`, data, protectedRequest),
    acceptOffer: (id: string) =>
      Post(`seller/offers/${id}/accept`, undefined, protectedRequest),
    rejectOffer: (id: string) =>
      Post(`seller/offers/${id}/reject`, undefined, protectedRequest),
    listNotifications: (params?: { limit?: number; offset?: number }) =>
      Get('seller/notifications', params, protectedRequest),
    markNotificationRead: (id: string) =>
      Patch(`seller/notifications/${id}/read`, undefined, protectedRequest),
    markAllNotificationsRead: () =>
      Patch('seller/notifications/read-all', undefined, protectedRequest),
    // get category form
    getSellerCategoryform: (id: string) =>
      Get(byId('public/seller/form', id), undefined),
    // submit supply request
    createSupplyPost: (data?: any) =>
      Post('seller/supplies/create', data, protectedRequest),
  },
};

export default api;
