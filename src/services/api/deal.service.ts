import { marketplaceApi } from '../../marketplace/services/marketplaceApi';

export const dealService = {
  getDeals: marketplaceApi.getDeals,
  createRequest: marketplaceApi.createRequest,
};
