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
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useAppDispatch } from '../../../store';
import { setRegisterPhone } from '../../../store/slices/registerSlice';
import { AppIcon } from '../../../assets/icons';
import AuthStatusBar from '../components/AuthStatusBar';

type Props = NativeStackScreenProps<RootStackParamList, 'Phone'>;

const GREEN = '#217A3C';
const DARK_GREEN = '#145228';

const PhoneScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const [phone, setPhone] = useState('');
  const canContinue = phone.length >= 10;

  const handleSendOtp = () => {
    if (!canContinue) return;
    dispatch(setRegisterPhone(phone));
    navigation.navigate('OTP', { phone });
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <AuthStatusBar />
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <AppIcon name="back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.titleRow}>
          <View style={styles.iconBox}>
            <AppIcon name="phone" size={22} color="#fff" />
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.headerTitle}>Enter Phone Number</Text>
            <Text style={styles.headerSubtitle}>
              We'll send you a verification code
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.mb16}>
          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.phoneRow}>
            <View style={styles.prefixBox}>
              <Text style={styles.prefixText}>🇵🇰 +92</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="3XX XXXXXXX"
              placeholderTextColor="#9CA3AF"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={11}
            />
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>ℹ</Text>
          <Text style={styles.infoText}>
            Your number is used for account security and trade notifications
            only. We never share it with buyers/sellers.
          </Text>
        </View>

        <View style={styles.spacer} />

        <TouchableOpacity
          onPress={handleSendOtp}
          style={[styles.ctaBtn, !canContinue && styles.ctaDisabled]}
          activeOpacity={0.88}
          disabled={!canContinue}
        >
          <Text style={styles.ctaText}>→ Send OTP</Text>
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
          >
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: DARK_GREEN,
    paddingTop: 48,
    paddingLeft: 16,
    paddingRight: 24,
    paddingBottom: 32,
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    top: 44,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    padding: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginTop: 50,
  },
  iconBox: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 6,
  },
  scroll: {
    padding: 24,
    paddingTop: 28,
    paddingBottom: 40,
    flexGrow: 1,
  },
  mb16: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  phoneRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  prefixBox: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
  },
  prefixText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
  },
  infoCard: {
    backgroundColor: '#F2FBF5',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoIcon: { color: GREEN, fontSize: 16, marginTop: 1 },
  infoText: { flex: 1, fontSize: 12, color: DARK_GREEN, lineHeight: 18 },
  spacer: { flex: 1, minHeight: 24 },
  ctaBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: '#2E9E52',
    shadowOpacity: 0.27,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  ctaDisabled: { opacity: 0.5, shadowOpacity: 0, elevation: 0 },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: { fontSize: 13, color: '#6B7280' },
  loginLink: { fontSize: 13, color: GREEN, fontWeight: '700' },
});

export default PhoneScreen;
