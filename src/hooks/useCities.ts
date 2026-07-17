import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setCities, selectCities, selectCitiesStale } from '../store/slices/publicDataSlice';
import type { CachedCity } from '../store/slices/publicDataSlice';
import api from '../utils/api';

export const useCities = (): CachedCity[] => {
  const dispatch = useAppDispatch();
  const cities = useAppSelector(selectCities);
  const stale = useAppSelector(selectCitiesStale);

  useEffect(() => {
    if (!stale) return;
    (api.marketplace.public.listCities() as Promise<any>)
      .then((res: any) => {
        const data: CachedCity[] = res?.data ?? [];
        if (data.length > 0) dispatch(setCities(data));
      })
      .catch(() => {});
  }, [stale, dispatch]);

  return cities;
};
