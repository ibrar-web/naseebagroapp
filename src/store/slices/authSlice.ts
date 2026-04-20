import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Role } from '../../common/constants/roles';
import { clearSession } from '../../auth/services/sessionService';

interface AuthState {
  isAuthenticated: boolean;
  isSessionHydrated: boolean;
  role: Role | null;
  user: { id: string; name: string; role: Role } | null;
  tokens: { accessToken: string; refreshToken: string } | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isSessionHydrated: false,
  role: null,
  user: null,
  tokens: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{
        user: { id: string; name: string; role: Role };
        tokens: { accessToken: string; refreshToken: string };
      }>,
    ) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.role = action.payload.user.role;
      state.tokens = action.payload.tokens;
    },
    logout: (state) => {
      void clearSession();
      state.isAuthenticated = false;
      state.user = null;
      state.role = null;
      state.tokens = null;
    },
    restoreSessionComplete: (state) => {
      state.isSessionHydrated = true;
    },
  },
});

export const { loginSuccess, logout, restoreSessionComplete } = authSlice.actions;
export default authSlice.reducer;
