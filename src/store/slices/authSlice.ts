import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserProfile {
  cnic: string | null;
  cnic_front_image_name: string | null;
  cnic_front_image_url: string | null;
  cnic_back_image_name: string | null;
  cnic_back_image_url: string | null;
  business_name: string | null;
  business_type: string | null;
  business_registration_number: string | null;
  primary_crop: string | null;
  farm_size: string | null;
}

export interface UserSettings {
  deal_alerts: boolean;
  offer_updates: boolean;
  payment_dispatch_alerts: boolean;
  promotion_alerts: boolean;
  sms_alerts: boolean;
  language: string;
  currency: string;
  biometric_login_enabled: boolean;
  two_factor_enabled: boolean;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string | null;
  profile_picture: string | null;
  date_of_birth: string | null;
  role: 'buyer' | 'seller';
  is_verified: boolean;
  verified_at: string | null;
  is_active: boolean;
  profile_completion: number;
  created_at: string;
  updated_at: string;
  profile: UserProfile | null;
  settings: UserSettings | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type UserUpdate = Partial<Omit<User, 'profile' | 'settings'>> & {
  profile?: Partial<UserProfile> | null;
  settings?: Partial<UserSettings> | null;
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: state => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{ user: User; token: string }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: state => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: state => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<UserUpdate>) => {
      if (!state.user) {
        return;
      }

      state.user = {
        ...state.user,
        ...action.payload,
        profile:
          action.payload.profile || state.user.profile
            ? {
                ...(state.user.profile ?? {}),
                ...(action.payload.profile ?? {}),
              }
            : null,
        settings:
          action.payload.settings || state.user.settings
            ? {
                ...(state.user.settings ?? {}),
                ...(action.payload.settings ?? {}),
              }
            : null,
      } as User;
    },
    resetAllReduxStates: () => initialState,
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  updateUser,
  resetAllReduxStates,
} = authSlice.actions;

export default authSlice.reducer;
