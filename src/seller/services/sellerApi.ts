import { apiClient } from '../../utils/axiosConfig';

export const sellerApi = {
  getListings: () => apiClient.get('/seller/listings'),
};
