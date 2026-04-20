import { useState } from 'react';

export const useMarketplaceFilters = () => {
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  return { filters, setFilters };
};
