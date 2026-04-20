import AsyncStorage from '@react-native-async-storage/async-storage';
import { encryptAndSet, getAndDecrypt, removeEncrypted } from './encryption';

const FALLBACK_PREFIX = 'plain_';

export const secureStorage = {
  async set<T>(key: string, value: T) {
    try {
      await encryptAndSet(key, value);
    } catch {
      await AsyncStorage.setItem(`${FALLBACK_PREFIX}${key}`, JSON.stringify(value));
    }
  },

  async get<T>(key: string): Promise<T | null> {
    try {
      return await getAndDecrypt<T>(key);
    } catch {
      const raw = await AsyncStorage.getItem(`${FALLBACK_PREFIX}${key}`);
      return raw ? (JSON.parse(raw) as T) : null;
    }
  },

  async remove(key: string) {
    await Promise.allSettled([
      removeEncrypted(key),
      AsyncStorage.removeItem(`${FALLBACK_PREFIX}${key}`),
    ]);
  },
};
