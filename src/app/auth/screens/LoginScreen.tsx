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
import EncryptedStorage from 'react-native-encrypted-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useAppDispatch } from '../../../store';
import { loginSuccess, type User } from '../../../store/slices/authSlice';
import api from '../../../utils/api';

const WINDOW_HEIGHT = Dimensions.get('window').height;

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();

  const [usePhone, setUsePhone] = useState(true);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputValid = usePhone ? phone.length >= 10 : email.includes('@');
  const canSignIn = inputValid && pin.length >= 4;

  const handleSignIn = async () => {
    if (!canSignIn || loading) {
      return;
    }
    setLoading(true);
    try {
      const payload: Record<string, string> = { password: pin };
      if (usePhone) {
        payload.phone = '+92' + phone;
      } else {
        payload.email = email;
      }
      console.log('payload', payload);
      // api returns the full envelope: { status, message, data: { access_token, user } }
      const result = (await api.auth.login(payload)) as any;
      const { access_token, user }: { access_token: string; user: User } =
        result.data;
      console.log('access_token, user:', access_token, user);
      await EncryptedStorage.setItem('session', JSON.stringify({ token: access_token, user }));
      dispatch(loginSuccess({ user, token: access_token }));
      navigation.replace('MainTabs');
    } catch (error) {
      console.log('error :', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.root}
    >
      <StatusBar barStyle="light-content" backgroundColor="white" />

      {/* ── Green hero ── */}
      <View style={styles.hero}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoUrdu}>نصیب</Text>
          <Text style={styles.logoAgri}>AGRI</Text>
        </View>
        <Text style={styles.heroTitle}>Welcome Back</Text>
        <Text className="text-green-300 text-center text-sm mt-2">
          Sign in to your Naseeb account
        </Text>
      </View>

      {/* ── White card ── */}
      <View className="bg-white" style={styles.card}>
        <ScrollView
          contentContainerStyle={styles.cardScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-gray-900 text-2xl font-extrabold mb-5">
            Sign In
          </Text>

          {/* ── Phone / Email toggle ── */}
          <View style={styles.toggle}>
            <TouchableOpacity
              onPress={() => setUsePhone(true)}
              style={[styles.toggleBtn, usePhone && styles.toggleBtnActive]}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.toggleText, usePhone && styles.toggleTextActive]}
              >
                Phone
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setUsePhone(false)}
              style={[styles.toggleBtn, !usePhone && styles.toggleBtnActive]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.toggleText,
                  !usePhone && styles.toggleTextActive,
                ]}
              >
                Email
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Input ── */}
          {usePhone ? (
            <>
              <Text className="text-gray-700 text-sm font-bold mb-2">
                Phone Number
              </Text>
              <View
                className="border border-gray-200 rounded-2xl flex-row items-center mb-5 bg-gray-50"
                style={styles.inputRow}
              >
                <Text className="text-gray-900 font-bold text-base px-4">
                  +92
                </Text>
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
            </>
          ) : (
            <>
              <Text className="text-gray-700 text-sm font-bold mb-2">
                Email Address
              </Text>
              <View
                className="border border-gray-200 rounded-2xl flex-row items-center mb-5 bg-gray-50"
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
            </>
          )}

          {/* ── PIN / Password ── */}
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

          {/* ── Forgot PIN ── */}
          <TouchableOpacity className="self-end mb-6" activeOpacity={0.7}>
            <Text className="text-green-700 text-sm font-bold">
              Forgot PIN?
            </Text>
          </TouchableOpacity>

          {/* ── Sign In button ── */}
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

          {/* ── Create account ── */}
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
  root: {
    backgroundColor: 'rgb(13, 59, 31)',
    flex: 1,
    justifyContent: 'space-between',
  },
  hero: {
    paddingTop: 60,
    paddingBottom: 48,
    alignItems: 'center',
    backgroundColor: 'rgb(13, 59, 31)',
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
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
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  card: {
    height: WINDOW_HEIGHT * 0.68,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  cardScroll: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40 },
  // toggle
  toggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#9CA3AF' },
  toggleTextActive: { color: '#15803d', fontWeight: '700' },
  // inputs
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
