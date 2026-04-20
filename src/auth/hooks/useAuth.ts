import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginSuccess, logout } from '../../store/slices/authSlice';
import { authApi } from '../services/authApi';
import { saveSession } from '../services/sessionService';
import { LoginPayload } from '../types/auth.types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((s) => s.auth);

  const login = async (payload: LoginPayload) => {
    const { data } = await authApi.login(payload);
    await saveSession(data.tokens);
    dispatch(loginSuccess({ user: data.user, tokens: data.tokens }));
  };

  const signOut = async () => {
    dispatch(logout());
  };

  return { ...authState, login, signOut };
};
