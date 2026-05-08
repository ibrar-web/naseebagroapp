import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useTranslation } from '../../../localization';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const WelcomeScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Hero */}
      <View className="flex-1 bg-green-800 items-center justify-center overflow-hidden px-6">
        <View
          className="absolute rounded-full bg-green-700 opacity-25"
          style={{ width: 200, height: 200, top: -50, right: -50 }}
        />
        <View
          className="absolute rounded-full bg-orange-500 opacity-10"
          style={{ width: 140, height: 140, bottom: -30, left: -30 }}
        />

        <Text style={{ fontSize: 64, marginBottom: 12 }}>🌾</Text>
        <Text
          className="text-white text-4xl font-extrabold"
          style={{ letterSpacing: -0.5 }}
        >
          naseeb
        </Text>
        <Text
          className="text-gold font-bold mt-1"
          style={{ fontSize: 11, letterSpacing: 4 }}
        >
          AGRI MARKET
        </Text>
        <Text className="text-green-300 text-sm mt-4 text-center leading-5">
          {t('auth.welcomeTagline')}
        </Text>

        {/* Feature pills */}
        <View className="flex-row gap-2 mt-6 flex-wrap justify-center">
          {[
            `🔒 ${t('auth.verified')}`,
            `📊 ${t('auth.liveRates')}`,
            `🤝 ${t('auth.secureDeals')}`,
          ].map(f => (
            <View
              key={f}
              className="px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: 'rgba(255,255,255,0.12)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)',
              }}
            >
              <Text className="text-white text-xs font-medium">{f}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* CTA card */}
      <View
        className="bg-white px-6 pt-8 pb-10 gap-3"
        style={{
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          shadowColor: '#000',
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('Phone')}
          className="bg-green-700 py-4 rounded-2xl items-center"
          activeOpacity={0.88}
        >
          <Text className="text-white text-base font-bold">
            {t('auth.createAccount')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          className="py-4 rounded-2xl items-center border-2 border-green-700"
          activeOpacity={0.88}
        >
          <Text className="text-green-700 text-base font-bold">
            {t('auth.login')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('MainTabs')}
          className="py-3 items-center"
          activeOpacity={0.7}
        >
          <Text className="text-gray-400 text-sm font-medium">
            {t('auth.browseGuest')}
          </Text>
        </TouchableOpacity>

        <Text className="text-gray-400 text-xs text-center leading-4">
          {t('auth.agreementStart')}{' '}
          <Text className="text-green-600">{t('auth.terms')}</Text> &{' '}
          <Text className="text-green-600">{t('auth.privacy')}</Text>
        </Text>
      </View>
    </View>
  );
};

export default WelcomeScreen;
