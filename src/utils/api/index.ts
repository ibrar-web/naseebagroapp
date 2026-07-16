import { Get, Post, Patch, Delete } from '../http';

const byId = (basePath: string, id: string | number) => `${basePath}/${id}`;
const protectedRequest = { authRequired: true };
const optionalAuthRequest = { authOptional: true };

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
    sendOtp: (data: { phone: string; channel?: 'sms' | 'whatsapp' }) =>
      Post('auth/otp/send', data),
    verifyOtp: (data: { phone: string; code: string }) =>
      Post('auth/otp/verify', data),
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
    stats: () =>
      Get('profile/personal/stats', undefined, protectedRequest),
    paymentHistory: () =>
      Get('profile/personal/payment-history', undefined, protectedRequest),
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
    addSavedListing: (listingId: string) =>
      Post(`profile/saved-listings/${listingId}`, undefined, protectedRequest),
    removeSavedListing: (listingId: string) =>
      Delete(`profile/saved-listings/${listingId}`, undefined, protectedRequest),
    registerDeviceToken: (data: { token: string; device_name?: string }) =>
      Post('profile/device-token', data, protectedRequest),
    removeDeviceToken: (data: { token: string }) =>
      Post('profile/device-token/remove', data, protectedRequest),
  },

  post: {
    categories: () => Get('post/categories', undefined, protectedRequest),
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
        Get('public/supplies', params, optionalAuthRequest),
      DetailMarketSuppliesListing: (
        id: string | number,
        params?: Record<string, any>,
      ) => Get(byId('public/supplies', id), params, optionalAuthRequest),
      // market place api for seller
      listMarketDemandsListing: (params?: Record<string, any>) =>
        Get('public/demand', params, optionalAuthRequest),
      DetailMarketDemandsListing: (
        id: string | number,
        params?: Record<string, any>,
      ) => Get(byId('public/demand', id), params, optionalAuthRequest),
      listCategories: () => Get('public/categories'),
      listCities: (params?: { province?: string }) =>
        Get('public/cities', params),
      listBanks: () =>
        Get('public/banks'),
      getTradeConfigs: (params?: { type?: string }) =>
        Get('public/trade-configs', params),
    },
  },
  buyer: {
    toggleDemandActive: (id: string) =>
      Patch(`buyer/demands/${id}/toggle-active`, undefined, protectedRequest),
    deleteDemand: (id: string) =>
      Delete(`buyer/demands/${id}`, undefined, protectedRequest),
    sendBuyrequest: (_id: string | number, data?: any) =>
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
    getBuyerCategoryform: (id: string) =>
      Get(byId('public/buyer/form', id), undefined),
    createBuyDemandPost: (data?: any) =>
      Post('buyer/demands/create', data, protectedRequest),
    updateDemandPost: (id: string, data: Record<string, unknown>) =>
      Patch(`buyer/demands/${id}`, data, protectedRequest),
    // ── Deals ──────────────────────────────────────────────────────────────
    listDeals: (params?: { status?: string; search?: string; skip?: number; limit?: number }) =>
      Get('buyer/buydeals', params, protectedRequest),
    getDeal: (id: string) =>
      Get(byId('buyer/buydeals', id), undefined, protectedRequest),
    addPayment: (id: string, data: FormData) =>
      Post(`buyer/buydeals/${id}/payments`, data, protectedRequest),
    getPayments: (id: string) =>
      Get(`buyer/buydeals/${id}/payments`, undefined, protectedRequest),
    updateDealCompany: (id: string, data: { buyer_company_name: string }) =>
      Patch(`buyer/buydeals/${id}/company`, data, protectedRequest),
    getTrucks: (dealId: string) =>
      Get(`buyer/buydeals/${dealId}/trucks`, undefined, protectedRequest),
    updateTruck: (dealId: string, truckId: string, data: { freight_amount?: number; unloaded_weight_tons?: number }) =>
      Patch(`buyer/buydeals/${dealId}/trucks/${truckId}`, data, protectedRequest),
    addTruckDocument: (dealId: string, truckId: string, data: FormData) =>
      Post(`buyer/buydeals/${dealId}/trucks/${truckId}/documents`, data, protectedRequest),
    submitRating: (dealId: string, data: { score: number; note?: string }) =>
      Post(`buyer/ratings/deal/${dealId}`, data, protectedRequest),
    submitDispute: (dealId: string, data: FormData) =>
      Post(`buyer/buydeals/${dealId}/dispute`, data, protectedRequest),
    getDisputes: () =>
      Get('buyer/disputes/my', undefined, protectedRequest),
    getDisputeById: (id: string) =>
      Get(`buyer/disputes/${id}`, undefined, protectedRequest),
  },

  seller: {
    toggleSupplyActive: (id: string) =>
      Patch(`seller/supplies/${id}/toggle-active`, undefined, protectedRequest),
    deleteSupply: (id: string) =>
      Delete(`seller/supplies/${id}`, undefined, protectedRequest),
    sendDemandOffer: (_id: string | number, data?: any) =>
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
    getSellerCategoryform: (id: string) =>
      Get(byId('public/seller/form', id), undefined),
    createSupplyPost: (data?: any) =>
      Post('seller/supplies/create', data, protectedRequest),
    updateSupplyPost: (id: string, data: Record<string, unknown>) =>
      Patch(`seller/supplies/${id}`, data, protectedRequest),
    // ── Deals ──────────────────────────────────────────────────────────────
    listDeals: (params?: { status?: string; search?: string; skip?: number; limit?: number }) =>
      Get('seller/selldeals', params, protectedRequest),
    getDeal: (id: string) =>
      Get(byId('seller/selldeals', id), undefined, protectedRequest),
    getDealTrucks: (id: string) =>
      Get(`seller/selldeals/${id}/trucks`, undefined, protectedRequest),
    addTruck: (id: string, data: { truck_number: string; driver_name?: string; weight_tons?: number }) =>
      Post(`seller/selldeals/${id}/trucks`, data, protectedRequest),
    getDealPayments: (id: string) =>
      Get(`seller/selldeals/${id}/payments`, undefined, protectedRequest),
    addTruckDoc: (dealId: string, truckId: string, data: FormData) =>
      Post(`seller/selldeals/${dealId}/trucks/${truckId}/documents`, data, protectedRequest),
    submitDispute: (dealId: string, data: FormData) =>
      Post(`seller/selldeals/${dealId}/dispute`, data, protectedRequest),
    getDisputes: () =>
      Get('seller/disputes/my', undefined, protectedRequest),
    getDisputeById: (id: string) =>
      Get(`seller/disputes/${id}`, undefined, protectedRequest),
  },

  queries: {
    create: (data: { subject: string; message: string }) =>
      Post('profile/queries', data, protectedRequest),
    list: () =>
      Get('profile/queries', undefined, protectedRequest),
    getById: (id: string) =>
      Get(`profile/queries/${id}`, undefined, protectedRequest),
    sendMessage: (id: string, data: { content: string }) =>
      Post(`profile/queries/${id}/messages`, data, protectedRequest),
  },
};

export default api;
