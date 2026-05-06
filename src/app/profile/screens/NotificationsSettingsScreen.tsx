import React, { useState } from 'react';
import { View, Text, ScrollView, Switch } from 'react-native';
import SubHeader from '../components/SubHeader';

type Toggle = { icon: string; label: string; sub: string; key: string };

const TOGGLES: Toggle[] = [
  { icon: '📦', label: 'Deal Alerts',      sub: 'New deals and status updates',   key: 'deals'     },
  { icon: '💰', label: 'Payment Updates',  sub: 'Payment received or sent',       key: 'payments'  },
  { icon: '📊', label: 'Market Rates',     sub: 'Daily commodity price updates',  key: 'market'    },
  { icon: '🤝', label: 'New Offers',       sub: 'Offers from buyers or sellers',  key: 'offers'    },
  { icon: '🔔', label: 'System Alerts',    sub: 'App updates and announcements',  key: 'system'    },
  { icon: '📧', label: 'Email Digest',     sub: 'Weekly summary via email',       key: 'email'     },
];

const NotificationsSettingsScreen = ({ navigation }: any) => {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    deals: true, payments: true, market: false, offers: true, system: true, email: false,
  });

  const toggle = (key: string) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  return (
    <View className="flex-1 bg-gray-50">
      <SubHeader title="Notifications" subtitle="Manage your alert preferences" navigation={navigation} />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
                  showsVerticalScrollIndicator={false}>

        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Push Notifications</Text>

        <View className="bg-white rounded-2xl overflow-hidden"
              style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
          {TOGGLES.map((t, idx) => (
            <View key={t.key}
                  className={`flex-row items-center px-4 py-4 ${idx < TOGGLES.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <View className="w-10 h-10 rounded-xl bg-green-50 items-center justify-center mr-3">
                <Text style={{ fontSize: 18 }}>{t.icon}</Text>
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

        <View className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <Text className="text-green-800 text-sm font-semibold">📱 Push notifications are enabled</Text>
          <Text className="text-green-700 text-xs mt-1">
            You'll receive alerts for all active toggles. Manage device permissions in Settings.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationsSettingsScreen;
