import { apiClient } from '../../utils/axiosConfig';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints';

export const marketplaceApi = {
  getListings: (params?: Record<string, unknown>) => apiClient.get(API_ENDPOINTS.marketplace.list, { params }),
  getDetail: (id: string) => apiClient.get(API_ENDPOINTS.marketplace.detail(id)),
  createRequest: (payload: Record<string, unknown>) => apiClient.post(API_ENDPOINTS.marketplace.createRequest, payload),
  getDeals: () => apiClient.get(API_ENDPOINTS.marketplace.deals),
  getRates: () => apiClient.get(API_ENDPOINTS.marketplace.rates),
};
