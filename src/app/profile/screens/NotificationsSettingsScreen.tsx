import React, { useState } from 'react';
import { View, Text, ScrollView, Switch } from 'react-native';
import SubHeader from '../components/SubHeader';
import { AppIcon } from '../../../assets/icons';
import type { AppIconName } from '../../../assets/icons';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07,
  shadowRadius: 12,
  elevation: 3,
};

const TOGGLES = [
  { icon: 'notificationDeals' as AppIconName, label: 'Deal Alerts',     sub: 'New deals and status updates',  key: 'deals'    },
  { icon: 'notificationPayment' as AppIconName, label: 'Payment Updates', sub: 'Payment received or sent',      key: 'payments' },
  { icon: 'notificationMarket' as AppIconName, label: 'Market Rates',    sub: 'Daily commodity price updates', key: 'market'   },
  { icon: 'notificationOffers' as AppIconName, label: 'New Offers',      sub: 'Offers from buyers or sellers', key: 'offers'   },
  { icon: 'notificationSystem' as AppIconName, label: 'System Alerts',   sub: 'App updates and announcements', key: 'system'   },
  { icon: 'notificationEmail' as AppIconName, label: 'Email Digest',    sub: 'Weekly summary via email',      key: 'email'    },
];

const NotificationsSettingsScreen = ({ navigation }: any) => {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    deals: true, payments: true, market: false, offers: true, system: true, email: false,
  });

  const toggle = (key: string) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  return (
    <View className="flex-1 bg-gray-50">
      <SubHeader title="Notifications" subtitle="Manage your alert preferences" navigation={navigation} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-3">
          Push Notifications
        </Text>

        <View className="bg-white rounded-2xl overflow-hidden mb-4" style={CARD_SHADOW}>
          {TOGGLES.map((t, idx) => (
            <View
              key={t.key}
              className={`flex-row items-center px-4 py-4 ${idx < TOGGLES.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <View className="w-10 h-10 rounded-xl bg-green-50 items-center justify-center mr-3">
                <AppIcon name={t.icon} size={18} color="#1A6B34" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 text-sm font-semibold">{t.label}</Text>
                <Text className="text-gray-400 text-xs mt-0.5">{t.sub}</Text>
              </View>
              <Switch
                value={prefs[t.key]}
                onValueChange={() => toggle(t.key)}
                trackColor={{ false: '#E5E7EB', true: '#1A6B34' }}
                thumbColor="#FFFFFF"
              />
            </View>
          ))}
        </View>

        <View className="bg-green-50 border border-green-200 rounded-2xl p-4" style={CARD_SHADOW}>
          <View className="flex-row items-center">
            <View className="mr-2">
              <AppIcon name="notificationPush" size={17} color="#145228" />
            </View>
            <Text className="text-green-800 text-sm font-semibold">Push notifications are enabled</Text>
          </View>
          <Text className="text-green-700 text-xs mt-1">
            You'll receive alerts for all active toggles. Manage device permissions in Settings.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationsSettingsScreen;
