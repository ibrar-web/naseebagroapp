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
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useAppDispatch } from '../../../store';
import { loginSuccess, type User } from '../../../store/slices/authSlice';
import api from '../../../utils/api';

const WINDOW_HEIGHT = Dimensions.get('window').height;

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

interface LoginResponse {
  access_token: string;
  user: User;
}

const LoginScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSignIn = (phone.length >= 10 || email.includes('@')) && pin.length >= 4;

  const handleSignIn = async () => {
    if (!canSignIn || loading) {
      return;
    }
    setLoading(true);
    try {
      const payload: Record<string, string> = { password: pin };
      if (email.includes('@')) {
        payload.email = email;
      } else {
        payload.phone = '+92' + phone;
      }

      const data = await api.auth.login<LoginResponse>(payload);
      await AsyncStorage.setItem('authToken', data.access_token);
      await AsyncStorage.setItem('userData', JSON.stringify(data.user));
      dispatch(loginSuccess({ user: data.user, token: data.access_token }));
      navigation.replace('MainTabs');
    } catch {
      // error already shown by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ backgroundColor: 'rgb(13, 59, 31)', flex: 1, justifyContent: 'space-between' }}
    >
      <StatusBar barStyle="light-content" backgroundColor="white" />

      {/* Green hero */}
      <View className="overflow-hidden" style={styles.hero}>
        <View
          className="items-center justify-center rounded-full bg-white"
          style={styles.logoCircle}
        >
          <Text style={styles.logoUrdu}>نصیب</Text>
          <Text style={styles.logoAgri}>AGRI</Text>
        </View>

        <Text
          className="text-white font-extrabold text-center mt-5"
          style={styles.heroTitle}
        >
          Welcome Back
        </Text>
        <Text className="text-green-300 text-center text-sm mt-2">
          Sign in to your Naseeb account
        </Text>
      </View>

      {/* White card */}
      <View className="bg-white" style={styles.card}>
        <ScrollView
          contentContainerStyle={styles.cardScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-gray-900 text-2xl font-extrabold mb-6">
            Sign In
          </Text>

          {/* Phone Number */}
          <Text className="text-gray-700 text-sm font-bold mb-2">
            Phone Number
          </Text>
          <View
            className="border border-gray-200 rounded-2xl flex-row items-center mb-4 bg-gray-50"
            style={styles.inputRow}
          >
            <Text className="text-gray-900 font-bold text-base px-4">+92</Text>
            <View className="w-px bg-gray-200" style={styles.divider} />
            <TextInput
              className="flex-1 text-gray-900 text-base px-4"
              style={styles.inputText}
              placeholder="3XX XXXXXXX"
              placeholderTextColor="#9CA3AF"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={11}
            />
          </View>

          {/* Email */}
          <Text className="text-gray-700 text-sm font-bold mb-2">
            Email
          </Text>
          <View
            className="border border-gray-200 rounded-2xl flex-row items-center mb-4 bg-gray-50"
            style={styles.inputRow}
          >
            <TextInput
              className="flex-1 text-gray-900 text-base px-4"
              style={styles.inputText}
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* PIN / Password */}
          <Text className="text-gray-700 text-sm font-bold mb-2">
            PIN / Password
          </Text>
          <View
            className="border border-gray-200 rounded-2xl flex-row items-center mb-2 bg-gray-50"
            style={styles.inputRow}
          >
            <TextInput
              className="flex-1 text-gray-900 text-base px-4"
              style={styles.inputText}
              placeholder="Enter your PIN"
              placeholderTextColor="#9CA3AF"
              value={pin}
              onChangeText={setPin}
              secureTextEntry={!showPin}
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
            <Text className="text-green-700 text-sm font-bold">
              Forgot PIN?
            </Text>
          </TouchableOpacity>

          {/* Sign In button */}
          <TouchableOpacity
            onPress={handleSignIn}
            disabled={!canSignIn || loading}
            className={`rounded-2xl py-4 items-center bg-green-700 mb-5 ${
              !canSignIn || loading ? 'opacity-50' : ''
            }`}
            style={canSignIn && !loading ? styles.btnShadow : undefined}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-bold">Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Create Account link */}
          <View className="flex-row justify-center">
            <Text className="text-gray-500 text-sm">New to Naseeb? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Phone')}
              activeOpacity={0.7}
            >
              <Text className="text-green-700 text-sm font-bold">
                Create Account
              </Text>
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
    backgroundColor: 'rgb(13, 59, 31)',
  },
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
    height: WINDOW_HEIGHT * 0.65,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  cardScroll: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40 },
  inputRow: { overflow: 'hidden' },
  divider: { height: 24 },
  inputText: { paddingVertical: 16 },
  eyeIcon: { fontSize: 20 },
  btnShadow: {
    shadowColor: '#1A6B34',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
});

export default LoginScreen;
