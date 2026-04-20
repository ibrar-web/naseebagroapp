import { marketplaceApi } from '../../marketplace/services/marketplaceApi';

export const listingService = {
  getListings: marketplaceApi.getListings,
  getListingDetail: marketplaceApi.getDetail,
};
