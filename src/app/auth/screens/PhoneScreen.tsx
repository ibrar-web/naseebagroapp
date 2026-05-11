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
import { useAppDispatch } from '../../../store';
import { setRegisterPhone } from '../../../store/slices/registerSlice';
import GreenHeader from '../components/GreenHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'Phone'>;

const PhoneScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [phone, setPhone] = useState('');
  const canContinue = phone.length >= 10;

  const handleContinue = () => {
    dispatch(setRegisterPhone(phone));
    navigation.navigate('Location');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <GreenHeader
        step={t('auth.phoneStep')}
        title={t('auth.phoneTitle')}
        subtitle={t('auth.phoneSubtitle')}
        icon="phone"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingTop: 24,
          paddingBottom: 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className=" p-4 mb-5">
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            {t('auth.mobileNumber')}
          </Text>

          <View className="flex-row gap-3 items-center">
            <View className="flex-row items-center gap-2 px-3 py-3.5 rounded-xl bg-gray-50 border border-gray-200">
              <Text style={{ fontSize: 18 }}>🇵🇰</Text>
              <Text className="text-gray-800 text-base font-bold">+92</Text>
            </View>

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
          onPress={handleContinue}
          className={`py-4 rounded-2xl items-center bg-green-700 ${
            !canContinue ? 'opacity-40' : ''
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
            {t('auth.continueNext')}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-5">
          <Text className="text-gray-500 text-sm">
            Already have an account?{' '}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
          >
            <Text className="text-green-700 text-sm font-bold">Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PhoneScreen;
