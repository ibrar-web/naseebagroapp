import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useTranslation } from '../../../localization';

type Props = NativeStackScreenProps<RootStackParamList, 'OTP'>;

const OTPScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const { phone } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChange = (val: string, idx: number) => {
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const isComplete = otp.every(d => d !== '');

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="white" />
      {/* Header */}
      <View className="bg-green-800 pt-12 pb-8 px-5 overflow-hidden">

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
          {t('auth.otpStep')}
        </Text>
        <Text className="text-white text-3xl font-extrabold leading-9">
          {t('auth.otpTitle')}
        </Text>
        <Text className="text-green-300 text-sm mt-2">
          {t('auth.codeSentTo')}{' '}
          <Text className="text-orange-400 font-bold">+92 {phone}</Text>
        </Text>
      </View>

      <View className="p-4 pt-8 bg-white flex-1">
        {/* OTP card */}
        <View
          className="bg-white rounded-2xl px-5 py-6 items-center mb-5"
          style={{
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">
            {t('auth.enterCode')}
          </Text>

          <View className="flex-row gap-3">
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={r => {
                  inputs.current[idx] = r;
                }}
                className={`text-gray-900 text-2xl font-extrabold text-center rounded-xl border-2 ${
                  digit
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
                style={{ width: 44, height: 54 }}
                value={digit}
                onChangeText={v => handleChange(v.slice(-1), idx)}
                onKeyPress={e => handleKeyPress(e, idx)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          <View className="flex-row mt-6">
            <Text className="text-gray-500 text-sm">
              {t('auth.didntReceive')}
            </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text className="text-green-700 text-sm font-bold">
                {t('auth.resendCode')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => navigation.replace('Location')}
          className={`py-4 rounded-2xl items-center bg-green-700 ${
            !isComplete ? 'opacity-40' : ''
          }`}
          activeOpacity={0.88}
          disabled={!isComplete}
          style={{
            shadowColor: '#1A6B34',
            shadowOpacity: isComplete ? 0.3 : 0,
            shadowRadius: 8,
            elevation: isComplete ? 4 : 0,
          }}
        >
          <Text className="text-white text-base font-bold">
            {t('auth.verifyContinue')}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default OTPScreen;
