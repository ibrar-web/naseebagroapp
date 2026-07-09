import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import AuthStatusBar from '../components/AuthStatusBar';
import { AppIcon } from '../../../assets/icons';
import api from '../../../utils/api';

type Props = NativeStackScreenProps<RootStackParamList, 'OTP'>;

const GREEN = '#217A3C';
const RESEND_SECONDS = 45;

const OTPScreen = ({ navigation, route }: Props) => {
  const { phone, channel = 'sms' } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (val: string, idx: number) => {
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const isComplete = otp.every(d => d !== '');

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    try {
      await api.auth.sendOtp({ phone: `+92${phone}`, channel });
      setOtp(['', '', '', '', '', '']);
      setCountdown(RESEND_SECONDS);
      inputs.current[0]?.focus();
    } catch (err: any) {
      Alert.alert(
        'Could not resend OTP',
        err?.response?.data?.message ?? 'Please try again.',
      );
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    if (!isComplete || verifying) return;
    setVerifying(true);
    try {
      const code = otp.join('');
      const res = await api.auth.verifyOtp({ phone: `+92${phone}`, code });
      if (res?.data?.valid) {
        navigation.replace('Location');
      } else {
        Alert.alert('Invalid OTP', 'The code you entered is incorrect or expired.');
        setOtp(['', '', '', '', '', '']);
        inputs.current[0]?.focus();
      }
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  const resendLabel =
    countdown > 0
      ? `Resend in 0:${String(countdown).padStart(2, '0')}`
      : 'Resend Code';

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.statusStrip}>
        <AuthStatusBar />
      </View>

      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.navBack}
          activeOpacity={0.7}
        >
          <AppIcon name="back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Verify Number</Text>
        <View style={styles.navSpacer} />
      </View>

      <View style={styles.body}>
        <View style={styles.center}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>{channel === 'whatsapp' ? '💬' : '📞'}</Text>
          </View>
          <Text style={styles.title}>OTP Verification</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent via {channel === 'whatsapp' ? 'WhatsApp' : 'SMS'} to{'\n'}
            <Text style={styles.phoneHighlight}>+92 {phone}</Text>
          </Text>
        </View>

        <View style={styles.otpRow}>
          {otp.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={r => { inputs.current[idx] = r; }}
              style={[styles.otpBox, digit ? styles.otpBoxFilled : undefined]}
              value={digit}
              onChangeText={v => handleChange(v.slice(-1), idx)}
              onKeyPress={e => handleKeyPress(e, idx)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>Didn't receive? </Text>
          <TouchableOpacity onPress={handleResend} activeOpacity={0.7} disabled={countdown > 0 || resending}>
            {resending ? (
              <ActivityIndicator size="small" color={GREEN} />
            ) : (
              <Text style={[styles.resendLink, countdown > 0 && styles.resendDisabled]}>
                {resendLabel}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.spacer} />

        <TouchableOpacity
          onPress={handleVerify}
          style={[styles.ctaBtn, (!isComplete || verifying) && styles.ctaDisabled]}
          activeOpacity={0.88}
          disabled={!isComplete || verifying}
        >
          {verifying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.ctaText}>Verify & Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  statusStrip: {
    backgroundColor: '#145228',
    height: 38,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#fff',
  },
  navBack: {
    padding: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  navSpacer: { width: 30 },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 40,
  },
  center: { alignItems: 'center', marginBottom: 32 },
  iconCircle: {
    width: 70,
    height: 70,
    backgroundColor: '#E8F7EE',
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconEmoji: { fontSize: 30 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    textAlign: 'center',
  },
  phoneHighlight: { color: '#1F2937', fontWeight: '700' },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  otpBox: {
    width: 46,
    height: 54,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    color: GREEN,
    backgroundColor: '#fff',
  },
  otpBoxFilled: {
    borderColor: GREEN,
    backgroundColor: '#F0FDF4',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 24,
  },
  resendLabel: { fontSize: 13, color: '#6B7280' },
  resendLink: { fontSize: 13, color: GREEN, fontWeight: '600' },
  resendDisabled: { color: '#9CA3AF' },
  spacer: { flex: 1 },
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
  },
  ctaDisabled: { opacity: 0.5, shadowOpacity: 0, elevation: 0 },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});

export default OTPScreen;
