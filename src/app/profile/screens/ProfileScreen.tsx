import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../store';
import { logout } from '../../../store/slices/authSlice';

type MenuItem = { icon: string; label: string; sub: string; screen: string };
type MenuGroup = { group: string; items: MenuItem[] };

const MENU: MenuGroup[] = [
  {
    group: 'ACCOUNT',
    items: [
      { icon: '👤', label: 'Personal Information', sub: 'Name, email, phone',        screen: 'PersonalInfo'     },
      { icon: '💼', label: 'Business Profile',     sub: 'Company, type, location',   screen: 'BusinessProfile'  },
      { icon: '💳', label: 'Payment Methods',      sub: 'Bank account, wallets',     screen: 'PaymentMethods'   },
      { icon: '🛡️', label: 'Verification Status',  sub: 'KYC approved ✓',            screen: 'VerificationStatus'},
      { icon: '⭐', label: 'Saved Listings',        sub: 'Your favorites',            screen: 'SavedListings'    },
    ],
  },
  {
    group: 'PREFERENCES',
    items: [
      { icon: '🔔', label: 'Notifications',  sub: 'Manage alerts',        screen: 'NotificationsSettings' },
      { icon: '⚙️', label: 'App Settings',   sub: 'Language, theme',      screen: 'AppSettings'           },
    ],
  },
  {
    group: 'SUPPORT',
    items: [
      { icon: '🆘', label: 'Help & Support',  sub: 'FAQs, contact us',    screen: 'Support' },
      { icon: '📄', label: 'Terms & Privacy', sub: 'Legal documents',     screen: 'Terms'   },
    ],
  },
];

const ProfileScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const mode     = useAppSelector(s => s.app.mode);

  return (
    <View className="flex-1 bg-green-800">

      {/* ── FIXED HEADER ──────────────────────────────────────── */}
      <View className="bg-green-800 px-5 pt-12 pb-6">
        {/* Decorative orb */}
        <View
          className="absolute rounded-full bg-green-700 opacity-20"
          style={{ width: 200, height: 200, top: -60, right: -60 }}
        />

        {/* User card row */}
        <View className="flex-row items-center gap-4">
          {/* Avatar */}
          <View className="w-20 h-20 rounded-2xl bg-orange-500 items-center justify-center"
                style={{ borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' }}>
            <Text style={{ fontSize: 36 }}>👤</Text>
          </View>

          {/* Name + email + badge */}
          <View className="flex-1 gap-1">
            <Text className="text-white text-2xl font-bold">Muhammad Asad</Text>
            <Text className="text-green-300 text-sm">asad@traders.com</Text>
            <View className="self-start mt-1 px-3 py-1 rounded-full border border-green-400 bg-green-800">
              <Text className="text-green-400 text-xs font-bold">● Approved</Text>
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View className="flex-row mt-6 pt-5"
              style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)' }}>
          {[
            { val: '12',   label: 'Deals'    },
            { val: '5',    label: 'Supplies' },
            { val: '4.8★', label: 'Rating'   },
          ].map((s, i) => (
            <View key={s.label}
                  className={`flex-1 items-start ${i > 0 ? 'pl-6' : ''}`}
                  style={i > 0 ? { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.15)' } : {}}>
              <Text className="text-white text-2xl font-extrabold">{s.val}</Text>
              <Text className="text-green-300 text-xs mt-0.5">{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── SCROLLABLE BODY ───────────────────────────────────── */}
      <ScrollView className="flex-1 bg-gray-100" showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 40 }}>

        {MENU.map(group => (
          <View key={group.group} className="mt-6 px-4">
            {/* Section title */}
            <Text className="text-xs font-bold text-gray-400 tracking-widest mb-2 px-1">
              {group.group}
            </Text>

            {/* Card */}
            <View className="bg-white rounded-2xl overflow-hidden"
                  style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 }}>
              {group.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={() => navigation.navigate(item.screen)}
                  activeOpacity={0.7}
                  className={`flex-row items-center px-4 py-4 ${idx < group.items.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  {/* Icon in green circle */}
                  <View className="w-10 h-10 rounded-xl bg-green-100 items-center justify-center mr-3">
                    <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                  </View>

                  {/* Text */}
                  <View className="flex-1">
                    <Text className="text-gray-900 text-sm font-semibold">{item.label}</Text>
                    <Text className="text-gray-400 text-xs mt-0.5">{item.sub}</Text>
                  </View>

                  {/* Chevron */}
                  <Text className="text-gray-300 text-xl font-light">›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Log out */}
        <View className="px-4 mt-6">
          <TouchableOpacity
            onPress={() => dispatch(logout())}
            activeOpacity={0.85}
            className="bg-white rounded-2xl py-4 items-center"
            style={{ borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}
          >
            <Text className="text-red-500 text-base font-bold">🚪 Log Out</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-center text-gray-300 text-xs mt-5">
          Naseeb Agri Market v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
