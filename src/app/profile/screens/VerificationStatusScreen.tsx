import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import SubHeader from '../components/SubHeader';
import { AppIcon } from '../../../assets/icons';
import type { AppIconName } from '../../../assets/icons';
import { useTranslation } from '../../../localization';
import type { TranslationKey } from '../../../localization';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.05,
  shadowRadius: 18,
  elevation: 3,
};

type VerificationItem = {
  icon: AppIconName;
  labelKey: TranslationKey;
  dateKey?: TranslationKey;
  status: 'approved' | 'pending';
};

const ITEMS: VerificationItem[] = [
  {
    icon: 'verificationId',
    labelKey: 'verification.cnic',
    dateKey: 'verification.feb12',
    status: 'approved',
  },
  {
    icon: 'verificationBusiness',
    labelKey: 'verification.businessDocs',
    dateKey: 'verification.feb12',
    status: 'approved',
  },
  {
    icon: 'verificationBank',
    labelKey: 'verification.bankAccount',
    dateKey: 'verification.feb14',
    status: 'approved',
  },
  {
    icon: 'profilePhone',
    labelKey: 'verification.phone',
    dateKey: 'verification.feb10',
    status: 'approved',
  },
  {
    icon: 'address',
    labelKey: 'verification.address',
    status: 'pending',
  },
];

const VerificationStatusScreen = ({ navigation }: any) => {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-gray-50">
      <SubHeader title={t('verification.title')} navigation={navigation} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="mb-8 items-center rounded-[28px] bg-green-800 px-5 py-10"
          style={CARD_SHADOW}
        >
          <View className="h-20 w-20 items-center justify-center rounded-3xl bg-green-500">
            <AppIcon name="approved" size={54} color="#FFFFFF" />
          </View>
          <Text className="mt-8 text-white text-2xl font-extrabold">
            {t('verification.accountVerified')}
          </Text>
          <Text className="mt-3 text-center text-green-200 text-lg font-medium">
            {t('verification.accountVerifiedSub')}
          </Text>
        </View>

        <View
          className="overflow-hidden rounded-[28px] bg-white"
          style={CARD_SHADOW}
        >
          {ITEMS.map((item, index) => {
            const approved = item.status === 'approved';

            return (
              <View
                key={item.labelKey}
                className={`flex-row items-center px-6 py-5 ${
                  index < ITEMS.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <View
                  className={`h-16 w-16 items-center justify-center rounded-2xl ${
                    approved ? 'bg-green-50' : 'bg-yellow-100'
                  }`}
                >
                  <AppIcon
                    name={item.icon}
                    size={28}
                    color={approved ? '#1A6B34' : '#A14E14'}
                  />
                </View>
                <View className="ml-5 flex-1">
                  <Text className="text-gray-900 text-xl font-extrabold">
                    {t(item.labelKey)}
                  </Text>
                  <Text className="mt-1 text-gray-400 text-lg font-medium">
                    {item.dateKey
                      ? t('common.verifiedDate', { date: t(item.dateKey) })
                      : t('common.verifiedDash')}
                  </Text>
                </View>
                <View
                  className={`rounded-2xl px-5 py-3 ${
                    approved ? 'bg-green-50' : 'bg-yellow-100'
                  }`}
                >
                  <Text
                    className={`text-base font-extrabold uppercase ${
                      approved ? 'text-green-700' : 'text-yellow-800'
                    }`}
                  >
                    {approved ? t('common.approved') : t('common.pending')}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default VerificationStatusScreen;
