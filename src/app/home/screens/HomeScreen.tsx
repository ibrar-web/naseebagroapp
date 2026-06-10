import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '../../../store';
import { switchMode } from '../../../store/slices/appSlice';
import { useTranslation } from '../../../localization';
import type { TranslationKey } from '../../../localization';
import iconRegistry from '../../../assets/icons/iconRegistry';
import { AppIcon } from '../../../assets/icons';
import MockStatusBar from '../../components/MockStatusBar';
import MarketRates from '../components/MarketRates';
import CategorySection from '../components/CategorySection';

const { width: W } = Dimensions.get('window');

// ── DATA ────────────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  {
    labelKey: 'home.createSupply' as TranslationKey,
    subKey: 'home.createSupplySub' as TranslationKey,
    emoji: '+',
    bg: '#FFFDE6',
    color: '#D4AE02',
  },
  {
    labelKey: 'home.myListings' as TranslationKey,
    subKey: 'home.myListingsSub' as TranslationKey,
    emoji: '□',
    bg: '#E8F7EE',
    color: '#217A3C',
  },
  {
    labelKey: 'home.viewOrders' as TranslationKey,
    subKey: 'home.viewOrdersSub' as TranslationKey,
    emoji: '▣',
    bg: '#EEF6FF',
    color: '#3B82F6',
  },
  {
    labelKey: 'home.payouts' as TranslationKey,
    subKey: 'home.payoutsSub' as TranslationKey,
    emoji: '₨',
    bg: '#F4F0FF',
    color: '#7C3AED',
  },
];

// ── MAIN SCREEN ──────────────────────────────────────────────────────────────

const HomeScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(s => s.app.mode);
  const user = useAppSelector(s => s.auth.user);
  const { t } = useTranslation();
  const [showModeMenu, setShowModeMenu] = useState(false);

  const isBuyer = mode === 'buyer';

  const displayName = user?.fullName ?? 'Muhammad Asad';
  const displayCity = user?.city ?? t('home.location');

  const modeOptions = [
    { value: 'buyer' as const, icon: '🛒', label: t('home.buyerMode') },
    { value: 'seller' as const, icon: '📦', label: t('home.sellerMode') },
  ];
  const activeMode = modeOptions.find(o => o.value === mode) ?? modeOptions[0];

  const stats = isBuyer
    ? [
        {
          label: t('home.activeDeals'),
          val: '3',
          color: '#217A3C',
          bg: '#F2FBF5',
        },
        { label: t('home.demands'), val: '7', color: '#3B82F6', bg: '#EEF6FF' },
        {
          label: t('home.totalSpent'),
          val: '₨2.4M',
          color: '#D4AE02',
          bg: '#FFFDE6',
        },
      ]
    : [
        {
          label: t('home.supplies'),
          val: '5',
          color: '#217A3C',
          bg: '#F2FBF5',
        },
        { label: t('home.orders'), val: '4', color: '#3B82F6', bg: '#EEF6FF' },
        {
          label: t('home.earnings'),
          val: '₨890K',
          color: '#D4AE02',
          bg: '#FFFDE6',
        },
      ];

  return (
    <View style={styles.screen}>
      {/* ── STATUS BAR ── */}
      <MockStatusBar backgroundColor="#0D3B1F" textColor="#FFFFFF" />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        {/* Orbs */}
        <View style={styles.orbTR} />
        <View style={styles.orbBL} />

        {/* Top row: Logo + Mode selector */}
        <View style={styles.topRow}>
          <Image
            source={iconRegistry.naseeb}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.modeSelectorWrap}>
            <TouchableOpacity
              onPress={() => setShowModeMenu(v => !v)}
              style={styles.modeBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.modeBtnText}>
                {activeMode.icon} {activeMode.label}
              </Text>
              <AppIcon
                name="chevronDown"
                size={13}
                color="rgba(255,255,255,0.8)"
              />
            </TouchableOpacity>

            {showModeMenu && (
              <View style={styles.modeMenu}>
                {modeOptions.map((opt, idx) => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => {
                      dispatch(switchMode(opt.value));
                      setShowModeMenu(false);
                    }}
                    style={[
                      styles.modeMenuItem,
                      mode === opt.value && styles.modeMenuItemActive,
                      idx < modeOptions.length - 1 && styles.modeMenuItemBorder,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.modeMenuText,
                        mode === opt.value && styles.modeMenuTextActive,
                      ]}
                    >
                      {opt.icon} {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* User row */}
        <View style={styles.userRow}>
          <View style={styles.userLeft}>
            <View style={styles.avatar}>
              <AppIcon name="profileAvatar" size={20} color="#0D3B1F" />
            </View>
            <View>
              <Text style={styles.userName}>{displayName}</Text>
              <View style={styles.cityRow}>
                <AppIcon
                  name="profileCity"
                  size={11}
                  color="rgba(255,255,255,0.55)"
                />
                <Text style={styles.cityText}>{displayCity}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={styles.notifBtn}
            activeOpacity={0.8}
          >
            <AppIcon name="menuNotifications" size={20} color="#FFFFFF" />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── STATS STRIP ── */}
      <View style={styles.statsStrip}>
        {stats.map(s => (
          <View
            key={s.label}
            style={[styles.statPill, { backgroundColor: s.bg }]}
          >
            <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* ── SCROLL CONTENT ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Market Rates */}
        <MarketRates navigation={navigation} />

        {isBuyer ? (
          <>
            {/* Featured Categories */}
            <View style={styles.featuredHeader}>
              <Text style={styles.featuredTitle}>Featured Categories</Text>
              <Text style={styles.featuredSub}>
                Browse top commodities by category
              </Text>
            </View>

            <CategorySection navigation={navigation} />
          </>
        ) : (
          <>
            {/* Seller earnings card */}
            <View style={styles.earningsCard}>
              <Text style={styles.earningsLabel}>
                {t('home.totalEarningsMonth')}
              </Text>
              <Text style={styles.earningsVal}>PKR 890,000</Text>
              <View style={styles.earningsRow}>
                {[
                  { l: t('home.released'), v: '₨640K', c: '#FFFFFF' },
                  { l: t('home.pending'), v: '₨250K', c: '#F3CD03' },
                  { l: t('home.thisWeek'), v: '₨120K', c: '#FFFFFF' },
                ].map(s => (
                  <View key={s.l}>
                    <Text style={styles.earningsSubLabel}>{s.l}</Text>
                    <Text style={[styles.earningsSubVal, { color: s.c }]}>
                      {s.v}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <Text style={styles.qaSectionTitle}>{t('home.quickActions')}</Text>
            <View style={styles.qaGrid}>
              {QUICK_ACTIONS.map(a => (
                <TouchableOpacity
                  key={a.labelKey}
                  style={[styles.qaCard, { width: (W - 42) / 2 }]}
                  activeOpacity={0.85}
                >
                  <View style={[styles.qaIconBox, { backgroundColor: a.bg }]}>
                    <Text style={[styles.qaEmoji, { color: a.color }]}>
                      {a.emoji}
                    </Text>
                  </View>
                  <Text style={styles.qaTitle}>{t(a.labelKey)}</Text>
                  <Text style={styles.qaSub}>{t(a.subKey)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

// ── STYLES ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F9FAFB' },

  // Header
  header: {
    backgroundColor: '#0D3B1F',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 20,
    overflow: 'visible',
    position: 'relative',
    zIndex: 20,
    elevation: 20,
  },
  orbTR: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(33,122,60,0.2)',
  },
  orbBL: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(243,205,3,0.067)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    zIndex: 80,
    elevation: 20,
    position: 'relative',
  },
  logo: { height: 34, width: 34 },
  modeSelectorWrap: {
    position: 'relative',
    zIndex: 100,
    elevation: 30,
  },
  modeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.094)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingLeft: 12,
    paddingRight: 10,
  },
  modeBtnText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  modeMenu: {
    position: 'absolute',
    right: 0,
    top: 44,
    width: 150,
    backgroundColor: '#0D3B1F',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    zIndex: 1000,
    elevation: 40,
    overflow: 'hidden',
  },
  modeMenuItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  modeMenuItemActive: { backgroundColor: 'rgba(255,255,255,0.12)' },
  modeMenuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  modeMenuText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  modeMenuTextActive: { color: '#F3CD03' },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.094)',
    marginBottom: 14,
    zIndex: 1,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
    position: 'relative',
  },
  userLeft: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F3CD03',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    flexShrink: 0,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  cityText: { fontSize: 11, color: 'rgba(255,255,255,0.533)' },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.082)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.145)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 9,
    height: 9,
    backgroundColor: '#F3CD03',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#0D3B1F',
  },

  // Stats strip
  statsStrip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statPill: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statVal: { fontSize: 16, fontWeight: '800' },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },

  // Scroll & sections
  scrollContent: { paddingBottom: 100 },
  // Featured header
  featuredHeader: { paddingHorizontal: 16, marginBottom: 4 },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.3,
  },
  featuredSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },

  // Seller earnings card
  earningsCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#145228',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 4,
  },
  earningsLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  earningsVal: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
  },
  earningsRow: { flexDirection: 'row', gap: 18, marginTop: 12 },
  earningsSubLabel: { fontSize: 11, color: 'rgba(255,255,255,0.55)' },
  earningsSubVal: { fontSize: 13, fontWeight: '700', marginTop: 1 },
  qaSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  qaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
  },
  qaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  qaIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  qaEmoji: { fontSize: 22 },
  qaTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  qaSub: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
});

export default HomeScreen;
