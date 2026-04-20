import { secureStorage } from '../../utils/storage';
import { AuthTokens } from '../types/auth.types';

const SESSION_KEY = 'auth_session';

export const saveSession = async (tokens: AuthTokens) => {
  await secureStorage.set(SESSION_KEY, tokens);
};

export const getSession = async (): Promise<AuthTokens | null> => {
  return secureStorage.get<AuthTokens>(SESSION_KEY);
};

export const getAccessToken = async (): Promise<string | null> => {
  const session = await getSession();
  return session?.accessToken ?? null;
};

export const clearSession = async () => {
  await secureStorage.remove(SESSION_KEY);
};
