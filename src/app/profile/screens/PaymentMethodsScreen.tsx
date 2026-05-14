import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Alert,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import SubHeader from '../components/SubHeader';
import { AppIcon } from '../../../assets/icons';
import { useTranslation } from '../../../localization';
import { BANKS } from '../../../constants';
import { AppLoader } from '../../components';
import api from '../../../utils/api';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.05,
  shadowRadius: 18,
  elevation: 3,
};

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

const str = (...values: any[]): string => {
  for (const v of values) {
    if (v !== undefined && v !== null) {
      return String(v);
    }
  }
  return '';
};

const parseBankingList = (response: any): any[] => {
  const payload = response?.data ?? response?.result ?? response;

  if (Array.isArray(payload)) {
    return payload;
  }

  for (const key of ['banking', 'banking_details', 'bankingDetails', 'accounts', 'items']) {
    if (Array.isArray(payload?.[key])) {
      return payload[key];
    }
  }

  return [];
};

const normalizeBankingDetails = (response: any): BankingDetail[] =>
  parseBankingList(response)
    .map((item: any) => ({
      id: str(item?.id, item?._id, item?.banking_detail_id),
      bankName: str(item?.bank_name, item?.bankName, item?.bank),
      accountTitle: str(
        item?.account_title,
        item?.accountTitle,
        item?.account_name,
        item?.accountName,
      ),
      accountNumber: str(
        item?.bank_account_number,
        item?.account_number,
        item?.accountNumber,
      ),
      iban: str(item?.bank_iban_number, item?.iban, item?.IBAN),
      isPrimary: Boolean(item?.is_primary ?? item?.isPrimary ?? false),
    }))
    .filter(
      (item: BankingDetail) =>
        item.id || item.bankName || item.accountTitle || item.iban,
    );

const maskAccount = (accountNumber: string, iban: string) => {
  const value = accountNumber || iban;

  if (!value) {
    return '';
  }

  return `**** ${value.slice(-4)}`;
};

const PaymentMethodsScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<BankingDetail[]>([]);
  const [form, setForm] = useState<BankingForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const canSubmit =
    form.bankName.trim().length > 0 &&
    form.accountTitle.trim().length > 1 &&
    form.iban.trim().length > 4;

  const loadBankingDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.profile.banking.get();
      setAccounts(normalizeBankingDetails(response));
    } catch (error) {
      console.error('PaymentMethodsScreen: Failed to load banking details:', error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBankingDetails();
    }, [loadBankingDetails]),
  );

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const startEdit = (account: BankingDetail) => {
    setEditingId(account.id);
    setForm({
      bankName: account.bankName,
      accountTitle: account.accountTitle,
      accountNumber: account.accountNumber,
      iban: account.iban,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
    setShowBankPicker(false);
  };

  const handleSubmit = async () => {
    if (!canSubmit || saving) {
      return;
    }

    const payload = {
      bank_name: form.bankName.trim(),
      account_title: form.accountTitle.trim(),
      bank_account_number: form.accountNumber.trim(),
      bank_iban_number: form.iban.trim(),
    };

    setSaving(true);
    try {
      if (editingId) {
        await api.profile.banking.update(editingId, payload);
      } else {
        await api.profile.banking.create(payload);
      }
      closeForm();
      await loadBankingDetails();
    } catch (error) {
      console.error('PaymentMethodsScreen: Submit failed:', error);
      Alert.alert('Update Failed', 'Please check your banking details.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (account: BankingDetail) => {
    if (!account.id) {
      return;
    }

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
          } catch (error) {
            console.error('PaymentMethodsScreen: Delete failed:', error);
            Alert.alert('Delete Failed', 'Please try again.');
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <SubHeader title={t('payments.title')} navigation={navigation} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text className="px-1 pb-4 pt-2 text-xl font-extrabold uppercase tracking-widest text-gray-400">
          {t('payments.linkedBankAccount')}
        </Text>

        {accounts.length === 0 && !loading ? (
          <View
            className="mb-8 items-center rounded-[28px] bg-white px-6 py-10"
            style={CARD_SHADOW}
          >
            <View className="h-20 w-20 items-center justify-center rounded-3xl bg-green-50">
              <AppIcon name="bank" size={34} color="#1A6B34" />
            </View>
            <Text className="mt-5 text-center text-gray-900 text-xl font-extrabold">
              {t('payments.noBankAccounts')}
            </Text>
          </View>
        ) : null}

        {accounts.map(account => (
          <View
            key={account.id || account.iban}
            className="mb-6 overflow-hidden rounded-[28px] bg-white px-6 py-6"
            style={CARD_SHADOW}
          >
            <View className="flex-row items-center">
              <View className="h-20 w-20 items-center justify-center rounded-3xl bg-blue-50">
                <AppIcon name="bank" size={34} color="#3B82F6" />
              </View>
              <View className="ml-5 flex-1">
                <Text className="text-gray-900 text-xl font-extrabold">
                  {account.bankName || t('payments.bankName')}
                </Text>
                <Text className="mt-2 text-gray-500 text-lg font-medium tracking-widest">
                  {maskAccount(account.accountNumber, account.iban)}
                </Text>
              </View>
              {account.isPrimary ? (
                <View className="rounded-2xl bg-green-50 px-5 py-3">
                  <Text className="text-green-700 text-base font-extrabold uppercase">
                    {t('common.primary')}
                  </Text>
                </View>
              ) : null}
            </View>

            <View className="mt-6 border-t border-gray-100">
              {[
                {
                  label: t('payments.accountName'),
                  value: account.accountTitle,
                },
                {
                  label: t('payments.accountNo'),
                  value: account.accountNumber,
                },
                { label: t('payments.iban'), value: account.iban },
              ].map((item, index) =>
                item.value ? (
                  <View
                    key={item.label}
                    className={`flex-row items-center justify-between py-4 ${
                      index < 2 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <Text className="text-gray-500 text-lg font-medium">
                      {item.label}
                    </Text>
                    <Text className="ml-4 flex-1 text-right text-gray-900 text-lg font-extrabold">
                      {item.value}
                    </Text>
                  </View>
                ) : null,
              )}
            </View>

            <View className="mt-2 flex-row gap-3">
              <TouchableOpacity
                onPress={() => startEdit(account)}
                className="flex-1 rounded-2xl bg-green-50 py-3"
                activeOpacity={0.8}
              >
                <Text className="text-center text-green-700 text-base font-extrabold">
                  {t('payments.edit')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(account)}
                className="flex-1 rounded-2xl bg-red-50 py-3"
                activeOpacity={0.8}
              >
                <Text className="text-center text-red-500 text-base font-extrabold">
                  {t('payments.delete')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {showForm ? (
          <View
            className="mb-8 rounded-[28px] bg-white px-5 py-6"
            style={CARD_SHADOW}
          >
            <View className="mb-4">
              <Text className="mb-2 text-gray-500 text-sm font-extrabold uppercase tracking-widest">
                {t('payments.bankName')}
              </Text>
              <TouchableOpacity
                onPress={() => setShowBankPicker(current => !current)}
                className="flex-row items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4"
                activeOpacity={0.8}
              >
                <Text
                  className={
                    form.bankName
                      ? 'text-gray-900 text-base font-semibold'
                      : 'text-gray-400 text-base font-semibold'
                  }
                >
                  {form.bankName || t('payments.bankName')}
                </Text>
                <AppIcon name="chevronDown" size={20} color="#9CA3AF" />
              </TouchableOpacity>
              {showBankPicker ? (
                <ScrollView
                  className="mt-2 max-h-52 rounded-2xl border border-gray-100 bg-white"
                  nestedScrollEnabled
                >
                  {BANKS.map(bank => (
                    <TouchableOpacity
                      key={bank}
                      onPress={() => {
                        setForm(current => ({ ...current, bankName: bank }));
                        setShowBankPicker(false);
                      }}
                      className={`border-b border-gray-100 px-4 py-3 ${
                        form.bankName === bank ? 'bg-green-50' : ''
                      }`}
                      activeOpacity={0.75}
                    >
                      <Text
                        className={`text-base ${
                          form.bankName === bank
                            ? 'text-green-700 font-extrabold'
                            : 'text-gray-700 font-semibold'
                        }`}
                      >
                        {bank}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : null}
            </View>

            {[
              {
                label: t('payments.accountTitle'),
                value: form.accountTitle,
                key: 'accountTitle' as const,
              },
              {
                label: t('payments.accountNo'),
                value: form.accountNumber,
                key: 'accountNumber' as const,
              },
              {
                label: t('payments.iban'),
                value: form.iban,
                key: 'iban' as const,
              },
            ].map(field => (
              <View key={field.key} className="mb-4">
                <Text className="mb-2 text-gray-500 text-sm font-extrabold uppercase tracking-widest">
                  {field.label}
                </Text>
                <TextInput
                  value={field.value}
                  onChangeText={value =>
                    setForm(current => ({ ...current, [field.key]: value }))
                  }
                  className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-gray-900 text-base font-semibold"
                  placeholder={field.label}
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize={field.key === 'iban' ? 'characters' : 'words'}
                />
              </View>
            ))}

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={closeForm}
                className="flex-1 rounded-2xl border border-gray-200 py-4"
                activeOpacity={0.8}
              >
                <Text className="text-center text-gray-500 text-base font-extrabold">
                  {t('payments.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!canSubmit || saving}
                className={`flex-1 rounded-2xl bg-green-700 py-4 ${
                  !canSubmit || saving ? 'opacity-50' : ''
                }`}
                activeOpacity={0.86}
              >
                <Text className="text-center text-white text-base font-extrabold">
                  {editingId
                    ? t('payments.updateAccount')
                    : t('payments.saveAccount')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {!showForm ? (
          <TouchableOpacity
            onPress={startCreate}
            className="h-20 flex-row items-center justify-center rounded-3xl border-2 border-green-600 bg-gray-50"
            activeOpacity={0.85}
          >
            <AppIcon name="add" size={28} color="#176B33" />
            <Text className="ml-4 text-green-700 text-xl font-extrabold">
              {t('payments.addNewAccount')}
            </Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      <AppLoader
        visible={loading || saving}
        overlay
        message={saving ? t('common.updating') : t('common.loading')}
      />
    </View>
  );
};

export default PaymentMethodsScreen;
