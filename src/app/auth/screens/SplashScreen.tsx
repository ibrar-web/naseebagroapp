import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useTranslation } from '../../../localization';
import { useAppDispatch } from '../../../store';
import { loginSuccess, updateUser } from '../../../store/slices/authSlice';
import type { User } from '../../../store/slices/authSlice';
import api from '../../../utils/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SplashScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const restoreSession = async () => {
      // Keep splash visible for at least 1.2s
      const [raw] = await Promise.all([
        EncryptedStorage.getItem('session').catch(() => null),
        new Promise<void>(resolve => setTimeout(() => resolve(), 1200)),
      ]);

      if (raw) {
        try {
          const { token, user }: { token: string; user: User } =
            JSON.parse(raw);
          if (token && user) {
            dispatch(loginSuccess({ user, token }));
            navigation.replace('MainTabs');
            // Refresh user data from server in background
            api.auth.getCurrentUser()
              .then((res: any) => {
                const fresh: Partial<User> = res?.data ?? res ?? {};
                if (fresh.id) dispatch(updateUser(fresh));
              })
              .catch(() => {});
            return;
          }
        } catch {
          // Corrupted session data should not block guest browsing.
        }
        await EncryptedStorage.removeItem('session').catch(() => null);
      }
      navigation.replace('MainTabs');
    };

    restoreSession();
  }, [dispatch, navigation]);

  return (
    <View className="flex-1 bg-green-800 items-center justify-center overflow-hidden">
      {/* Decorative orbs */}
      <View
        className="absolute rounded-full bg-green-700 opacity-25"
        style={{ width: 240, height: 240, top: -60, right: -60 }}
      />
      <View
        className="absolute rounded-full bg-orange-500 opacity-10"
        style={{ width: 160, height: 160, bottom: -40, left: -40 }}
      />

      <Text style={{ fontSize: 72, marginBottom: 20 }}>🌾</Text>
      <Text
        className="text-white text-4xl font-extrabold"
        style={{ letterSpacing: -0.5 }}
      >
        naseeb
      </Text>
      <Text
        className="text-gold font-bold tracking-widest mt-1"
        style={{ fontSize: 12, letterSpacing: 4 }}
      >
        AGRI MARKET
      </Text>
      <Text className="text-green-300 text-sm mt-4 text-center px-10">
        {t('auth.splashTagline')}
      </Text>
    </View>
  );
};

export default SplashScreen;
