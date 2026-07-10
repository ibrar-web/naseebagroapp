import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import { CommonActions } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../store';
import { logout } from '../../../store/slices/authSlice';
import { AppIcon } from '../../../assets/icons';
import type { AppIconName } from '../../../assets/icons';
import { useTranslation } from '../../../localization';
import type { TranslationKey } from '../../../localization';
import { navigateToLogin } from '../../auth/utils/requireLogin';
import MockStatusBar from '../../components/MockStatusBar';
import LoginRequired from '../../components/alerts/LoginRequired';
import api from '../../../utils/api/index';

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
    groupKey: 'profile.payments',
    items: [
      {
        icon: 'menuPayment',
        labelKey: 'profile.paymentHistory',
        subKey: 'profile.paymentHistorySub',
        screen: 'PaymentHistory',
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
  const isAuthenticated = useAppSelector(s => s.auth.isAuthenticated);
  const mode = useAppSelector(s => s.app.mode);
  const [loginSheetVisible, setLoginSheetVisible] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    console.log('[ProfileStats] fetching...');
    (api.profile.stats() as any)
      .then((res: any) => {
        console.log('[ProfileStats] response:', JSON.stringify(res?.data, null, 2));
        setUserStats(res?.data?.data ?? res?.data);
      })
      .catch((err: any) => {
        console.error('[ProfileStats] error:', err?.message ?? err);
        console.error('[ProfileStats] status:', err?.response?.status);
        console.error('[ProfileStats] response data:', JSON.stringify(err?.response?.data, null, 2));
      });
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await EncryptedStorage.removeItem('session').catch(() => null);
    dispatch(logout());
    navigation
      .getParent()
      ?.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] }),
      );
  };

  const displayName = user?.fullName ?? 'Muhammad Asad';
  const displayEmail = user?.email ?? 'asad@traders.com';

  return (
    <View style={styles.container}>
      <MockStatusBar backgroundColor="#145228" textColor="#FFFFFF" />
      {/* ── GRADIENT HEADER ── */}
      <View style={styles.header}>
        {/* Decorative orb */}
        <View style={styles.orbTopRight} />
        <View style={styles.orbBottomLeft} />

        {/* User row */}
        <View style={styles.userRow}>
          <View style={styles.avatarBox}>
            <AppIcon name="profileAvatar" size={32} color="#0D3B1F" />
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>{displayEmail}</Text>
            {user?.is_verified !== false && (
              <View style={styles.approvedBadge}>
                <View style={styles.approvedDot} />
                <Text style={styles.approvedText}>{t('profile.approved')}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {(mode === 'buyer'
            ? [
                { val: String(userStats?.buyer?.total_active_deals ?? '—'), label: t('profile.deals') },
                { val: String(userStats?.buyer?.total_demands ?? '—'), label: t('profile.supplies') },
                { val: userStats?.buyer ? `₨${Math.round(userStats.buyer.total_spent / 1000)}K` : '—', label: t('profile.rating') },
              ]
            : [
                { val: String(userStats?.seller?.total_deals ?? '—'), label: t('profile.deals') },
                { val: String(userStats?.seller?.total_supplies ?? '—'), label: t('profile.supplies') },
                { val: userStats?.seller ? `₨${Math.round(userStats.seller.total_received / 1000)}K` : '—', label: t('profile.rating') },
              ]
          ).map((s, i) => (
            <View
              key={s.label}
              style={[styles.statItem, i > 0 && styles.statItemBorder]}
            >
              <Text style={styles.statValue}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── SCROLLABLE MENU ── */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {MENU.map(group => (
          <View key={group.groupKey} style={styles.section}>
            <Text style={styles.sectionTitle}>{t(group.groupKey)}</Text>

            <View style={styles.menuCard}>
              {group.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.labelKey}
                  onPress={() => {
                    if (!isAuthenticated && item.screen !== 'Support' && item.screen !== 'Terms') {
                      setLoginSheetVisible(true);
                      return;
                    }
                    navigation.navigate(item.screen);
                  }}
                  activeOpacity={0.75}
                  style={[
                    styles.menuRow,
                    idx < group.items.length - 1 && styles.menuRowBorder,
                  ]}
                >
                  <View style={styles.menuIconBox}>
                    <AppIcon name={item.icon} size={18} color="#217A3C" />
                  </View>
                  <View style={styles.menuText}>
                    <Text style={styles.menuTitle}>{t(item.labelKey)}</Text>
                    <Text style={styles.menuSub}>{t(item.subKey)}</Text>
                  </View>
                  <AppIcon name="chevronRight" size={16} color="#D1D5DB" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Log out */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            onPress={
              isAuthenticated ? handleLogout : () => navigateToLogin(navigation)
            }
            activeOpacity={0.85}
            style={[
              styles.logoutBtn,
              {
                borderColor: isAuthenticated
                  ? 'rgba(239,68,68,0.3)'
                  : 'rgba(26,107,52,0.3)',
              },
            ]}
          >
            <AppIcon
              name={isAuthenticated ? 'logout' : 'profileAvatar'}
              size={18}
              color={isAuthenticated ? '#EF4444' : '#1A6B34'}
            />
            <Text
              style={[
                styles.logoutText,
                { color: isAuthenticated ? '#EF4444' : '#1A6B34' },
              ]}
            >
              {isAuthenticated ? t('profile.logout') : t('auth.login')}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Naseeb Agri Market v1.0.0</Text>
      </ScrollView>

      <LoginRequired
        visible={loginSheetVisible}
        onClose={() => setLoginSheetVisible(false)}
        onLogin={() => {
          setLoginSheetVisible(false);
          navigation.navigate('Login');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    backgroundColor: '#145228',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    overflow: 'hidden',
  },
  orbTopRight: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -60,
    right: -50,
  },
  orbBottomLeft: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(243,205,3,0.08)',
    bottom: -20,
    left: -20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  avatarBox: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#F3CD03',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
    flexShrink: 0,
  },
  userInfo: { flex: 1, gap: 3 },
  userName: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  userEmail: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  approvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F7EE',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    gap: 5,
    marginTop: 2,
  },
  approvedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1A6B34',
  },
  approvedText: { fontSize: 10, fontWeight: '700', color: '#1A6B34' },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingVertical: 12,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statItemBorder: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.15)',
  },
  statValue: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '500',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 8,
    paddingLeft: 4,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F2FBF5',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  menuText: { flex: 1 },
  menuTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  menuSub: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  logoutSection: { marginTop: 20, paddingHorizontal: 16 },
  logoutBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  logoutText: { fontSize: 15, fontWeight: '700' },
  version: {
    textAlign: 'center',
    color: '#D1D5DB',
    fontSize: 11,
    marginTop: 16,
  },
});

export default ProfileScreen;
