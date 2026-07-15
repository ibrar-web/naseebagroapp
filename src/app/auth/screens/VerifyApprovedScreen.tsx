import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useTranslation } from '../../../localization';
import { AppIcon } from '../../../assets/icons';

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyApproved'>;

const VerifyApprovedScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-green-800 items-center justify-center px-6 overflow-hidden">
      <StatusBar barStyle="light-content" backgroundColor="#145228" />

      {/* Decorative orbs */}
      <View
        className="absolute rounded-full bg-green-700 opacity-30"
        style={{ width: 280, height: 280, top: -80, right: -80 }}
      />
      <View
        className="absolute rounded-full bg-orange-500 opacity-15"
        style={{ width: 200, height: 200, bottom: -60, left: -60 }}
      />
      <View
        className="absolute rounded-full bg-green-600 opacity-20"
        style={{ width: 150, height: 150, top: 120, left: -60 }}
      />

      {/* Content */}
      <View className="items-center">
        <View
          className="w-28 h-28 rounded-full bg-white items-center justify-center mb-6"
          style={{ shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, elevation: 8 }}
        >
          <Text style={{ fontSize: 56 }}>✅</Text>
        </View>

        <Text className="text-white text-3xl font-extrabold text-center leading-9">
          {t('auth.verifyApprovedTitle')}
        </Text>
        <Text className="text-green-300 text-base text-center mt-3 leading-6 px-4">
          {t('auth.verifyApprovedSubtitle')}
        </Text>

        {/* Feature pills */}
        <View className="flex-row gap-3 mt-6 flex-wrap justify-center">
          {['🌾 Trade Crops', '💰 Get Paid', '📊 Live Rates'].map(f => (
            <View
              key={f}
              className="px-4 py-2 rounded-full"
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

      <TouchableOpacity
        onPress={() => navigation.replace('MainTabs')}
        className="absolute bottom-12 left-6 right-6 py-4 rounded-2xl bg-orange-500"
        style={{ shadowColor: '#F3CD03', shadowOpacity: 0.45, shadowRadius: 12, elevation: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        activeOpacity={0.88}
      >
        <Text className="text-white text-base font-extrabold">
          {t('auth.startTrading')}
        </Text>
        <AppIcon name="arrowRight" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default VerifyApprovedScreen;
