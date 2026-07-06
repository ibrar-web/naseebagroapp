import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useAppDispatch } from '../../../store';
import { setRegisterBasicInfo } from '../../../store/slices/registerSlice';
import AuthStatusBar from '../components/AuthStatusBar';

type Props = NativeStackScreenProps<RootStackParamList, 'BasicInfo'>;

const GREEN = '#217A3C';
const DARK_GREEN = '#145228';
const STEP_TOTAL = 5;
const STEP_ACTIVE = 0;

const BasicInfoScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });

  const canContinue =
    form.name.length > 2 &&
    form.email.includes('@') &&
    form.password.length >= 8 &&
    form.password === form.confirm;

  const set = (key: keyof typeof form) => (val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleContinue = () => {
    dispatch(
      setRegisterBasicInfo({
        fullName: form.name,
        email: form.email,
        password: form.password,
        dateOfBirth: '',
      }),
    );
    navigation.navigate('BizInfo');
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
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        {/* Step dots */}
        <View style={styles.dotsRow}>
          {Array.from({ length: STEP_TOTAL }).map((_, i) => (
            <Text
              key={i}
              style={[
                styles.dot,
                i <= STEP_ACTIVE ? styles.dotActive : styles.dotInactive,
              ]}
            >
              {i <= STEP_ACTIVE ? '●' : '○'}
            </Text>
          ))}
        </View>

        <Text style={styles.headerTitle}>Basic Information</Text>
        <Text style={styles.headerSubtitle}>Step 1 of 5 — Personal Details</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {[
          {
            label: 'Full Name',
            key: 'name' as const,
            placeholder: 'Muhammad Asad Khan',
            keyboardType: 'default' as const,
            secure: false,
            autoCapitalize: 'words' as const,
          },
          {
            label: 'Email Address',
            key: 'email' as const,
            placeholder: 'asad@example.com',
            keyboardType: 'email-address' as const,
            secure: false,
            autoCapitalize: 'none' as const,
          },
          {
            label: 'Password',
            key: 'password' as const,
            placeholder: 'Create a strong password',
            keyboardType: 'default' as const,
            secure: true,
            autoCapitalize: 'none' as const,
          },
          {
            label: 'Confirm Password',
            key: 'confirm' as const,
            placeholder: 'Re-enter password',
            keyboardType: 'default' as const,
            secure: true,
            autoCapitalize: 'none' as const,
          },
        ].map(field => (
          <View key={field.key} style={styles.fieldGroup}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={styles.input}
              placeholder={field.placeholder}
              placeholderTextColor="#9CA3AF"
              value={form[field.key]}
              onChangeText={set(field.key)}
              keyboardType={field.keyboardType}
              secureTextEntry={field.secure}
              autoCapitalize={field.autoCapitalize}
            />
          </View>
        ))}

        <View style={styles.spacer} />

        <TouchableOpacity
          onPress={handleContinue}
          style={[styles.ctaBtn, !canContinue && styles.ctaDisabled]}
          disabled={!canContinue}
          activeOpacity={0.88}
        >
          <Text style={styles.ctaText}>→ Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: DARK_GREEN,
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 28,
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
  backArrow: { color: '#fff', fontSize: 18 },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
  },
  dot: { fontSize: 14 },
  dotActive: { color: '#F3CD03' },
  dotInactive: { color: 'rgba(255,255,255,0.267)', fontSize: 10 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.533)',
    marginTop: 4,
  },
  scroll: {
    padding: 24,
    paddingTop: 24,
    paddingBottom: 40,
    flexGrow: 1,
  },
  fieldGroup: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
  },
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
  },
  ctaDisabled: { opacity: 0.5, shadowOpacity: 0, elevation: 0 },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});

export default BasicInfoScreen;
