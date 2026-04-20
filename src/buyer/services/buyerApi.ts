import { apiClient } from '../../utils/axiosConfig';

export const buyerApi = {
  getDeals: () => apiClient.get('/buyer/deals'),
};
