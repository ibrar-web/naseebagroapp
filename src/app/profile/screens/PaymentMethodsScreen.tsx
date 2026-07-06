import React, { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Alert,
  ActivityIndicator,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { AppIcon } from '../../../assets/icons';
import { useTranslation } from '../../../localization';
import { AppLoader } from '../../components';
import MockStatusBar from '../../components/MockStatusBar';
import api from '../../../utils/api';
import { useAppSelector } from '../../../store';
import { promptLogin } from '../../auth/utils/requireLogin';

type BankingDetail = {
  id: string;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  isPrimary: boolean;
};

type BankingForm = {
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
};

const emptyForm: BankingForm = {
  bankName: '',
  accountTitle: '',
  accountNumber: '',
  iban: '',
};

const isMicrofinanceBank = (name: string): boolean => {
  const lower = name.toLowerCase();
  return (
    lower.includes('microfinance') ||
    lower.includes('easypaisa') ||
    lower === 'hugobank' ||
    lower === 'kt bank' ||
    lower.includes('raqami')
  );
};

const str = (...values: any[]): string => {
  for (const v of values) {
    if (v !== undefined && v !== null) return String(v);
  }
  return '';
};

const parseBankingList = (response: any): any[] => {
  const payload = response?.data ?? response?.result ?? response;
  if (Array.isArray(payload)) return payload;
  for (const key of ['banking', 'banking_details', 'bankingDetails', 'accounts', 'items']) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
};

const normalizeBankingDetails = (response: any): BankingDetail[] =>
  parseBankingList(response)
    .map((item: any) => ({
      id: str(item?.id, item?._id, item?.banking_detail_id),
      bankName: str(item?.bank_name, item?.bankName, item?.bank),
      accountTitle: str(item?.account_title, item?.accountTitle, item?.account_name, item?.accountName),
      accountNumber: str(item?.bank_account_number, item?.account_number, item?.accountNumber),
      iban: str(item?.bank_iban_number, item?.iban, item?.IBAN),
      isPrimary: Boolean(item?.is_primary ?? item?.isPrimary ?? false),
    }))
    .filter((item: BankingDetail) => item.id || item.bankName || item.accountTitle || item.iban);

const maskAccount = (accountNumber: string, iban: string) => {
  const value = accountNumber || iban;
  if (!value) return '';
  return `•••• •••• ${value.slice(-4)}`;
};

const PaymentMethodsScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const token = useAppSelector(s => s.auth.token);
  const [accounts, setAccounts] = useState<BankingDetail[]>([]);
  const [form, setForm] = useState<BankingForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [banks, setBanks] = useState<string[]>([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [bankSearch, setBankSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    api.marketplace.public.listBanks()
      .then((res: any) => {
        const names: string[] = (res?.data ?? []).map((b: any) => b.name);
        setBanks(names);
      })
      .catch(() => {})
      .finally(() => setBanksLoading(false));
  }, []);

  const filteredBanks = bankSearch.trim()
    ? banks.filter(b => b.toLowerCase().includes(bankSearch.toLowerCase()))
    : banks;

  const isMFBank = isMicrofinanceBank(form.bankName);

  const canSubmit =
    form.bankName.trim().length > 0 &&
    form.accountTitle.trim().length > 1 &&
    form.accountNumber.trim().length > 4 &&
    (isMFBank || form.iban.trim().length > 4);

  const loadBankingDetails = useCallback(
    async (isRefresh = false) => {
      if (!token) { setAccounts([]); return; }
      if (!isRefresh) setLoading(true);
      try {
        const response = await api.profile.banking.get();
        setAccounts(normalizeBankingDetails(response));
      } catch {
        setAccounts([]);
      } finally {
        if (!isRefresh) setLoading(false);
      }
    },
    [token],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await loadBankingDetails(true); } finally { setRefreshing(false); }
  }, [loadBankingDetails]);

  useFocusEffect(useCallback(() => { loadBankingDetails(); }, [loadBankingDetails]));

  const startCreate = () => {
    if (!token) { promptLogin(navigation); return; }
    setEditingId(null);
    setForm(emptyForm);
    setShowBankPicker(false);
    setShowForm(true);
  };

  const startEdit = (account: BankingDetail) => {
    if (!token) { promptLogin(navigation); return; }
    setEditingId(account.id);
    setForm({ bankName: account.bankName, accountTitle: account.accountTitle, accountNumber: account.accountNumber, iban: account.iban });
    setShowBankPicker(false);
    setShowForm(true);
  };

  const closeForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
    setShowBankPicker(false);
  };

  const handleSubmit = async () => {
    if (!canSubmit || saving) return;
    if (!token) { promptLogin(navigation); return; }
    const payload = {
      bank_name: form.bankName.trim(),
      account_title: form.accountTitle.trim(),
      bank_account_number: form.accountNumber.trim(),
      bank_iban_number: form.iban.trim(),
    };
    setSaving(true);
    try {
      if (editingId) { await api.profile.banking.update(editingId, payload); }
      else { await api.profile.banking.create(payload); }
      closeForm();
      await loadBankingDetails();
    } catch {
      Alert.alert('Update Failed', 'Please check your banking details.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (account: BankingDetail) => {
    if (!account.id || !token) return;
    Alert.alert('Delete Account', 'Remove this banking detail?', [
      { text: t('payments.cancel'), style: 'cancel' },
      {
        text: t('payments.delete'),
        style: 'destructive',
        onPress: async () => {
          setSaving(true);
          try {
            await api.profile.banking.remove(account.id);
            await loadBankingDetails();
          } catch {
            Alert.alert('Delete Failed', 'Please try again.');
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  const FORM_FIELDS: { label: string; key: keyof BankingForm; keyboard?: any; placeholder?: string }[] = isMFBank
    ? [
        { label: t('payments.accountTitle'), key: 'accountTitle' },
        { label: 'Mobile Number', key: 'accountNumber', keyboard: 'phone-pad', placeholder: '03XX XXXXXXX' },
      ]
    : [
        { label: t('payments.accountTitle'), key: 'accountTitle' },
        { label: t('payments.accountNo'), key: 'accountNumber', keyboard: 'numeric' },
        { label: t('payments.iban'), key: 'iban' },
      ];

  return (
    <View style={s.container}>
      <MockStatusBar backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <AppIcon name="chevronRight" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t('payments.title')}</Text>
        <View style={s.headerSpacer} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1A6B34" colors={['#1A6B34']} />
        }
      >
        <Text style={s.sectionLabel}>{t('payments.linkedBankAccount')}</Text>

        {accounts.length === 0 && !loading && (
          <View style={s.emptyCard}>
            <View style={s.emptyIconBox}>
              <AppIcon name="bank" size={28} color="#1A6B34" />
            </View>
            <Text style={s.emptyTitle}>{t('payments.noBankAccounts')}</Text>
          </View>
        )}

        {accounts.map(account => (
          <View key={account.id || account.iban} style={s.card}>
            {/* Card header row */}
            <View style={s.cardTop}>
              <View style={s.cardIconBox}>
                <AppIcon name="bank" size={20} color="#3B82F6" />
              </View>
              <View style={s.cardInfo}>
                <Text style={s.cardBankName}>{account.bankName || t('payments.bankName')}</Text>
                <Text style={s.cardMasked}>{maskAccount(account.accountNumber, account.iban)}</Text>
              </View>
              {account.isPrimary && (
                <View style={s.primaryBadge}>
                  <Text style={s.primaryText}>PRIMARY</Text>
                </View>
              )}
            </View>

            {/* Detail rows */}
            {[
              { label: t('payments.accountName'), value: account.accountTitle },
              { label: t('payments.accountNo'), value: account.accountNumber },
              { label: t('payments.iban'), value: account.iban },
            ].map(row =>
              row.value ? (
                <View key={row.label} style={s.cardRow}>
                  <Text style={s.cardRowLabel}>{row.label}</Text>
                  <Text style={s.cardRowValue}>{row.value}</Text>
                </View>
              ) : null,
            )}

            {/* Actions */}
            <View style={s.cardActions}>
              <TouchableOpacity onPress={() => startEdit(account)} style={s.editBtn} activeOpacity={0.8}>
                <Text style={s.editBtnText}>{t('payments.edit')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(account)} style={s.deleteBtn} activeOpacity={0.8}>
                <Text style={s.deleteBtnText}>{t('payments.delete')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Add new account button */}
        <TouchableOpacity style={s.addBtn} onPress={startCreate} activeOpacity={0.85}>
          <AppIcon name="add" size={16} color="#1A6B34" />
          <Text style={s.addBtnText}>{t('payments.addNewAccount')}</Text>
        </TouchableOpacity>

        <View style={s.bottomSpacer} />
      </ScrollView>

      {/* Add / Edit bottom sheet */}
      <Modal visible={showForm} transparent animationType="slide" onRequestClose={closeForm}>
        <View style={s.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeForm} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={s.sheet}>
              <View style={s.sheetHandle} />
              <Text style={s.sheetTitle}>
                {editingId ? t('payments.edit') + ' ' + t('payments.bankName') : t('payments.addNewAccount')}
              </Text>
              <Text style={s.sheetSubtitle}>Enter your bank details below</Text>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={s.sheetScroll}>
                {/* Bank picker */}
                <Text style={s.fieldLabel}>{t('payments.bankName')}</Text>
                <TouchableOpacity
                  onPress={() => { setShowBankPicker(p => !p); setBankSearch(''); }}
                  style={s.pickerTrigger}
                  activeOpacity={0.8}
                >
                  <Text style={form.bankName ? s.pickerValue : s.pickerPlaceholder}>
                    {form.bankName || 'Select Bank'}
                  </Text>
                  <AppIcon name="chevronDown" size={16} color="#9CA3AF" />
                </TouchableOpacity>
                {showBankPicker && (
                  <View style={s.pickerCard}>
                    <TextInput
                      style={s.pickerSearch}
                      placeholder="Search bank..."
                      placeholderTextColor="#9CA3AF"
                      value={bankSearch}
                      onChangeText={setBankSearch}
                      autoFocus
                    />
                    {banksLoading ? (
                      <ActivityIndicator color="#1A6B34" style={s.pickerLoader} />
                    ) : (
                      <ScrollView style={s.pickerList} nestedScrollEnabled showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        {filteredBanks.map((bank: string) => (
                          <TouchableOpacity
                            key={bank}
                            onPress={() => {
                            const nextIsMF = isMicrofinanceBank(bank);
                            const prevIsMF = isMicrofinanceBank(form.bankName);
                            setForm(f => ({
                              ...f,
                              bankName: bank,
                              ...(nextIsMF !== prevIsMF ? { accountNumber: '', iban: '' } : {}),
                            }));
                            setShowBankPicker(false);
                            setBankSearch('');
                          }}
                            style={[s.pickerItem, form.bankName === bank && s.pickerItemActive]}
                            activeOpacity={0.75}
                          >
                            <Text style={[s.pickerItemText, form.bankName === bank && s.pickerItemTextActive]}>
                              {bank}
                            </Text>
                          </TouchableOpacity>
                        ))}
                        {filteredBanks.length === 0 && (
                          <Text style={s.pickerEmpty}>No banks found</Text>
                        )}
                      </ScrollView>
                    )}
                  </View>
                )}

                {/* Text fields */}
                {FORM_FIELDS.map(field => (
                  <View key={field.key} style={s.fieldWrap}>
                    <Text style={s.fieldLabel}>{field.label}</Text>
                    <TextInput
                      style={s.fieldInput}
                      value={form[field.key]}
                      onChangeText={val => setForm(f => ({ ...f, [field.key]: val }))}
                      placeholder={field.placeholder ?? field.label}
                      placeholderTextColor="#9CA3AF"
                      keyboardType={field.keyboard ?? 'default'}
                      autoCapitalize={field.key === 'iban' ? 'characters' : 'none'}
                    />
                  </View>
                ))}
              </ScrollView>

              {/* Buttons */}
              <TouchableOpacity
                style={[s.saveBtn, (!canSubmit || saving) && s.saveBtnDisabled]}
                onPress={handleSubmit}
                disabled={!canSubmit || saving}
                activeOpacity={0.85}
              >
                {saving
                  ? <ActivityIndicator color="#0D3B1F" size="small" />
                  : <Text style={[s.saveBtnText, (!canSubmit || saving) && s.saveBtnTextDisabled]}>
                      {editingId ? t('payments.updateAccount') : t('payments.saveAccount')}
                    </Text>
                }
              </TouchableOpacity>
              <TouchableOpacity style={s.cancelSheetBtn} onPress={closeForm} activeOpacity={0.75}>
                <Text style={s.cancelSheetBtnText}>{t('payments.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <AppLoader visible={loading || saving} overlay message={saving ? t('common.updating') : t('common.loading')} />
    </View>
  );
};

const SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.07,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 2 },
  elevation: 3,
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: { padding: 4, borderRadius: 8, transform: [{ rotate: '180deg' }] },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  headerSpacer: { width: 30 },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  bottomSpacer: { height: 20 },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 10,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    ...SHADOW,
  },
  emptyIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F2FBF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...SHADOW,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  cardIconBox: {
    width: 44,
    height: 44,
    backgroundColor: '#EEF6FF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardInfo: { flex: 1 },
  cardBankName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  cardMasked: { fontSize: 12, color: '#6B7280', marginTop: 2, letterSpacing: 1 },
  primaryBadge: { backgroundColor: '#F2FBF5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  primaryText: { fontSize: 10, fontWeight: '700', color: '#1A6B34' },

  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cardRowLabel: { fontSize: 12, color: '#6B7280' },
  cardRowValue: { fontSize: 12, fontWeight: '600', color: '#111827' },

  cardActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  editBtn: { flex: 1, backgroundColor: '#F2FBF5', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  editBtnText: { fontSize: 13, fontWeight: '700', color: '#1A6B34' },
  deleteBtn: { flex: 1, backgroundColor: '#FEF2F2', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  deleteBtnText: { fontSize: 13, fontWeight: '700', color: '#EF4444' },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#2E9E52',
    borderRadius: 12,
    paddingVertical: 13,
    backgroundColor: 'transparent',
  },
  addBtnText: { fontSize: 14, fontWeight: '600', color: '#1A6B34' },

  // Bottom sheet
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.46)' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 34,
    maxHeight: '90%',
  },
  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 6 },
  sheetSubtitle: { fontSize: 13, color: '#6B7280', lineHeight: 18, marginBottom: 16 },
  sheetScroll: { maxHeight: 340 },

  fieldWrap: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#111827',
  },

  pickerCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 8,
  },
  pickerSearch: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
  },
  pickerLoader: { paddingVertical: 16 },
  pickerEmpty: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 13,
    paddingVertical: 20,
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginBottom: 6,
    backgroundColor: '#FAFAFA',
  },
  pickerValue: { fontSize: 14, color: '#111827', fontWeight: '600' },
  pickerPlaceholder: { fontSize: 14, color: '#9CA3AF' },
  pickerList: { maxHeight: 160, borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 12, marginBottom: 8 },
  pickerItem: { paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  pickerItemActive: { backgroundColor: '#F2FBF5' },
  pickerItemText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  pickerItemTextActive: { color: '#1A6B34', fontWeight: '700' },

  saveBtn: { backgroundColor: '#F3CD03', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  saveBtnDisabled: { backgroundColor: '#E5E7EB' },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#0D3B1F' },
  saveBtnTextDisabled: { color: '#9CA3AF' },
  cancelSheetBtn: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14, paddingVertical: 13, alignItems: 'center' },
  cancelSheetBtnText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
});

export default PaymentMethodsScreen;
