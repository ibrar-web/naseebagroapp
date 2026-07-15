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
import { resetRegisterForm, setRegisterPayment } from '../../../store/slices/registerSlice';
import { loginSuccess, type User } from '../../../store/slices/authSlice';
import api from '../../../utils/api';
import { AppIcon } from '../../../assets/icons';
import AuthStatusBar from '../components/AuthStatusBar';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentSetup'>;

const GREEN = '#217A3C';
const DARK_GREEN = '#145228';
const YELLOW = '#F3CD03';
const STEP_ACTIVE = 3;
const STEP_TOTAL = 5;

type BankOption = { id: string; name: string };

const isMicrofinanceBank = (name: string): boolean => {
  const lower = name.toLowerCase();
  return (
    lower.includes('easypaisa') ||
    lower.includes('jazzcash') ||
    lower.includes('jazz cash') ||
    lower.includes('sadapay') ||
    lower.includes('sada pay') ||
    lower.includes('nayapay') ||
    lower.includes('naya pay') ||
    lower.includes('microfinance') ||
    lower === 'hugobank' ||
    lower === 'kt bank' ||
    lower.includes('raqami')
  );
};

const PaymentSetupScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const registerForm = useAppSelector(state => state.register);

  const [banks, setBanks] = useState<BankOption[]>([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [form, setForm] = useState({
    bankId: registerForm.bankId ?? '',
    bankName: registerForm.bankName ?? '',
    accountTitle: registerForm.accountTitle ?? '',
    accountNumber: registerForm.accountNumber ?? '',
    iban: registerForm.iban ?? '',
  });
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(setRegisterPayment({ bankId: form.bankId, bankName: form.bankName, accountTitle: form.accountTitle, accountNumber: form.accountNumber, iban: form.iban }));
  }, [form.bankId, form.bankName, form.accountTitle, form.accountNumber, form.iban, dispatch]);

  useEffect(() => {
    api.marketplace.public.listBanks()
      .then((res: any) => {
        const list: BankOption[] = (Array.isArray(res) ? res : res?.data ?? []).map((b: any) => ({ id: b.id, name: b.name }));
        setBanks(list);
      })
      .catch(() => {})
      .finally(() => setBanksLoading(false));
  }, []);

  const filteredBanks = bankSearch.trim()
    ? banks.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase()))
    : banks;

  const isMFBank = isMicrofinanceBank(form.bankName);

  // Microfinance: mobile number as account, no IBAN
  // Standard bank: both account number and IBAN required
  const canSubmit = isMFBank
    ? form.bankId.length > 0 && form.accountTitle.length > 2 && form.accountNumber.length >= 10
    : form.bankId.length > 0 && form.accountTitle.length > 2 && form.accountNumber.length >= 5 && form.iban.length >= 10;

  const handleSubmit = async () => {
    if (loading) return;
    if (!form.bankId) { Alert.alert('Missing Field', 'Please select a bank.'); return; }
    if (form.accountTitle.trim().length < 2) { Alert.alert('Missing Field', 'Please enter your account title.'); return; }
    if (form.accountNumber.trim().length < 5) { Alert.alert('Missing Field', isMFBank ? 'Please enter your mobile / account number.' : 'Please enter your account number.'); return; }
    if (!isMFBank && form.iban.trim().length < 10) { Alert.alert('Missing Field', 'Please enter your IBAN.'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('fullName', registerForm.fullName);
      formData.append('email', registerForm.email);
      formData.append('phone', '+92' + registerForm.phone);
      formData.append('password', registerForm.password);
      formData.append('role', 'user');

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
          bank_id: form.bankId,
          account_title: form.accountTitle,
          bank_account_number: form.accountNumber,
          ...(isMFBank ? {} : { bank_iban_number: form.iban }),
        }),
      ]);

      dispatch(resetRegisterForm());
      navigation.navigate('VerifyPending');
    } catch (err: any) {
      const status = err?.response?.status ?? err?.status;
      const serverMsg: string = err?.response?.data?.message ?? err?.message ?? '';
      if (status === 409 || serverMsg.toLowerCase().includes('already registered')) {
        Alert.alert(
          'Email Already Registered',
          'This email is already registered. Please login and complete your profile.',
          [
            { text: 'Login', onPress: () => navigation.navigate('Login' as any) },
            { text: 'Cancel', style: 'cancel' },
          ],
        );
      } else {
        Alert.alert('Registration Failed', 'Please check your details and try again.');
      }
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
        <Text style={styles.headerTitle}>Payment Method</Text>
        <Text style={styles.headerSubtitle}>Step 4 of 5 — Required for all transactions</Text>
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
            onPress={() => {
              setShowBankPicker(!showBankPicker);
              setBankSearch('');
            }}
            style={styles.selectBtn}
            activeOpacity={0.8}
          >
            <Text style={[styles.selectText, !form.bankName && styles.placeholderText]}>
              {form.bankName || 'Select bank...'}
            </Text>
            <Text style={styles.chevron}>▾</Text>
          </TouchableOpacity>
          {showBankPicker && (
            <View style={styles.pickerCard}>
              <View style={styles.searchRow}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search bank..."
                  placeholderTextColor="#9CA3AF"
                  value={bankSearch}
                  onChangeText={setBankSearch}
                  autoFocus
                />
              </View>
              {banksLoading ? (
                <ActivityIndicator color={GREEN} style={{ paddingVertical: 16 }} />
              ) : (
                <ScrollView
                  style={styles.pickerList}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                >
                  {filteredBanks.map(bank => {
                    const isMF = isMicrofinanceBank(bank.name);
                    return (
                      <TouchableOpacity
                        key={bank.id}
                        onPress={() => {
                          const prevIsMF = isMicrofinanceBank(form.bankName);
                          setForm(p => ({
                            ...p,
                            bankId: bank.id,
                            bankName: bank.name,
                            ...(isMF !== prevIsMF ? { accountNumber: '', iban: '' } : {}),
                          }));
                          setShowBankPicker(false);
                          setBankSearch('');
                        }}
                        style={[
                          styles.pickerItem,
                          form.bankId === bank.id && styles.pickerItemActive,
                        ]}
                        activeOpacity={0.7}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Text
                            style={[
                              styles.pickerItemText,
                              form.bankId === bank.id && styles.pickerItemTextActive,
                            ]}
                          >
                            {bank.name}
                          </Text>
                          {isMF && (
                            <Text style={styles.mfBadge}>Mobile</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                  {filteredBanks.length === 0 && (
                    <Text style={styles.emptyText}>No banks found</Text>
                  )}
                </ScrollView>
              )}
            </View>
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
            onChangeText={v => setForm(p => ({ ...p, accountTitle: v.replace(/[^a-zA-Z\s]/g, '') }))}
            autoCapitalize="words"
          />
        </View>

        {isMFBank ? (
          /* Microfinance (Easypaisa, JazzCash, SadaPay, Naya Pay): mobile number as account, no IBAN */
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Mobile / Account Number</Text>
            <TextInput
              style={styles.input}
              placeholder="03XX XXXXXXX"
              placeholderTextColor="#9CA3AF"
              value={form.accountNumber}
              onChangeText={v => setForm(p => ({ ...p, accountNumber: v.replace(/[^0-9]/g, '') }))}
              keyboardType="numeric"
            />
          </View>
        ) : (
          /* Standard bank: account number + IBAN both required */
          <>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Account Number</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 0123456789"
                placeholderTextColor="#9CA3AF"
                value={form.accountNumber}
                onChangeText={v => setForm(p => ({ ...p, accountNumber: v.replace(/[^0-9]/g, '') }))}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>IBAN</Text>
              <TextInput
                style={styles.input}
                placeholder="PK00XXXX0000000000000000"
                placeholderTextColor="#9CA3AF"
                value={form.iban}
                onChangeText={v => setForm(p => ({ ...p, iban: v.toUpperCase().replace(/[^A-Z0-9]/g, '') }))}
                autoCapitalize="characters"
              />
            </View>
          </>
        )}

        <View style={styles.spacer} />

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit || loading}
          style={[styles.submitBtn, (!canSubmit || loading) && styles.submitDisabled]}
          activeOpacity={0.88}
        >
          {loading ? (
            <ActivityIndicator color={DARK_GREEN} />
          ) : (
            <>
              <Text style={styles.submitText}>Submit Registration</Text>
              <AppIcon name="arrowRight" size={18} color={DARK_GREEN} />
            </>
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
  dotsRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  dot: { fontSize: 14 },
  dotActive: { color: '#F3CD03' },
  dotInactive: { color: 'rgba(255,255,255,0.267)', fontSize: 10 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 50 },
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  searchRow: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchInput: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    fontSize: 14,
    color: '#111827',
  },
  pickerList: { maxHeight: 200 },
  pickerItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerItemActive: { backgroundColor: '#F0FDF4' },
  pickerItemText: { fontSize: 14, color: '#374151' },
  pickerItemTextActive: { color: GREEN, fontWeight: '600' },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 13,
    paddingVertical: 20,
  },
  mfBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7C3AED',
    backgroundColor: '#F4F0FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  spacer: { flex: 1, minHeight: 24 },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
