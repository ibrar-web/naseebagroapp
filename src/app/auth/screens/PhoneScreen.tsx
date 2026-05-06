import React, { useState } from 'react';
import {
  View, Text, StyleSheet, StatusBar, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { Colors as C, Spacing, Radius, Shadow } from '../../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Phone'>;

const PhoneScreen = ({ navigation }: Props) => {
  const [phone, setPhone] = useState('');

  const handleNext = () => {
    if (phone.length >= 10) {
      navigation.navigate('OTP', { phone });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={C.green900} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.orb} />
        <Text style={styles.stepLabel}>STEP 1 OF 2</Text>
        <Text style={styles.headerTitle}>Enter Your{'\n'}Phone Number</Text>
        <Text style={styles.headerSub}>We'll send you a verification code</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {/* Phone input */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Mobile Number</Text>
          <View style={styles.phoneRow}>
            <View style={styles.countryCode}>
              <Text style={styles.countryFlag}>🇵🇰</Text>
              <Text style={styles.countryCodeText}>+92</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="3XX XXXXXXX"
              placeholderTextColor={C.gray400}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={11}
            />
          </View>
          <Text style={styles.inputHelper}>Enter your 10-11 digit mobile number</Text>
        </View>

        <TouchableOpacity
          onPress={handleNext}
          style={[styles.btnNext, phone.length < 10 && styles.btnNextDisabled]}
          activeOpacity={0.88}
          disabled={phone.length < 10}
        >
          <Text style={styles.btnNextText}>Send OTP →</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PhoneScreen;

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
    width: 38,
    height: 38,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  backIcon:   { fontSize: 18, color: C.white },
  orb: {
    position: 'absolute', top: -40, right: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: C.green700, opacity: 0.25,
  },
  stepLabel:   { fontSize: 11, fontWeight: '700', color: C.gold, letterSpacing: 2, marginBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: C.white, lineHeight: 34 },
  headerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 8 },

  body: { padding: Spacing.base, paddingTop: 28 },

  inputCard: {
    backgroundColor: C.white,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginBottom: 20,
    ...Shadow.sm,
  },
  inputLabel:  { fontSize: 12, fontWeight: '700', color: C.gray600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  phoneRow:    { flexDirection: 'row', gap: 10, alignItems: 'center' },
  countryCode: {
    flexDirection: 'row', gap: 6, alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 14,
    backgroundColor: C.gray50, borderRadius: Radius.md,
    borderWidth: 1, borderColor: C.gray200,
  },
  countryFlag:     { fontSize: 18 },
  countryCodeText: { fontSize: 14, fontWeight: '700', color: C.gray800 },
  phoneInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: C.gray900,
    borderWidth: 1,
    borderColor: C.gray200,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: C.gray50,
  },
  inputHelper: { fontSize: 11, color: C.gray400, marginTop: 8 },

  btnNext: {
    backgroundColor: C.green700,
    paddingVertical: 16,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  btnNextDisabled: { opacity: 0.45 },
  btnNextText: { fontSize: 15, fontWeight: '700', color: C.white },
});
