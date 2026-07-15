import React, { useState, useEffect } from 'react';
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
import { useAppDispatch, useAppSelector } from '../../../store';
import { setRegisterBasicInfo } from '../../../store/slices/registerSlice';
import { AppIcon } from '../../../assets/icons';
import { Feather } from '../../../assets/icons/feather';
import AuthStatusBar from '../components/AuthStatusBar';

type Props = NativeStackScreenProps<RootStackParamList, 'BasicInfo'>;

const GREEN = '#217A3C';
const DARK_GREEN = '#145228';
const STEP_TOTAL = 5;
const STEP_ACTIVE = 0;

const BasicInfoScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const saved = useAppSelector(s => s.register);
  const [form, setForm] = useState({
    name: saved.fullName,
    email: saved.email,
    password: saved.password,
    confirm: saved.password,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    dispatch(setRegisterBasicInfo({ fullName: form.name, email: form.email, password: form.password, dateOfBirth: '' }));
  }, [form.name, form.email, form.password, dispatch]);

  const confirmError = form.confirm.length > 0 && form.confirm !== form.password;

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
          <AppIcon name="back" size={20} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Basic Information</Text>
        <Text style={styles.headerSubtitle}>Step 1 of 5 — Personal Details</Text>
        <View style={styles.dotsRow}>
          {Array.from({ length: STEP_TOTAL }).map((_, i) => (
            <Text
              key={i}
              style={[styles.dot, i <= STEP_ACTIVE ? styles.dotActive : styles.dotInactive]}
            >
              {i <= STEP_ACTIVE ? '●' : '○'}
            </Text>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Full Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Muhammad Asad Khan"
            placeholderTextColor="#9CA3AF"
            value={form.name}
            onChangeText={set('name')}
            autoCapitalize="words"
          />
        </View>

        {/* Email */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="asad@example.com"
            placeholderTextColor="#9CA3AF"
            value={form.email}
            onChangeText={set('email')}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.inputWithEye}
              placeholder="Create a strong password"
              placeholderTextColor="#9CA3AF"
              value={form.password}
              onChangeText={set('password')}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(v => !v)}
              style={styles.eyeBtn}
              activeOpacity={0.7}
            >
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={[styles.inputWrapper, confirmError && styles.inputWrapperError]}>
            <TextInput
              style={styles.inputWithEye}
              placeholder="Re-enter password"
              placeholderTextColor="#9CA3AF"
              value={form.confirm}
              onChangeText={set('confirm')}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowConfirm(v => !v)}
              style={styles.eyeBtn}
              activeOpacity={0.7}
            >
              <Feather name={showConfirm ? 'eye-off' : 'eye'} size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          {confirmError && (
            <Text style={styles.errorText}>Passwords do not match</Text>
          )}
        </View>

        <View style={styles.spacer} />

        <TouchableOpacity
          onPress={handleContinue}
          style={[styles.ctaBtn, !canContinue && styles.ctaDisabled]}
          disabled={!canContinue}
          activeOpacity={0.88}
        >
          <Text style={styles.ctaText}>Continue</Text>
          <AppIcon name="arrowRight" size={18} color="#fff" />
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
  dotsRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  dot: { fontSize: 14 },
  dotActive: { color: '#F3CD03' },
  dotInactive: { color: 'rgba(255,255,255,0.267)', fontSize: 10 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 50 },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.533)', marginTop: 4 },
  scroll: { padding: 24, paddingTop: 24, paddingBottom: 40, flexGrow: 1 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  inputWrapperError: { borderColor: '#EF4444' },
  inputWithEye: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
  },
  eyeBtn: { paddingHorizontal: 14, paddingVertical: 12 },
  errorText: { fontSize: 12, color: '#EF4444', marginTop: 5 },
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
  },
  ctaDisabled: { opacity: 0.5, shadowOpacity: 0, elevation: 0 },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});

export default BasicInfoScreen;
