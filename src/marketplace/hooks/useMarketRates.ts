import { useEffect } from 'react';
import { marketplaceApi } from '../services/marketplaceApi';

export const useMarketRates = () => {
  useEffect(() => {
    marketplaceApi.getRates().catch(() => undefined);
  }, []);
};
