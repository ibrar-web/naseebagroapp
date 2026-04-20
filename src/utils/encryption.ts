import EncryptedStorage from 'react-native-encrypted-storage';

export const encryptAndSet = async <T>(key: string, value: T) => {
  await EncryptedStorage.setItem(key, JSON.stringify(value));
};

export const getAndDecrypt = async <T>(key: string): Promise<T | null> => {
  const raw = await EncryptedStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : null;
};

export const removeEncrypted = async (key: string) => {
  await EncryptedStorage.removeItem(key);
};
