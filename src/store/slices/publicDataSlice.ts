import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../rootReducer';

const CITIES_TTL_MS = 30 * 60_000; // 30 minutes

export interface CachedCity {
  id: string;
  name: string;
  province?: string;
}

interface PublicDataState {
  cities: CachedCity[];
  citiesFetchedAt: number | null;
}

const initialState: PublicDataState = {
  cities: [],
  citiesFetchedAt: null,
};

const publicDataSlice = createSlice({
  name: 'publicData',
  initialState,
  reducers: {
    setCities(state, action: PayloadAction<CachedCity[]>) {
      state.cities = action.payload;
      state.citiesFetchedAt = Date.now();
    },
  },
});

export const { setCities } = publicDataSlice.actions;

export const selectCities = (state: RootState) => state.publicData.cities;
export const selectCitiesStale = (state: RootState) =>
  !state.publicData.citiesFetchedAt ||
  Date.now() - state.publicData.citiesFetchedAt > CITIES_TTL_MS;

export default publicDataSlice.reducer;
