export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    otpVerify: '/auth/otp/verify',
    refresh: '/auth/refresh',
  },
  marketplace: {
    list: '/marketplace/listings',
    detail: (id: string) => `/marketplace/listings/${id}`,
    createRequest: '/marketplace/requests',
    deals: '/marketplace/deals',
    rates: '/marketplace/rates',
  },
  documents: {
    upload: '/documents/upload',
  },
};
