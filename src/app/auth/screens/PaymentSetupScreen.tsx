import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useTranslation } from '../../../localization';
import { BANKS } from '../../../constants';
import GreenHeader from '../components/GreenHeader';
import StepDots from '../components/StepDots';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentSetup'>;

const WALLETS = ['JazzCash', 'Easypaisa', 'SadaPay'];

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 3,
} as const;

const PaymentSetupScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ bank: '', accountTitle: '', iban: '' });
  const [selectedWallets, setSelectedWallets] = useState<string[]>([]);
  const [showBankPicker, setShowBankPicker] = useState(false);

  const toggleWallet = (w: string) =>
    setSelectedWallets(prev =>
      prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w],
    );

  const canSubmit =
    form.bank.length > 0 &&
    form.accountTitle.length > 2 &&
    form.iban.length >= 10;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <GreenHeader
        step={t('auth.paymentStep')}
        title={t('auth.paymentTitle')}
        subtitle={t('auth.paymentSubtitle')}
        icon="bank"
        onBack={() => navigation.goBack()}
      />

      <StepDots active={3} />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-2xl p-4 mb-4 gap-4" style={CARD_SHADOW}>
          {/* Bank picker */}
          <View>
            <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              {t('auth.bankLabel')}
            </Text>
            <TouchableOpacity
              onPress={() => setShowBankPicker(!showBankPicker)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 flex-row justify-between items-center"
              style={{ paddingVertical: 14 }}
              activeOpacity={0.8}
            >
              <Text className={form.bank ? 'text-gray-900 text-base' : 'text-gray-400 text-base'}>
                {form.bank || t('auth.selectBank')}
              </Text>
              <Text className="text-gray-400 text-sm">▼</Text>
            </TouchableOpacity>
            {showBankPicker && (
              <ScrollView
                className="bg-white rounded-xl border border-gray-200 mt-1 overflow-hidden"
                style={{ maxHeight: 200, elevation: 4 }}
                nestedScrollEnabled
              >
                {BANKS.map(bank => (
                  <TouchableOpacity
                    key={bank}
                    onPress={() => {
                      setForm(p => ({ ...p, bank }));
                      setShowBankPicker(false);
                    }}
                    className={`px-4 py-3 border-b border-gray-100 ${form.bank === bank ? 'bg-green-50' : ''}`}
                    activeOpacity={0.7}
                  >
                    <Text className={`text-sm ${form.bank === bank ? 'text-green-700 font-bold' : 'text-gray-700'}`}>
                      {bank}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Account Title */}
          <View>
            <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              {t('auth.accountTitle')}
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 text-gray-900 text-base"
              style={{ paddingVertical: 12 }}
              placeholder={t('auth.accountTitlePlaceholder')}
              placeholderTextColor="#9CA3AF"
              value={form.accountTitle}
              onChangeText={v => setForm(p => ({ ...p, accountTitle: v }))}
              autoCapitalize="words"
            />
          </View>

          {/* IBAN */}
          <View>
            <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              {t('auth.ibanNumber')}
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 text-gray-900 text-base"
              style={{ paddingVertical: 12 }}
              placeholder={t('auth.ibanPlaceholder')}
              placeholderTextColor="#9CA3AF"
              value={form.iban}
              onChangeText={v => setForm(p => ({ ...p, iban: v }))}
              autoCapitalize="characters"
            />
          </View>
        </View>

        {/* Mobile Wallets */}
        <View className="bg-white rounded-2xl p-4 mb-5" style={CARD_SHADOW}>
          <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            {t('auth.walletLabel')}
          </Text>
          <View className="flex-row gap-3">
            {WALLETS.map(w => {
              const active = selectedWallets.includes(w);
              return (
                <TouchableOpacity
                  key={w}
                  onPress={() => toggleWallet(w)}
                  className={`flex-1 py-3 rounded-2xl items-center border-2 ${
                    active ? 'bg-orange-500 border-orange-500' : 'bg-gray-50 border-gray-200'
                  }`}
                  activeOpacity={0.8}
                >
                  <Text className={`text-sm font-bold ${active ? 'text-white' : 'text-gray-600'}`}>
                    {w}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('VerifyPending')}
          className={`py-4 rounded-2xl items-center ${canSubmit ? 'bg-orange-500' : 'bg-orange-500 opacity-40'}`}
          disabled={!canSubmit}
          style={canSubmit ? { shadowColor: '#F3CD03', shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 } : {}}
          activeOpacity={0.88}
        >
          <Text className="text-white text-base font-bold">
            {t('auth.submitRegistration')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PaymentSetupScreen;
