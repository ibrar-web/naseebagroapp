import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Switch } from 'react-native';
import SubHeader from '../components/SubHeader';
import { useTranslation } from '../../../localization';
import type { TranslationKey } from '../../../localization';
import { AppLoader } from '../../components';
import api from '../../../utils/api';
import { toBoolean, unwrapApiData } from '../utils/profileApi';

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
  apiKey: string;
  fallbackKeys?: string[];
  labelKey: TranslationKey;
  subKey: TranslationKey;
};

const TOGGLES: ToggleRow[] = [
  {
    key: 'deals',
    apiKey: 'deal_alerts',
    labelKey: 'notifications.newDealAlerts',
    subKey: 'notifications.newDealAlertsSub',
  },
  {
    key: 'offers',
    apiKey: 'offer_updates',
    labelKey: 'notifications.offerUpdates',
    subKey: 'notifications.offerUpdatesSub',
  },
  {
    key: 'payments',
    apiKey: 'payment_alerts',
    fallbackKeys: ['payment_dispatch_alerts'],
    labelKey: 'notifications.paymentAlerts',
    subKey: 'notifications.paymentAlertsSub',
  },
  {
    key: 'delivery',
    apiKey: 'dispatch_delivery_alerts',
    fallbackKeys: ['payment_dispatch_alerts'],
    labelKey: 'notifications.dispatchDelivery',
    subKey: 'notifications.dispatchDeliverySub',
  },
  {
    key: 'promotions',
    apiKey: 'promotion_alerts',
    labelKey: 'notifications.promotions',
    subKey: 'notifications.promotionsSub',
  },
  {
    key: 'sms',
    apiKey: 'sms_alerts',
    labelKey: 'notifications.sms',
    subKey: 'notifications.smsSub',
  },
];

const NotificationsSettingsScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState<Record<ToggleKey, boolean>>({
    deals: false,
    offers: false,
    payments: false,
    delivery: false,
    promotions: false,
    sms: false,
  });
  const [loading, setLoading] = useState(false);
  const [updatingKey, setUpdatingKey] = useState<ToggleKey | null>(null);

  useEffect(() => {
    let mounted = true;

    const readToggleValue = (data: any, item: ToggleRow) => {
      const candidates = [item.apiKey, ...(item.fallbackKeys ?? [])];
      const value = candidates
        .map(key => data?.[key])
        .find(candidate => candidate !== undefined && candidate !== null);

      return toBoolean(value, false);
    };

    const loadNotifications = async () => {
      setLoading(true);
      try {
        const response = await api.profile.notifications.get();
        const payload = unwrapApiData(response);
        const data =
          payload?.notifications ??
          payload?.settings ??
          payload?.preferences ??
          payload;

        if (mounted) {
          setPrefs(
            TOGGLES.reduce(
              (nextPrefs, item) => ({
                ...nextPrefs,
                [item.key]: readToggleValue(data, item),
              }),
              {} as Record<ToggleKey, boolean>,
            ),
          );
        }
      } catch {
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadNotifications().catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  const toggle = async (item: ToggleRow) => {
    if (updatingKey) {
      return;
    }

    const nextValue = !prefs[item.key];
    setPrefs(current => ({ ...current, [item.key]: nextValue }));
    setUpdatingKey(item.key);

    try {
      await api.profile.notifications.update({ [item.apiKey]: nextValue });
    } catch {
      setPrefs(current => ({ ...current, [item.key]: !nextValue }));
    } finally {
      setUpdatingKey(null);
    }
  };

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
                onValueChange={() => {
                  toggle(item).catch(() => undefined);
                }}
                disabled={updatingKey !== null}
                trackColor={{ false: '#E5E7EB', true: '#2E9E52' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E5E7EB"
              />
            </View>
          ))}
        </View>
      </ScrollView>
      <AppLoader
        visible={loading || updatingKey !== null}
        overlay
        message={updatingKey ? t('common.updating') : t('common.loading')}
      />
    </View>
  );
};

export default NotificationsSettingsScreen;
