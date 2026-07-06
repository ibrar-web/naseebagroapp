import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../../store';
import { resetRegisterForm } from '../../../store/slices/registerSlice';
import { loginSuccess, type User } from '../../../store/slices/authSlice';
import api from '../../../utils/api';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentSetup'>;

const GREEN = '#217A3C';
const DARK_GREEN = '#145228';
const YELLOW = '#F3CD03';
const STEP_ACTIVE = 3;
const STEP_TOTAL = 5;

const WALLETS = ['JazzCash', 'Easypaisa', 'SadaPay'];

const PaymentSetupScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const registerForm = useAppSelector(state => state.register);

  const [banks, setBanks] = useState<string[]>([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [form, setForm] = useState({ bank: '', accountTitle: '', iban: '' });
  const [selectedWallets, setSelectedWallets] = useState<string[]>([]);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.marketplace.public.listBanks()
      .then((res: any) => {
        const names: string[] = (res?.data ?? []).map((b: any) => b.name);
        setBanks(names);
      })
      .catch(() => {})
      .finally(() => setBanksLoading(false));
  }, []);

  const toggleWallet = (w: string) =>
    setSelectedWallets(prev =>
      prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w],
    );

  const canSubmit =
    form.bank.length > 0 &&
    form.accountTitle.length > 2 &&
    form.iban.length >= 10;

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('fullName', registerForm.fullName);
      formData.append('email', registerForm.email);
      formData.append('phone', '+92' + registerForm.phone);
      formData.append('password', registerForm.password);
      formData.append('date_of_birth', registerForm.dateOfBirth);
      formData.append('role', registerForm.role);

      if (registerForm.city) formData.append('city', registerForm.city);
      if (registerForm.cnic) formData.append('cnic', registerForm.cnic);
      if (registerForm.businessName || registerForm.businessType) {
        formData.append(
          'business_profile',
          JSON.stringify({
            business_name: registerForm.businessName || undefined,
            business_type: registerForm.businessType || undefined,
          }),
        );
      }
      if (registerForm.cnicFront) {
        formData.append('cnic_front_image', {
          uri: registerForm.cnicFront.uri,
          name: registerForm.cnicFront.name,
          type: 'image/jpeg',
        } as any);
      }
      if (registerForm.cnicBack) {
        formData.append('cnic_back_image', {
          uri: registerForm.cnicBack.uri,
          name: registerForm.cnicBack.name,
          type: 'image/jpeg',
        } as any);
      }

      const result = (await api.auth.register(formData)) as {
        access_token: string;
        user: User;
      };

      await EncryptedStorage.setItem(
        'session',
        JSON.stringify({ token: result.access_token, user: result.user }),
      );
      dispatch(loginSuccess({ user: result.user, token: result.access_token }));

      await Promise.allSettled([
        registerForm.businessName || registerForm.businessType
          ? api.profile.business.update({
              business_name: registerForm.businessName,
              business_type: registerForm.businessType,
            })
          : Promise.resolve(),
        api.profile.banking.create({
          bank_name: form.bank,
          account_title: form.accountTitle,
          bank_account_number: form.iban,
          bank_iban_number: form.iban,
        }),
      ]);

      dispatch(resetRegisterForm());
      navigation.navigate('VerifyPending');
    } catch {
      Alert.alert(
        'Registration Failed',
        'Please check your details and try again.',
      );
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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Payment Method</Text>
        <Text style={styles.headerSubtitle}>Step 4 of 5 — Required for all transactions</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Info card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>ℹ</Text>
          <Text style={styles.infoText}>
            Your bank details are used for payments (buyers) and payouts
            (sellers). Encrypted and secure.
          </Text>
        </View>

        {/* Bank Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Bank Name</Text>
          <TouchableOpacity
            onPress={() => setShowBankPicker(!showBankPicker)}
            style={styles.selectBtn}
            activeOpacity={0.8}
          >
            <Text style={[styles.selectText, !form.bank && styles.placeholderText]}>
              {form.bank || 'Select...'}
            </Text>
            <Text style={styles.chevron}>▾</Text>
          </TouchableOpacity>
          {showBankPicker && (
            <ScrollView
              style={styles.pickerCard}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
            >
              {banksLoading ? (
                <ActivityIndicator color={GREEN} style={{ paddingVertical: 16 }} />
              ) : (
                banks.map(bank => (
                  <TouchableOpacity
                    key={bank}
                    onPress={() => {
                      setForm(p => ({ ...p, bank }));
                      setShowBankPicker(false);
                    }}
                    style={[
                      styles.pickerItem,
                      form.bank === bank && styles.pickerItemActive,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        form.bank === bank && styles.pickerItemTextActive,
                      ]}
                    >
                      {bank}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}
        </View>

        {/* Account Title */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Account Title</Text>
          <TextInput
            style={styles.input}
            placeholder="As per bank records"
            placeholderTextColor="#9CA3AF"
            value={form.accountTitle}
            onChangeText={v => setForm(p => ({ ...p, accountTitle: v }))}
            autoCapitalize="words"
          />
        </View>

        {/* IBAN */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>IBAN / Account Number</Text>
          <TextInput
            style={styles.input}
            placeholder="PK00XXXX0000000000000000"
            placeholderTextColor="#9CA3AF"
            value={form.iban}
            onChangeText={v => setForm(p => ({ ...p, iban: v }))}
            autoCapitalize="characters"
          />
        </View>

        {/* Mobile Wallets */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Mobile Wallet{' '}
            <Text style={styles.optional}>(Optional)</Text>
          </Text>
          <View style={styles.walletsRow}>
            {WALLETS.map(w => {
              const active = selectedWallets.includes(w);
              return (
                <TouchableOpacity
                  key={w}
                  onPress={() => toggleWallet(w)}
                  style={[styles.walletBtn, active && styles.walletBtnActive]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.walletText,
                      active && styles.walletTextActive,
                    ]}
                  >
                    {w}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.spacer} />

        {/* Submit — yellow per design */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit || loading}
          style={[styles.submitBtn, (!canSubmit || loading) && styles.submitDisabled]}
          activeOpacity={0.88}
        >
          {loading ? (
            <ActivityIndicator color={DARK_GREEN} />
          ) : (
            <Text style={styles.submitText}>✓ Submit Registration</Text>
          )}
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
  dotsRow: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  dot: { fontSize: 14 },
  dotActive: { color: '#F3CD03' },
  dotInactive: { color: 'rgba(255,255,255,0.267)', fontSize: 10 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.533)',
    marginTop: 4,
  },
  scroll: { padding: 24, paddingTop: 24, paddingBottom: 40, flexGrow: 1 },
  infoCard: {
    backgroundColor: '#FFFDE7',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  infoIcon: { color: '#D4AE02', fontSize: 16, marginTop: 1 },
  infoText: { flex: 1, fontSize: 12, color: '#D4AE02', lineHeight: 18 },
  fieldGroup: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  optional: { fontWeight: '400', color: '#9CA3AF' },
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
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  selectText: { fontSize: 14, color: '#111827' },
  placeholderText: { color: '#9CA3AF' },
  chevron: { color: '#9CA3AF', fontSize: 14 },
  pickerCard: {
    marginTop: 4,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  pickerItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerItemActive: { backgroundColor: '#F0FDF4' },
  pickerItemText: { fontSize: 14, color: '#374151' },
  pickerItemTextActive: { color: GREEN, fontWeight: '600' },
  walletsRow: { flexDirection: 'row', gap: 8 },
  walletBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  walletBtnActive: {
    borderColor: YELLOW,
    backgroundColor: YELLOW,
  },
  walletText: { fontSize: 12, fontWeight: '600', color: '#4B5563' },
  walletTextActive: { color: DARK_GREEN },
  spacer: { flex: 1, minHeight: 24 },
  submitBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: YELLOW,
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: YELLOW,
    shadowOpacity: 0.33,
    shadowRadius: 12,
    elevation: 4,
  },
  submitDisabled: { opacity: 0.5, shadowOpacity: 0, elevation: 0 },
  submitText: { color: DARK_GREEN, fontSize: 15, fontWeight: '700' },
});

export default PaymentSetupScreen;
