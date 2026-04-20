import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MarketplaceState {
  listings: Array<Record<string, unknown>>;
  filters: Record<string, unknown>;
  marketRates: Array<Record<string, unknown>>;
}

const initialState: MarketplaceState = {
  listings: [],
  filters: {},
  marketRates: [],
};

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    setListings: (state, action: PayloadAction<Array<Record<string, unknown>>>) => {
      state.listings = action.payload;
    },
    setFilters: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.filters = action.payload;
    },
    setMarketRates: (state, action: PayloadAction<Array<Record<string, unknown>>>) => {
      state.marketRates = action.payload;
    },
  },
});

export const { setListings, setFilters, setMarketRates } = marketplaceSlice.actions;
export default marketplaceSlice.reducer;
