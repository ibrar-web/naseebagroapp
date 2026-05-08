import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useTranslation } from '../../../localization';

type Props = NativeStackScreenProps<RootStackParamList, 'Phone'>;

const PhoneScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const canSignIn = phone.length >= 10 && pin.length >= 4;

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#145228" />

      {/* Green hero section */}
      <View className="bg-green-800 overflow-hidden" style={styles.hero}>
        {/* Decorative orbs */}
        <View className="absolute rounded-full bg-green-700 opacity-20" style={styles.orb1} />
        <View className="absolute rounded-full bg-green-600 opacity-15" style={styles.orb2} />

        {/* Logo badge */}
        <View className="items-center justify-center" style={styles.logoBadge}>
          <View className="items-center justify-center rounded-full bg-white" style={styles.logoCircle}>
            <Text style={styles.logoUrdu}>نصیب</Text>
            <Text style={styles.logoAgri}>AGRI</Text>
          </View>
        </View>

        <Text className="text-white font-extrabold text-center" style={styles.heroTitle}>
          Welcome Back
        </Text>
        <Text className="text-green-300 text-center text-sm mt-2">
          Sign in to your Naseeb account
        </Text>
      </View>

      {/* White card */}
      <View className="flex-1 bg-white" style={styles.card}>
        <ScrollView
          contentContainerStyle={styles.cardScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-gray-900 text-2xl font-extrabold mb-6">
            {t('auth.login')}
          </Text>

          {/* Phone Number */}
          <Text className="text-gray-700 text-sm font-bold mb-2">
            {t('auth.mobileNumber')}
          </Text>
          <View className="border border-gray-200 rounded-2xl flex-row items-center mb-5 bg-gray-50" style={styles.inputRow}>
            <Text className="text-gray-900 font-bold text-base px-4" style={styles.prefix}>
              +92
            </Text>
            <View className="w-px bg-gray-200" style={styles.divider} />
            <TextInput
              className="flex-1 text-gray-900 text-base px-4"
              style={styles.input}
              placeholder="3XX XXXXXXX"
              placeholderTextColor="#9CA3AF"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={11}
            />
          </View>

          {/* PIN / Password */}
          <Text className="text-gray-700 text-sm font-bold mb-2">
            PIN / Password
          </Text>
          <View className="border border-gray-200 rounded-2xl flex-row items-center mb-2 bg-gray-50" style={styles.inputRow}>
            <TextInput
              className="flex-1 text-gray-900 text-base px-4"
              style={styles.input}
              placeholder="Enter your PIN"
              placeholderTextColor="#9CA3AF"
              value={pin}
              onChangeText={setPin}
              secureTextEntry={!showPin}
              keyboardType="default"
            />
            <TouchableOpacity
              onPress={() => setShowPin(v => !v)}
              className="px-4"
              activeOpacity={0.7}
            >
              <Text style={styles.eyeIcon}>{showPin ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Forgot PIN */}
          <TouchableOpacity className="self-end mb-6" activeOpacity={0.7}>
            <Text className="text-green-700 text-sm font-bold">Forgot PIN?</Text>
          </TouchableOpacity>

          {/* Sign In button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('OTP', { phone })}
            className={`rounded-2xl py-4 items-center bg-green-700 mb-5 ${!canSignIn ? 'opacity-50' : ''}`}
            disabled={!canSignIn}
            style={canSignIn ? styles.btnShadow : undefined}
            activeOpacity={0.88}
          >
            <Text className="text-white text-base font-bold">
              {t('auth.login')}
            </Text>
          </TouchableOpacity>

          {/* Create Account link */}
          <View className="flex-row justify-center">
            <Text className="text-gray-500 text-sm">New to Naseeb? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Location')} activeOpacity={0.7}>
              <Text className="text-green-700 text-sm font-bold">Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  hero: {
    paddingTop: 60,
    paddingBottom: 48,
    alignItems: 'center',
  },
  orb1: { width: 200, height: 200, top: -60, right: -60, position: 'absolute' },
  orb2: { width: 140, height: 140, bottom: -30, left: -30, position: 'absolute' },
  logoBadge: { marginBottom: 20 },
  logoCircle: {
    width: 72,
    height: 72,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  logoUrdu: {
    fontSize: 20,
    fontWeight: '800',
    color: '#145228',
    lineHeight: 26,
  },
  logoAgri: {
    fontSize: 8,
    fontWeight: '700',
    color: '#1A6B34',
    letterSpacing: 2,
  },
  heroTitle: { fontSize: 30 },
  card: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  cardScroll: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40 },
  inputRow: { overflow: 'hidden' },
  prefix: { paddingVertical: 0 },
  divider: { height: 24 },
  input: { paddingVertical: 16 },
  eyeIcon: { fontSize: 20 },
  btnShadow: {
    shadowColor: '#1A6B34',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
});

export default PhoneScreen;
