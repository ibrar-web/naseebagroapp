import React, { useState } from 'react';
import { View, Text, ScrollView, Switch } from 'react-native';
import SubHeader from '../components/SubHeader';
import { useTranslation } from '../../../localization';
import type { TranslationKey } from '../../../localization';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.05,
  shadowRadius: 18,
  elevation: 3,
};

type ToggleKey =
  | 'deals'
  | 'offers'
  | 'payments'
  | 'delivery'
  | 'promotions'
  | 'sms';

type ToggleRow = {
  key: ToggleKey;
  labelKey: TranslationKey;
  subKey: TranslationKey;
};

const TOGGLES: ToggleRow[] = [
  {
    key: 'deals',
    labelKey: 'notifications.newDealAlerts',
    subKey: 'notifications.newDealAlertsSub',
  },
  {
    key: 'offers',
    labelKey: 'notifications.offerUpdates',
    subKey: 'notifications.offerUpdatesSub',
  },
  {
    key: 'payments',
    labelKey: 'notifications.paymentAlerts',
    subKey: 'notifications.paymentAlertsSub',
  },
  {
    key: 'delivery',
    labelKey: 'notifications.dispatchDelivery',
    subKey: 'notifications.dispatchDeliverySub',
  },
  {
    key: 'promotions',
    labelKey: 'notifications.promotions',
    subKey: 'notifications.promotionsSub',
  },
  {
    key: 'sms',
    labelKey: 'notifications.sms',
    subKey: 'notifications.smsSub',
  },
];

const NotificationsSettingsScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState<Record<ToggleKey, boolean>>({
    deals: true,
    offers: true,
    payments: true,
    delivery: true,
    promotions: false,
    sms: true,
  });

  const toggle = (key: ToggleKey) =>
    setPrefs(current => ({ ...current, [key]: !current[key] }));

  return (
    <View className="flex-1 bg-gray-50">
      <SubHeader title={t('notifications.title')} navigation={navigation} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="overflow-hidden rounded-[28px] bg-white"
          style={CARD_SHADOW}
        >
          {TOGGLES.map((item, index) => (
            <View
              key={item.key}
              className={`flex-row items-center px-6 py-6 ${
                index < TOGGLES.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <View className="flex-1 pr-4">
                <Text className="text-gray-900 text-xl font-extrabold">
                  {t(item.labelKey)}
                </Text>
                <Text className="mt-2 text-gray-400 text-lg font-medium">
                  {t(item.subKey)}
                </Text>
              </View>
              <Switch
                value={prefs[item.key]}
                onValueChange={() => toggle(item.key)}
                trackColor={{ false: '#E5E7EB', true: '#2E9E52' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E5E7EB"
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationsSettingsScreen;
