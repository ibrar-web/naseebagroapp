import { useEffect } from 'react';
import { buyerApi } from '../services/buyerApi';

export const useBuyerDeals = () => {
  useEffect(() => {
    buyerApi.getDeals().catch(() => undefined);
  }, []);
};
