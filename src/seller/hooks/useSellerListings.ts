import { useEffect } from 'react';
import { sellerApi } from '../services/sellerApi';

export const useSellerListings = () => {
  useEffect(() => {
    sellerApi.getListings().catch(() => undefined);
  }, []);
};
