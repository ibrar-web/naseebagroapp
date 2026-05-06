import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { LanguageCode } from '../../localization';

type AppMode = 'buyer' | 'seller';

interface AppState {
  mode: AppMode;
  language: LanguageCode;
  savedListings: string[];
  selectedDealId: string | null;
  selectedListingId: string | null;
}

const initialState: AppState = {
  mode: 'buyer',
  language: 'en',
  savedListings: [],
  selectedDealId: null,
  selectedListingId: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    switchMode: (state, action: PayloadAction<AppMode>) => {
      state.mode = action.payload;
    },
    setLanguage: (state, action: PayloadAction<LanguageCode>) => {
      state.language = action.payload;
    },
    toggleSave: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const idx = state.savedListings.indexOf(id);
      if (idx >= 0) {
        state.savedListings.splice(idx, 1);
      } else {
        state.savedListings.push(id);
      }
    },
    setSelectedDeal: (state, action: PayloadAction<string | null>) => {
      state.selectedDealId = action.payload;
    },
    setSelectedListing: (state, action: PayloadAction<string | null>) => {
      state.selectedListingId = action.payload;
    },
  },
});

export const {
  switchMode,
  setLanguage,
  toggleSave,
  setSelectedDeal,
  setSelectedListing,
} = appSlice.actions;
export default appSlice.reducer;
