import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, StatusBar, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { Colors as C, Spacing, Radius, Shadow } from '../../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'OTP'>;

const OTPScreen = ({ navigation, route }: Props) => {
  const { phone } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChange = (val: string, idx: number) => {
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) { inputs.current[idx + 1]?.focus(); }
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const isComplete = otp.every(d => d !== '');

  const handleVerify = () => {
    if (isComplete) { navigation.replace('MainTabs'); }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={C.green900} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.orb} />
        <Text style={styles.stepLabel}>STEP 2 OF 2</Text>
        <Text style={styles.headerTitle}>Verify Your{'\n'}Number</Text>
        <Text style={styles.headerSub}>
          Code sent to <Text style={styles.phoneHighlight}>+92 {phone}</Text>
        </Text>
      </View>

      <View style={styles.body}>
        <View style={styles.otpCard}>
          <Text style={styles.otpLabel}>Enter 6-Digit Code</Text>
          <View style={styles.otpRow}>
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={r => { inputs.current[idx] = r; }}
                style={[styles.otpBox, digit && styles.otpBoxFilled]}
                value={digit}
                onChangeText={v => handleChange(v.slice(-1), idx)}
                onKeyPress={e => handleKeyPress(e, idx)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                selectTextOnFocus
              />
            ))}
          </View>

          <TouchableOpacity style={styles.resendRow} activeOpacity={0.7}>
            <Text style={styles.resendText}>Didn't receive? </Text>
            <Text style={styles.resendLink}>Resend Code</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleVerify}
          style={[styles.btnVerify, !isComplete && styles.btnVerifyDisabled]}
          activeOpacity={0.88}
          disabled={!isComplete}
        >
          <Text style={styles.btnVerifyText}>Verify & Continue →</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default OTPScreen;

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.gray50 },

  header: {
    backgroundColor: C.green900,
    paddingTop: 54,
    paddingBottom: 32,
    paddingHorizontal: Spacing.base,
    overflow: 'hidden',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  backIcon:       { fontSize: 18, color: C.white },
  orb: {
    position: 'absolute', top: -40, right: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: C.green700, opacity: 0.25,
  },
  stepLabel:      { fontSize: 11, fontWeight: '700', color: C.gold, letterSpacing: 2, marginBottom: 8 },
  headerTitle:    { fontSize: 28, fontWeight: '800', color: C.white, lineHeight: 34 },
  headerSub:      { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 8 },
  phoneHighlight: { color: C.orange400, fontWeight: '700' },

  body: { padding: Spacing.base, paddingTop: 28 },

  otpCard: {
    backgroundColor: C.white,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginBottom: 20,
    alignItems: 'center',
    ...Shadow.sm,
  },
  otpLabel: { fontSize: 12, fontWeight: '700', color: C.gray600, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 0.5 },
  otpRow:   { flexDirection: 'row', gap: 10 },
  otpBox: {
    width: 46, height: 56, borderRadius: Radius.md,
    borderWidth: 2, borderColor: C.gray200,
    fontSize: 22, fontWeight: '800', color: C.gray900,
    backgroundColor: C.gray50,
  },
  otpBoxFilled: { borderColor: C.green600, backgroundColor: C.green50 },
  resendRow: { flexDirection: 'row', marginTop: 20 },
  resendText: { fontSize: 13, color: C.gray500 },
  resendLink: { fontSize: 13, color: C.green700, fontWeight: '700' },

  btnVerify: {
    backgroundColor: C.green700,
    paddingVertical: 16,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  btnVerifyDisabled: { opacity: 0.45 },
  btnVerifyText:     { fontSize: 15, fontWeight: '700', color: C.white },
});
