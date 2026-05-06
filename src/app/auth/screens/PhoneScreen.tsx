import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useTranslation } from '../../../localization';

type Props = NativeStackScreenProps<RootStackParamList, 'Phone'>;

const PhoneScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const canContinue = phone.length >= 10;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View className="bg-green-800 pt-12 pb-8 px-5 overflow-hidden">
        <View
          className="absolute rounded-full bg-green-700 opacity-25"
          style={{ width: 160, height: 160, top: -40, right: -40 }}
        />

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-xl items-center justify-center mb-5"
          style={{
            backgroundColor: 'rgba(255,255,255,0.12)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.2)',
          }}
          activeOpacity={0.7}
        >
          <Text className="text-white text-lg">←</Text>
        </TouchableOpacity>

        <Text className="text-gold text-xs font-bold tracking-widest mb-2">
          {t('auth.phoneStep')}
        </Text>
        <Text className="text-white text-3xl font-extrabold leading-9">
          {t('auth.phoneTitle')}
        </Text>
        <Text className="text-green-300 text-sm mt-2">
          {t('auth.phoneSubtitle')}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingTop: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Input card */}
        <View
          className="bg-white rounded-2xl p-4 mb-5"
          style={{
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            {t('auth.mobileNumber')}
          </Text>

          <View className="flex-row gap-3 items-center">
            {/* Country code */}
            <View className="flex-row items-center gap-2 px-3 py-3.5 rounded-xl bg-gray-50 border border-gray-200">
              <Text style={{ fontSize: 18 }}>🇵🇰</Text>
              <Text className="text-gray-800 text-base font-bold">+92</Text>
            </View>

            {/* Phone input */}
            <TextInput
              className="flex-1 text-gray-900 text-lg font-bold border border-gray-200 rounded-xl px-4 bg-gray-50"
              style={{ paddingVertical: 12 }}
              placeholder="3XX XXXXXXX"
              placeholderTextColor="#9CA3AF"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={11}
            />
          </View>
          <Text className="text-gray-400 text-xs mt-2">
            {t('auth.phoneHelp')}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('OTP', { phone })}
          className={`py-4 rounded-2xl items-center ${
            canContinue ? 'bg-green-700' : 'bg-green-700 opacity-40'
          }`}
          activeOpacity={0.88}
          disabled={!canContinue}
          style={{
            shadowColor: '#1A6B34',
            shadowOpacity: canContinue ? 0.3 : 0,
            shadowRadius: 8,
            elevation: canContinue ? 4 : 0,
          }}
        >
          <Text className="text-white text-base font-bold">
            {t('auth.sendOtp')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PhoneScreen;
