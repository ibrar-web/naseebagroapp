import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList,
  TouchableOpacity, StatusBar, Dimensions,
} from 'react-native';
import { Colors as C, Spacing, Radius, Shadow } from '../../../constants/theme';
import { useAppSelector, useAppDispatch } from '../../../store';
import { switchMode } from '../../../store/slices/appSlice';

const { width: W } = Dimensions.get('window');

const STATS_BUYER = [
  { label: 'Active Deals', val: '3',     color: C.green600,  bg: C.green50   },
  { label: 'Demands',      val: '7',     color: C.blue500,   bg: '#EEF6FF'   },
  { label: 'Total Spent',  val: '₨2.4M', color: C.orange600, bg: C.orange100 },
];
const STATS_SELLER = [
  { label: 'Supplies',  val: '5',     color: C.green600,  bg: C.green50   },
  { label: 'Orders',    val: '4',     color: C.blue500,   bg: '#EEF6FF'   },
  { label: 'Earnings',  val: '₨890K', color: C.orange600, bg: C.orange100 },
];

const MARKET_DATA = [
  { name: 'Wheat',     price: '₨3,850/40kg',  change: '+2.1%',  up: true  },
  { name: 'Rice IRRI', price: '₨4,200/40kg',  change: '-0.8%',  up: false },
  { name: 'Cotton',    price: '₨8,500/40kg',  change: '+1.4%',  up: true  },
  { name: 'Maize',     price: '₨2,600/40kg',  change: '+0.5%',  up: true  },
  { name: 'Mustard',   price: '₨6,100/40kg',  change: '-1.2%',  up: false },
];

const LISTINGS = [
  { id: 'L001', name: 'Premium Wheat',  qty: '500 Tons',  price: '₨3,850/40kg', location: 'Lahore',    emoji: '🌾' },
  { id: 'L002', name: 'IRRI-6 Rice',    qty: '200 Tons',  price: '₨4,200/40kg', location: 'Sheikhupura', emoji: '🍚' },
  { id: 'L003', name: 'Desi Cotton',    qty: '150 Tons',  price: '₨8,500/40kg', location: 'Multan',    emoji: '☁️' },
];

const CATEGORIES = [
  { name: 'Grains',      emoji: '🌾', color: C.green100  },
  { name: 'Cotton',      emoji: '☁️', color: '#EEF6FF'   },
  { name: 'Vegetables',  emoji: '🥬', color: '#F0FDF4'   },
  { name: 'Oilseeds',    emoji: '🌻', color: C.orange100 },
];

const QUICK_ACTIONS = [
  { label: 'Create Supply',  sub: 'List your stock',   emoji: '➕', color: C.orange500, bg: C.orange100 },
  { label: 'My Listings',    sub: 'Manage stock',      emoji: '📋', color: C.green600,  bg: C.green50   },
  { label: 'View Orders',    sub: 'Track deals',       emoji: '📦', color: C.blue500,   bg: '#EEF6FF'   },
  { label: 'Payouts',        sub: 'Earnings history',  emoji: '💰', color: '#7C3AED',   bg: '#EDE9FE'   },
];

const HomeScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(s => s.app.mode);
  const isBuyer = mode === 'buyer';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.green900} />

      {/* ── Header ──────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={[styles.orb, { top: -40, right: -40, width: 180, height: 180, opacity: 0.2 }]} />
        <View style={[styles.orb, { bottom: -20, left: -20, width: 100, height: 100, backgroundColor: C.orange500, opacity: 0.1 }]} />

        {/* Row 1: logo + mode switcher */}
        <View style={styles.row}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 28 }}>🌾</Text>
            <View>
              <Text style={styles.logoText}>naseeb</Text>
              <Text style={styles.logoSub}>AGRI MARKET</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {(['buyer', 'seller'] as const).map(m => (
              <TouchableOpacity
                key={m}
                onPress={() => dispatch(switchMode(m))}
                style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
              >
                <Text style={[styles.modeBtnText, mode === m && styles.modeBtnTextActive]}>
                  {m === 'buyer' ? '🛒 Buyer' : '📦 Seller'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Row 2: user + bell */}
        <View style={styles.row}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={styles.avatar}><Text style={{ fontSize: 20 }}>👤</Text></View>
            <View>
              <Text style={styles.userName}>Muhammad Asad</Text>
              <Text style={styles.userLocation}>📍 Lahore, Punjab</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bellBtn}>
            <Text style={{ fontSize: 20 }}>🔔</Text>
            <View style={styles.bellDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Stats strip ─────────────────────────────────────────── */}
      <View style={styles.statsStrip}>
        {(isBuyer ? STATS_BUYER : STATS_SELLER).map(s => (
          <View key={s.label} style={[styles.statBox, { backgroundColor: s.bg }]}>
            <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* ── Body ────────────────────────────────────────────────── */}
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        {/* Market rates */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Market Rates</Text>
          <TouchableOpacity><Text style={styles.sectionAction}>See All</Text></TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={MARKET_DATA}
          keyExtractor={i => i.name}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingHorizontal: Spacing.base, paddingBottom: 4 }}
          renderItem={({ item }) => (
            <View style={styles.rateCard}>
              <Text style={styles.rateName}>{item.name}</Text>
              <Text style={styles.ratePrice}>{item.price}</Text>
              <Text style={[styles.rateChange, { color: item.up ? C.green600 : C.red500 }]}>
                {item.up ? '▲' : '▼'} {item.change}
              </Text>
            </View>
          )}
        />

        {isBuyer ? (
          <>
            {/* Featured listings */}
            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
              <Text style={styles.sectionTitle}>Featured Supplies</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Market')}>
                <Text style={styles.sectionAction}>View All</Text>
              </TouchableOpacity>
            </View>
            {LISTINGS.map(l => (
              <TouchableOpacity
                key={l.id}
                onPress={() => navigation.navigate('ListingDetail', { listingId: l.id })}
                style={styles.listingCard}
                activeOpacity={0.88}
              >
                <View style={styles.listingEmojiWrap}>
                  <Text style={{ fontSize: 28 }}>{l.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.listingName}>{l.name}</Text>
                  <Text style={styles.listingMeta}>{l.qty} · 📍 {l.location}</Text>
                </View>
                <Text style={styles.listingPrice}>{l.price}</Text>
              </TouchableOpacity>
            ))}

            {/* Categories */}
            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
              <Text style={styles.sectionTitle}>Browse Categories</Text>
              <TouchableOpacity><Text style={styles.sectionAction}>All</Text></TouchableOpacity>
            </View>
            <View style={styles.categoriesGrid}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.name}
                  style={[styles.categoryCard, { backgroundColor: cat.color }]}
                  activeOpacity={0.85}
                >
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Earnings card */}
            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
              <Text style={styles.sectionTitle}>Earnings Overview</Text>
            </View>
            <View style={styles.earningsCard}>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Total Earnings (This Month)</Text>
              <Text style={styles.earningsAmount}>PKR 890,000</Text>
              <View style={{ flexDirection: 'row', gap: 20, marginTop: 12 }}>
                {[
                  { label: 'Released',  val: '₨640K', color: C.white     },
                  { label: 'Pending',   val: '₨250K', color: C.orange400 },
                  { label: 'This Week', val: '₨120K', color: C.white     },
                ].map(s => (
                  <View key={s.label}>
                    <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{s.label}</Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: s.color }}>{s.val}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Quick actions */}
            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
            </View>
            <View style={styles.quickGrid}>
              {QUICK_ACTIONS.map(a => (
                <TouchableOpacity key={a.label} style={[styles.qaCard, Shadow.sm]} activeOpacity={0.85}>
                  <View style={[styles.qaIcon, { backgroundColor: a.bg }]}>
                    <Text style={{ fontSize: 22 }}>{a.emoji}</Text>
                  </View>
                  <Text style={styles.qaLabel}>{a.label}</Text>
                  <Text style={styles.qaSub}>{a.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.gray50 },

  header: {
    backgroundColor: C.green900,
    paddingHorizontal: Spacing.base,
    paddingTop: 48,
    paddingBottom: Spacing.base,
    overflow: 'hidden',
  },
  orb: { position: 'absolute', borderRadius: 999, backgroundColor: C.green600 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: 8 },

  logoText: { fontSize: 20, fontWeight: '800', color: C.white, letterSpacing: -0.3 },
  logoSub:  { fontSize: 7,  fontWeight: '700', color: C.gold,  letterSpacing: 2.5 },

  modeBtn:          { paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.md, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  modeBtnActive:    { backgroundColor: C.orange500, borderColor: C.orange500 },
  modeBtnText:      { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  modeBtnTextActive:{ color: C.gray900 },

  avatar:       { width: 44, height: 44, borderRadius: 14, backgroundColor: C.orange500, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  userName:     { fontSize: 16, fontWeight: '800', color: C.white },
  userLocation: { fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 1 },
  bellBtn:      { padding: 10, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', position: 'relative' },
  bellDot:      { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: C.orange500 },

  statsStrip: { flexDirection: 'row', gap: 8, backgroundColor: C.white, paddingHorizontal: Spacing.base, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.gray100, ...Shadow.sm },
  statBox:    { flex: 1, borderRadius: Radius.lg, padding: 10, alignItems: 'center' },
  statVal:    { fontSize: 16, fontWeight: '800' },
  statLabel:  { fontSize: 10, color: C.gray500, marginTop: 2, fontWeight: '500' },

  body: { paddingBottom: 100 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.base, paddingTop: 20, paddingBottom: 10 },
  sectionTitle:  { fontSize: 15, fontWeight: '800', color: C.gray900 },
  sectionAction: { fontSize: 13, color: C.green700, fontWeight: '600' },

  rateCard: {
    backgroundColor: C.white, borderRadius: Radius.xl,
    padding: 14, width: 130,
    ...Shadow.sm,
  },
  rateName:   { fontSize: 12, fontWeight: '700', color: C.gray700 },
  ratePrice:  { fontSize: 13, fontWeight: '800', color: C.gray900, marginTop: 4 },
  rateChange: { fontSize: 11, fontWeight: '700', marginTop: 4 },

  listingCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.white, borderRadius: Radius.xl,
    padding: 14, marginHorizontal: Spacing.base, marginBottom: 10,
    ...Shadow.sm,
  },
  listingEmojiWrap: { width: 52, height: 52, borderRadius: Radius.lg, backgroundColor: C.green50, alignItems: 'center', justifyContent: 'center' },
  listingName:      { fontSize: 14, fontWeight: '700', color: C.gray900 },
  listingMeta:      { fontSize: 11, color: C.gray500, marginTop: 2 },
  listingPrice:     { fontSize: 13, fontWeight: '800', color: C.green700 },

  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: Spacing.base },
  categoryCard:   { width: (W - Spacing.base * 2 - 10) / 2, borderRadius: Radius.xl, padding: 16, alignItems: 'center', gap: 6 },
  categoryEmoji:  { fontSize: 32 },
  categoryName:   { fontSize: 13, fontWeight: '700', color: C.gray800 },

  earningsCard: {
    backgroundColor: C.green800, borderRadius: Radius.xl,
    padding: Spacing.base, marginHorizontal: Spacing.base,
    ...Shadow.md,
  },
  earningsAmount: { fontSize: 28, fontWeight: '800', color: C.white, marginTop: 4 },

  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: Spacing.base },
  qaCard: {
    width: (W - Spacing.base * 2 - 10) / 2,
    backgroundColor: C.white, borderRadius: Radius.xl, padding: 14, gap: 6,
  },
  qaIcon:  { width: 44, height: 44, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  qaLabel: { fontSize: 13, fontWeight: '700', color: C.gray900 },
  qaSub:   { fontSize: 11, color: C.gray400 },
});
