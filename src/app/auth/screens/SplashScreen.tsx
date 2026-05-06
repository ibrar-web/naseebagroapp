import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SplashScreen = ({ navigation }: Props) => {
  useEffect(() => {
    const t = setTimeout(() => navigation.replace('Welcome'), 2400);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View className="flex-1 bg-green-800 items-center justify-center overflow-hidden">

      {/* Decorative orbs */}
      <View className="absolute rounded-full bg-green-700 opacity-25"
            style={{ width: 240, height: 240, top: -60, right: -60 }} />
      <View className="absolute rounded-full bg-orange-500 opacity-10"
            style={{ width: 160, height: 160, bottom: -40, left: -40 }} />

      <Text style={{ fontSize: 72, marginBottom: 20 }}>🌾</Text>
      <Text className="text-white text-4xl font-extrabold" style={{ letterSpacing: -0.5 }}>
        naseeb
      </Text>
      <Text className="text-gold font-bold tracking-widest mt-1" style={{ fontSize: 12, letterSpacing: 4 }}>
        AGRI MARKET
      </Text>
      <Text className="text-green-300 text-sm mt-4 text-center px-10">
        Pakistan's Trusted Commodity Marketplace
      </Text>
    </View>
  );
};

export default SplashScreen;
