import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const WelcomeScreen = ({ navigation }: Props) => (
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
        Connect buyers and sellers across{'\n'}Pakistan's agricultural commodity
        markets
      </Text>

      {/* Feature pills */}
      <View className="flex-row gap-2 mt-6 flex-wrap justify-center">
        {['🔒 Verified', '📊 Live Rates', '🤝 Secure Deals'].map(f => (
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
        <Text className="text-white text-base font-bold">Create Account</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('Phone')}
        className="py-4 rounded-2xl items-center border-2 border-green-700"
        activeOpacity={0.88}
      >
        <Text className="text-green-700 text-base font-bold">Log In</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('MainTabs')}
        className="py-3 items-center"
        activeOpacity={0.7}
      >
        <Text className="text-gray-400 text-sm font-medium">
          Browse as Guest
        </Text>
      </TouchableOpacity>

      <Text className="text-gray-400 text-xs text-center leading-4">
        By continuing you agree to our{' '}
        <Text className="text-green-600">Terms of Service</Text> &{' '}
        <Text className="text-green-600">Privacy Policy</Text>
      </Text>
    </View>
  </View>
);

export default WelcomeScreen;
