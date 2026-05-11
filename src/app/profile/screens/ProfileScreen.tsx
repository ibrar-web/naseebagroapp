import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import { CommonActions } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../store';
import { logout } from '../../../store/slices/authSlice';
import { AppIcon } from '../../../assets/icons';
import type { AppIconName } from '../../../assets/icons';
import { useTranslation } from '../../../localization';
import type { TranslationKey } from '../../../localization';

type MenuItem = {
  icon: AppIconName;
  labelKey: TranslationKey;
  subKey: TranslationKey;
  screen: string;
};
type MenuGroup = { groupKey: TranslationKey; items: MenuItem[] };

const MENU: MenuGroup[] = [
  {
    groupKey: 'profile.account',
    items: [
      {
        icon: 'menuPersonal',
        labelKey: 'profile.personalInfo',
        subKey: 'profile.personalInfoSub',
        screen: 'PersonalInfo',
      },
      {
        icon: 'menuBusiness',
        labelKey: 'profile.businessProfile',
        subKey: 'profile.businessProfileSub',
        screen: 'BusinessProfile',
      },
      {
        icon: 'menuPayment',
        labelKey: 'profile.paymentMethods',
        subKey: 'profile.paymentMethodsSub',
        screen: 'PaymentMethods',
      },
      {
        icon: 'menuVerification',
        labelKey: 'profile.verificationStatus',
        subKey: 'profile.verificationStatusSub',
        screen: 'VerificationStatus',
      },
      {
        icon: 'menuSaved',
        labelKey: 'profile.savedListings',
        subKey: 'profile.savedListingsSub',
        screen: 'SavedListings',
      },
    ],
  },
  {
    groupKey: 'profile.preferences',
    items: [
      {
        icon: 'menuNotifications',
        labelKey: 'profile.notifications',
        subKey: 'profile.notificationsSub',
        screen: 'NotificationsSettings',
      },
      {
        icon: 'menuAppSettings',
        labelKey: 'profile.appSettings',
        subKey: 'profile.appSettingsSub',
        screen: 'AppSettings',
      },
    ],
  },
  {
    groupKey: 'profile.support',
    items: [
      {
        icon: 'menuSupport',
        labelKey: 'profile.helpSupport',
        subKey: 'profile.helpSupportSub',
        screen: 'Support',
      },
      {
        icon: 'menuTerms',
        labelKey: 'profile.termsPrivacy',
        subKey: 'profile.termsPrivacySub',
        screen: 'Terms',
      },
    ],
  },
];

const ProfileScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const user = useAppSelector(s => s.auth.user);

  const handleLogout = async () => {
    await EncryptedStorage.removeItem('session').catch(() => null);
    dispatch(logout());
    // Reset the root stack so the user cannot navigate back to MainTabs
    navigation.getParent()?.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] }),
    );
  };

  const displayName = user?.fullName ?? 'Guest';
  const displayEmail = user?.email ?? '';

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
          <View
            className="w-20 h-20 rounded-2xl bg-orange-500 items-center justify-center"
            style={{ borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' }}
          >
            <AppIcon name="profileAvatar" size={38} color="#FFFFFF" />
          </View>

          {/* Name + email + badge */}
          <View className="flex-1 gap-1">
            <Text className="text-white text-2xl font-bold">{displayName}</Text>
            {displayEmail ? (
              <Text className="text-green-300 text-sm">{displayEmail}</Text>
            ) : null}
            {user?.is_verified ? (
              <View className="self-start mt-1 px-3 py-1 rounded-full border border-green-400 bg-green-800 flex-row items-center">
                <View className="mr-1.5">
                  <AppIcon name="approved" size={12} color="#45B86A" />
                </View>
                <Text className="text-green-400 text-xs font-bold">
                  {t('profile.approved')}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Stats row */}
        <View
          className="flex-row mt-6 pt-5"
          style={{
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.12)',
          }}
        >
          {[
            { val: '12', label: t('profile.deals') },
            { val: '5', label: t('profile.supplies') },
            {
              val: '4.8',
              label: t('profile.rating'),
              icon: 'menuSaved' as AppIconName,
            },
          ].map((s, i) => (
            <View
              key={s.label}
              className={`flex-1 items-start ${i > 0 ? 'pl-6' : ''}`}
              style={
                i > 0
                  ? {
                      borderLeftWidth: 1,
                      borderLeftColor: 'rgba(255,255,255,0.15)',
                    }
                  : {}
              }
            >
              <View className="flex-row items-center">
                <Text className="text-white text-2xl font-extrabold">
                  {s.val}
                </Text>
                {s.icon ? (
                  <View className="ml-1">
                    <AppIcon name={s.icon} size={16} color="#FFFFFF" />
                  </View>
                ) : null}
              </View>
              <Text className="text-green-300 text-xs mt-0.5">{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── SCROLLABLE BODY ───────────────────────────────────── */}
      <ScrollView
        className="flex-1 bg-gray-100"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {MENU.map(group => (
          <View key={group.groupKey} className="mt-6 px-4">
            {/* Section title */}
            <Text className="text-xs font-bold text-gray-400 tracking-widest mb-2 px-1">
              {t(group.groupKey)}
            </Text>

            {/* Card */}
            <View
              className="bg-white rounded-2xl overflow-hidden"
              style={{
                shadowColor: '#000',
                shadowOpacity: 0.06,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 3,
              }}
            >
              {group.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.labelKey}
                  onPress={() => navigation.navigate(item.screen)}
                  activeOpacity={0.7}
                  className={`flex-row items-center px-4 py-4 ${
                    idx < group.items.length - 1
                      ? 'border-b border-gray-100'
                      : ''
                  }`}
                >
                  <View className="w-10 h-10 rounded-xl bg-green-100 items-center justify-center mr-3">
                    <AppIcon name={item.icon} size={19} color="#1A6B34" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 text-sm font-semibold">
                      {t(item.labelKey)}
                    </Text>
                    <Text className="text-gray-400 text-xs mt-0.5">
                      {t(item.subKey)}
                    </Text>
                  </View>
                  <AppIcon name="chevronRight" size={18} color="#D1D5DB" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Log out */}
        <View className="px-4 mt-6">
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.85}
            className="bg-white rounded-2xl py-4 items-center"
            style={{
              borderWidth: 1,
              borderColor: 'rgba(239,68,68,0.25)',
              shadowColor: '#000',
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center">
              <View className="mr-2">
                <AppIcon name="logout" size={18} color="#EF4444" />
              </View>
              <Text className="text-red-500 text-base font-bold">
                {t('profile.logout')}
              </Text>
            </View>
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
