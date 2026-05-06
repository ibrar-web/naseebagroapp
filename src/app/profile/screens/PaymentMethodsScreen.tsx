import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import SubHeader from '../components/SubHeader';
import { AppIcon } from '../../../assets/icons';
import { useTranslation } from '../../../localization';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.05,
  shadowRadius: 18,
  elevation: 3,
};

const PaymentMethodsScreen = ({ navigation }: any) => {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-gray-50">
      <SubHeader title={t('payments.title')} navigation={navigation} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="px-1 pb-4 pt-2 text-xl font-extrabold uppercase tracking-widest text-gray-400">
          {t('payments.linkedBankAccount')}
        </Text>

        <View
          className="mb-8 overflow-hidden rounded-[28px] bg-white px-6 py-6"
          style={CARD_SHADOW}
        >
          <View className="flex-row items-center">
            <View className="h-20 w-20 items-center justify-center rounded-3xl bg-blue-50">
              <AppIcon name="bank" size={34} color="#3B82F6" />
            </View>
            <View className="ml-5 flex-1">
              <Text className="text-gray-900 text-xl font-extrabold">
                {t('payments.hblBankAccount')}
              </Text>
              <Text className="mt-2 text-gray-500 text-lg font-medium tracking-widest">
                {t('payments.maskedAccount')}
              </Text>
            </View>
            <View className="rounded-2xl bg-green-50 px-5 py-3">
              <Text className="text-green-700 text-base font-extrabold uppercase">
                {t('common.primary')}
              </Text>
            </View>
          </View>

          <View className="mt-6 border-t border-gray-100">
            {[
              { label: t('payments.accountName'), value: 'Muhammad Asad' },
              { label: t('payments.accountNo'), value: '0123456789' },
              { label: t('payments.iban'), value: 'PK36HABB0020017530103' },
            ].map((item, index) => (
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
            ))}
          </View>
        </View>

        <Text className="px-1 pb-4 text-xl font-extrabold uppercase tracking-widest text-gray-400">
          {t('payments.mobileWallet')}
        </Text>

        <View
          className="mb-8 flex-row items-center rounded-[28px] bg-white px-6 py-7"
          style={CARD_SHADOW}
        >
          <View className="h-20 w-20 items-center justify-center rounded-3xl bg-green-50">
            <AppIcon name="wallet" size={34} color="#1A6B34" />
          </View>
          <View className="ml-5 flex-1">
            <Text className="text-gray-900 text-xl font-extrabold">
              {t('payments.easypaisa')}
            </Text>
            <Text className="mt-1 text-gray-500 text-lg font-medium">
              +92 300 1234567
            </Text>
          </View>
          <AppIcon name="approved" size={32} color="#2E9E52" />
        </View>

        <TouchableOpacity
          className="h-20 flex-row items-center justify-center rounded-3xl border-2 border-green-600 bg-gray-50"
          activeOpacity={0.85}
        >
          <AppIcon name="add" size={28} color="#176B33" />
          <Text className="ml-4 text-green-700 text-xl font-extrabold">
            {t('payments.addNewAccount')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default PaymentMethodsScreen;
