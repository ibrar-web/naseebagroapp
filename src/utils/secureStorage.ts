import EncryptedStorage from 'react-native-encrypted-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FB = '__sec_fb_';

export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try { await EncryptedStorage.setItem(key, value); return; } catch {}
    try { await AsyncStorage.setItem(FB + key, value); } catch {}
  },

  async getItem(key: string): Promise<string | null> {
    try { const val = await EncryptedStorage.getItem(key); if (val !== null) return val; } catch {}
    try { return await AsyncStorage.getItem(FB + key); } catch {}
    return null;
  },

  async removeItem(key: string): Promise<void> {
    try { await EncryptedStorage.removeItem(key); } catch {}
    try { await AsyncStorage.removeItem(FB + key); } catch {}
  },
};
