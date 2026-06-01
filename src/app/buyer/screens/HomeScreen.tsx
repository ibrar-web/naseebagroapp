import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '../../../store';
import { switchMode } from '../../../store/slices/appSlice';
import { useTranslation } from '../../../localization';
import type { TranslationKey } from '../../../localization';
import iconRegistry from '../../../assets/icons/iconRegistry';
import { AppIcon } from '../../../assets/icons';
import MockStatusBar from '../../components/MockStatusBar';

const { width: W } = Dimensions.get('window');

// ── DATA ────────────────────────────────────────────────────────────────────

const MARKET_DATA = [
  { name: 'Basmati Rice', mill: 'Gujranwala Mill A', price: 'PKR 4,200', change: '+2.1%', up: true, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80', fallback: '#8A9A5B' },
  { name: 'Punjab Wheat', mill: 'Faisalabad Mill B', price: 'PKR 2,800', change: '-0.8%', up: false, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80', fallback: '#C29A4A' },
  { name: 'Desi Cotton', mill: 'Multan Mill A', price: 'PKR 8,500', change: '+1.4%', up: true, image: 'https://images.unsplash.com/photo-1594179047519-f347310d3322?w=600&q=80', fallback: '#D8D6C7' },
  { name: 'Yellow Maize', mill: 'Okara Mill A', price: 'PKR 1,900', change: '-1.2%', up: false, image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&q=80', fallback: '#DCA640' },
  { name: 'Mustard Seed', mill: 'Sahiwal Mill A', price: 'PKR 6,200', change: '+0.5%', up: true, image: 'https://images.unsplash.com/photo-1535567465397-7523840f2ae9?w=600&q=80', fallback: '#D9A825' },
  { name: 'Sugarcane', mill: 'Rahim Yar Khan Mill', price: 'PKR 280', change: '+3.0%', up: true, image: 'https://images.unsplash.com/photo-1559181567-c3190ca9d715?w=600&q=80', fallback: '#7DC467' },
];

const CATEGORY_SECTIONS = [
  {
    title: '🌾 Grains',
    items: [
      { id: 'L001', name: 'Basmati Rice', location: 'Gujranwala', price: 'PKR 4,200', stock: '500 bags', badge: 'PREMIUM', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&q=80', fallback: '#8A9A5B' },
      { id: 'L002', name: 'Punjab Wheat', location: 'Faisalabad', price: 'PKR 2,800', stock: '1200 bags', badge: 'VERIFIED', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=900&q=80', fallback: '#C29A4A' },
      { id: 'L003', name: 'Yellow Maize', location: 'Okara', price: 'PKR 1,900', stock: '800 bags', badge: 'FRESH', image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=900&q=80', fallback: '#DCA640' },
    ],
  },
  {
    title: '🌿 Cotton',
    items: [
      { id: 'L004', name: 'Desi Cotton', location: 'Multan', price: 'PKR 8,500', stock: '150 bags', badge: 'PREMIUM', image: 'https://images.unsplash.com/photo-1594179047519-f347310d3322?w=900&q=80', fallback: '#D8D6C7' },
      { id: 'L005', name: 'NIAB-78', location: 'Rahim Yar Khan', price: 'PKR 7,800', stock: '200 bags', badge: 'VERIFIED', image: 'https://images.unsplash.com/photo-1594179047519-f347310d3322?w=900&q=80', fallback: '#D8D6C7' },
    ],
  },
];

const QUICK_ACTIONS = [
  { labelKey: 'home.createSupply' as TranslationKey, subKey: 'home.createSupplySub' as TranslationKey, emoji: '+', bg: '#FFFDE6', color: '#D4AE02' },
  { labelKey: 'home.myListings' as TranslationKey, subKey: 'home.myListingsSub' as TranslationKey, emoji: '□', bg: '#E8F7EE', color: '#217A3C' },
  { labelKey: 'home.viewOrders' as TranslationKey, subKey: 'home.viewOrdersSub' as TranslationKey, emoji: '▣', bg: '#EEF6FF', color: '#3B82F6' },
  { labelKey: 'home.payouts' as TranslationKey, subKey: 'home.payoutsSub' as TranslationKey, emoji: '₨', bg: '#F4F0FF', color: '#7C3AED' },
];

// ── SUB-COMPONENTS ───────────────────────────────────────────────────────────

const SectionHeader = ({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {onSeeAll && (
      <TouchableOpacity onPress={onSeeAll} style={styles.seeAllBtn} activeOpacity={0.75}>
        <Text style={styles.seeAllText}>See All</Text>
        <Text style={styles.seeAllChevron}>›</Text>
      </TouchableOpacity>
    )}
  </View>
);

const MarketRateCard = ({ item, onPress }: { item: typeof MARKET_DATA[0]; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={styles.rateCard} activeOpacity={0.88}>
    <ImageBackground
      source={{ uri: item.image }}
      style={styles.rateImage}
      resizeMode="cover"
      imageStyle={{ backgroundColor: item.fallback }}
    >
      <View style={styles.rateImageOverlay} />
      <View style={[styles.changeBadge, { backgroundColor: item.up ? 'rgba(22,163,74,0.88)' : 'rgba(220,38,38,0.88)' }]}>
        <Text style={styles.changeArrow}>{item.up ? '▲' : '▼'}</Text>
        <Text style={styles.changeText}>{item.change}</Text>
      </View>
      <View style={styles.rateNameBox}>
        <Text style={styles.rateName}>{item.name}</Text>
      </View>
    </ImageBackground>
    <View style={styles.rateBody}>
      <View style={styles.rateMillRow}>
        <AppIcon name="listing" size={10} color="#9CA3AF" />
        <Text style={styles.rateMill}>{item.mill}</Text>
      </View>
      <View style={styles.ratePriceRow}>
        <Text style={styles.ratePrice}>{item.price}</Text>
        <Text style={styles.rateUnit}>/40kg</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const CategoryCard = ({
  item,
  onPress,
}: {
  item: typeof CATEGORY_SECTIONS[0]['items'][0];
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress} style={styles.catCard} activeOpacity={0.88}>
    <ImageBackground
      source={{ uri: item.image }}
      style={styles.catImage}
      resizeMode="cover"
      imageStyle={{ backgroundColor: item.fallback }}
    >
      <View style={styles.catImageOverlay} />
      <View style={styles.catBadge}>
        <Text style={styles.catBadgeText}>{item.badge}</Text>
      </View>
      <View style={styles.catInfo}>
        <Text style={styles.catName}>{item.name}</Text>
        <View style={styles.catLocationRow}>
          <Text style={styles.catLocationPin}>📍</Text>
          <Text style={styles.catLocation}>{item.location}</Text>
        </View>
      </View>
    </ImageBackground>
    <View style={styles.catBody}>
      <Text style={styles.catPrice}>{item.price}</Text>
      <Text style={styles.catStock}>per 40kg · {item.stock}</Text>
      <TouchableOpacity
        style={styles.interestBtn}
        onPress={onPress}
        activeOpacity={0.86}
      >
        <Text style={styles.interestBtnText}>Send Interest →</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

// ── MAIN SCREEN ──────────────────────────────────────────────────────────────

const HomeScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(s => s.app.mode);
  const user = useAppSelector(s => s.auth.user);
  const { t } = useTranslation();
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [rateIndex, setRateIndex] = useState(0);
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
        { label: t('home.activeDeals'), val: '3', color: '#217A3C', bg: '#F2FBF5' },
        { label: t('home.demands'), val: '7', color: '#3B82F6', bg: '#EEF6FF' },
        { label: t('home.totalSpent'), val: '₨2.4M', color: '#D4AE02', bg: '#FFFDE6' },
      ]
    : [
        { label: t('home.supplies'), val: '5', color: '#217A3C', bg: '#F2FBF5' },
        { label: t('home.orders'), val: '4', color: '#3B82F6', bg: '#EEF6FF' },
        { label: t('home.earnings'), val: '₨890K', color: '#D4AE02', bg: '#FFFDE6' },
      ];

  const handleRateScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / 172);
    setRateIndex(idx);
  };

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
          <Image source={iconRegistry.naseeb} style={styles.logo} resizeMode="contain" />

          <View style={{ position: 'relative', zIndex: 20 }}>
            <TouchableOpacity
              onPress={() => setShowModeMenu(v => !v)}
              style={styles.modeBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.modeBtnText}>{activeMode.icon} {activeMode.label}</Text>
              <AppIcon name="chevronDown" size={13} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>

            {showModeMenu && (
              <View style={styles.modeMenu}>
                {modeOptions.map((opt, idx) => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => { dispatch(switchMode(opt.value)); setShowModeMenu(false); }}
                    style={[
                      styles.modeMenuItem,
                      mode === opt.value && styles.modeMenuItemActive,
                      idx < modeOptions.length - 1 && styles.modeMenuItemBorder,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.modeMenuText, mode === opt.value && styles.modeMenuTextActive]}>
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
                <AppIcon name="profileCity" size={11} color="rgba(255,255,255,0.55)" />
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
          <View key={s.label} style={[styles.statPill, { backgroundColor: s.bg }]}>
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
        <View style={styles.section}>
          <SectionHeader title={t('home.marketRates')} onSeeAll={() => navigation.navigate('MarketRates')} />
          <FlatList
            horizontal
            data={MARKET_DATA}
            keyExtractor={item => item.name}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingBottom: 6 }}
            snapToInterval={172}
            decelerationRate="fast"
            onScroll={handleRateScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <MarketRateCard item={item} onPress={() => navigation.navigate('MarketRates')} />
            )}
          />
          {/* Dot indicators */}
          <View style={styles.dots}>
            {MARKET_DATA.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === rateIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>
        </View>

        {isBuyer ? (
          <>
            {/* Featured Categories */}
            <View style={styles.featuredHeader}>
              <Text style={styles.featuredTitle}>Featured Categories</Text>
              <Text style={styles.featuredSub}>Browse top commodities by category</Text>
            </View>

            {CATEGORY_SECTIONS.map(section => (
              <View key={section.title} style={styles.section}>
                <SectionHeader
                  title={section.title}
                  onSeeAll={() => navigation.navigate('Market')}
                />
                <FlatList
                  horizontal
                  data={section.items}
                  keyExtractor={item => item.id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12, paddingBottom: 4 }}
                  renderItem={({ item }) => (
                    <CategoryCard
                      item={item}
                      onPress={() => navigation.navigate('CommodityDetail', { listingId: item.id })}
                    />
                  )}
                />
              </View>
            ))}
          </>
        ) : (
          <>
            {/* Seller earnings card */}
            <View style={styles.earningsCard}>
              <Text style={styles.earningsLabel}>{t('home.totalEarningsMonth')}</Text>
              <Text style={styles.earningsVal}>PKR 890,000</Text>
              <View style={styles.earningsRow}>
                {[
                  { l: t('home.released'), v: '₨640K', c: '#FFFFFF' },
                  { l: t('home.pending'), v: '₨250K', c: '#F3CD03' },
                  { l: t('home.thisWeek'), v: '₨120K', c: '#FFFFFF' },
                ].map(s => (
                  <View key={s.l}>
                    <Text style={styles.earningsSubLabel}>{s.l}</Text>
                    <Text style={[styles.earningsSubVal, { color: s.c }]}>{s.v}</Text>
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
                    <Text style={[styles.qaEmoji, { color: a.color }]}>{a.emoji}</Text>
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
    paddingBottom: 20,
    overflow: 'hidden',
    position: 'relative',
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
    zIndex: 1,
    position: 'relative',
  },
  logo: { height: 34, width: 34 },
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
    zIndex: 30,
    elevation: 12,
    overflow: 'hidden',
  },
  modeMenuItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  modeMenuItemActive: { backgroundColor: 'rgba(255,255,255,0.12)' },
  modeMenuItemBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.12)' },
  modeMenuText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  modeMenuTextActive: { color: '#F3CD03' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.094)', marginBottom: 14, zIndex: 1 },
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
  userName: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.2 },
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
  statPill: { flex: 1, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 8, alignItems: 'center' },
  statVal: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 10, color: '#6B7280', marginTop: 2, fontWeight: '500' },

  // Scroll & sections
  scrollContent: { paddingBottom: 100 },
  section: { paddingHorizontal: 16, marginBottom: 20, marginTop: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  seeAllText: { fontSize: 12, color: '#217A3C', fontWeight: '600' },
  seeAllChevron: { fontSize: 14, color: '#217A3C', fontWeight: '700' },

  // Market rate card
  rateCard: {
    width: 162,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  rateImage: { height: 80 },
  rateImageOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  changeBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  changeArrow: { fontSize: 8, color: '#FFFFFF' },
  changeText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },
  rateNameBox: { position: 'absolute', bottom: 7, left: 9, right: 9 },
  rateName: { fontSize: 12, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.2, lineHeight: 14 },
  rateBody: { padding: 8 },
  rateMillRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  rateMill: { fontSize: 10, fontWeight: '600', color: '#6B7280' },
  ratePriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  ratePrice: { fontSize: 17, fontWeight: '900', color: '#1A6B34', letterSpacing: -0.4, lineHeight: 20 },
  rateUnit: { fontSize: 9, color: '#9CA3AF', fontWeight: '500' },

  // Dots
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 6 },
  dot: { height: 6, borderRadius: 3 },
  dotActive: { width: 20, backgroundColor: '#217A3C' },
  dotInactive: { width: 6, backgroundColor: '#E5E7EB' },

  // Featured header
  featuredHeader: { paddingHorizontal: 16, marginBottom: 4 },
  featuredTitle: { fontSize: 18, fontWeight: '800', color: '#111827', letterSpacing: -0.3 },
  featuredSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },

  // Category card
  catCard: {
    width: 180,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  catImage: { height: 110 },
  catImageOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  catBadge: {
    position: 'absolute',
    top: 8,
    left: 10,
    zIndex: 3,
    backgroundColor: '#F3CD03',
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  catBadgeText: { fontSize: 8, fontWeight: '800', color: '#0D3B1F' },
  catInfo: { position: 'absolute', bottom: 8, left: 10, zIndex: 3 },
  catName: { fontSize: 13, fontWeight: '900', color: '#FFFFFF' },
  catLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 1 },
  catLocationPin: { fontSize: 8 },
  catLocation: { fontSize: 9, color: 'rgba(255,255,255,0.7)' },
  catBody: { padding: 10 },
  catPrice: { fontSize: 17, fontWeight: '900', color: '#1A6B34' },
  catStock: { fontSize: 10, color: '#9CA3AF', marginTop: 1 },
  interestBtn: {
    marginTop: 8,
    width: '100%',
    paddingVertical: 8,
    backgroundColor: '#F3CD03',
    borderRadius: 9,
    alignItems: 'center',
  },
  interestBtnText: { fontSize: 11, fontWeight: '700', color: '#0D3B1F' },

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
  earningsVal: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginTop: 4 },
  earningsRow: { flexDirection: 'row', gap: 18, marginTop: 12 },
  earningsSubLabel: { fontSize: 11, color: 'rgba(255,255,255,0.55)' },
  earningsSubVal: { fontSize: 13, fontWeight: '700', marginTop: 1 },
  qaSectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', paddingHorizontal: 16, marginBottom: 10 },
  qaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16 },
  qaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  qaIconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  qaEmoji: { fontSize: 22 },
  qaTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  qaSub: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
});

export default HomeScreen;
