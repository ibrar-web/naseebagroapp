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
  ActivityIndicator,
} from 'react-native';
import { showAlert } from '../../components/toastConfig';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useAppDispatch } from '../../../store';
import { setRegisterPhone } from '../../../store/slices/registerSlice';
import { AppIcon } from '../../../assets/icons';
import AuthStatusBar from '../components/AuthStatusBar';
import api from '../../../utils/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Phone'>;
type Channel = 'sms' | 'whatsapp';

const GREEN = '#217A3C';
const DARK_GREEN = '#145228';

const PhoneScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState<Channel>('sms');
  const [loading, setLoading] = useState(false);

  // Strip leading 0 to get the 10-digit subscriber number
  const normalizePhone = (p: string) => p.startsWith('0') ? p.slice(1) : p;
  const isValidPK = (p: string) => {
    const n = normalizePhone(p);
    return n.length === 10 && n.startsWith('3');
  };
  const canContinue = isValidPK(phone);

  const handleSendOtp = async () => {
    if (!canContinue || loading) return;
    setLoading(true);
    try {
      const normalized = normalizePhone(phone);
      const fullPhone = `+92${normalized}`;
      await api.auth.sendOtp({ phone: fullPhone, channel });
      dispatch(setRegisterPhone(normalized));
      navigation.navigate('OTP', { phone: normalized, channel });
    } catch (err: any) {
      showAlert('error', 'Could not send OTP', err?.response?.data?.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
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
              style={[styles.phoneInput, phone.length > 0 && !canContinue && styles.phoneInputError]}
              placeholder="3XX XXXXXXX"
              placeholderTextColor="#9CA3AF"
              value={phone}
              onChangeText={v => setPhone(v.replace(/[^0-9]/g, ''))}
              keyboardType="phone-pad"
              maxLength={11}
            />
          </View>
          {phone.length > 0 && !canContinue ? (
            <Text style={styles.fieldError}>
              Enter 10 digits starting with 3, or 11 digits starting with 03 — e.g. 03001234567
            </Text>
          ) : (
            <Text style={styles.fieldHint}>
              Format: 03XX XXXXXXX  or  3XX XXXXXXX (Pakistani number)
            </Text>
          )}
        </View>

        <View style={styles.mb16}>
          <Text style={styles.label}>Send via</Text>
          <View style={styles.channelRow}>
            <TouchableOpacity
              style={[styles.channelBtn, channel === 'sms' && styles.channelBtnActive]}
              onPress={() => setChannel('sms')}
              activeOpacity={0.8}
            >
              <Text style={[styles.channelText, channel === 'sms' && styles.channelTextActive]}>
                📱 SMS
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.channelBtn, channel === 'whatsapp' && styles.channelBtnActive]}
              onPress={() => setChannel('whatsapp')}
              activeOpacity={0.8}
            >
              <Text style={[styles.channelText, channel === 'whatsapp' && styles.channelTextActive]}>
                💬 WhatsApp
              </Text>
            </TouchableOpacity>
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
          style={[styles.ctaBtn, (!canContinue || loading) && styles.ctaDisabled]}
          activeOpacity={0.88}
          disabled={!canContinue || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.ctaText}>Send OTP</Text>
              <AppIcon name="arrowRight" size={18} color="#fff" />
            </>
          )}
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
  phoneInputError: {
    borderColor: '#EF4444',
  },
  fieldHint: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
    marginLeft: 2,
  },
  fieldError: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 6,
    marginLeft: 2,
  },
  channelRow: { flexDirection: 'row', gap: 10 },
  channelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  channelBtnActive: {
    borderColor: GREEN,
    backgroundColor: '#F0FDF4',
  },
  channelText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  channelTextActive: { color: GREEN },
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
