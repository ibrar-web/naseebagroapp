import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, StatusBar,
} from 'react-native';
import { Colors as C, Spacing, Radius, Shadow } from '../../../constants/theme';
import { useAppSelector } from '../../../store';

const CATEGORIES = ['All', 'Grains', 'Cotton', 'Vegetables', 'Oilseeds', 'Fruits', 'Spices'];

const COMMODITIES = [
  { id: 'L001', name: 'Premium Wheat',       qty: '500 Tons',  price: '₨3,850/40kg', location: 'Lahore',      emoji: '🌾', seller: 'Asad Traders',    verified: true  },
  { id: 'L002', name: 'IRRI-6 Rice',         qty: '200 Tons',  price: '₨4,200/40kg', location: 'Sheikhupura', emoji: '🍚', seller: 'Punjab Agri Co',  verified: true  },
  { id: 'L003', name: 'Desi Cotton Grade A', qty: '150 Tons',  price: '₨8,500/40kg', location: 'Multan',      emoji: '☁️', seller: 'Cotton King',     verified: false },
  { id: 'L004', name: 'Yellow Maize',        qty: '800 Tons',  price: '₨2,600/40kg', location: 'Faisalabad',  emoji: '🌽', seller: 'Farm Fresh Ltd',  verified: true  },
  { id: 'L005', name: 'Mustard Seeds',       qty: '100 Tons',  price: '₨6,100/40kg', location: 'Gujranwala',  emoji: '🌻', seller: 'Seed Masters',    verified: false },
  { id: 'L006', name: 'Sugarcane Raw',       qty: '1000 Tons', price: '₨340/40kg',   location: 'Mirpur Khas', emoji: '🎋', seller: 'South Agri Corp', verified: true  },
];

const DEMANDS = [
  { id: 'D001', commodity: 'Wheat',  qty: '200 Tons', budget: '₨3,900/40kg', location: 'Lahore',     date: '2 days ago', status: 'Active'   },
  { id: 'D002', commodity: 'Rice',   qty: '50 Tons',  budget: '₨4,100/40kg', location: 'Karachi',    date: '4 days ago', status: 'Pending'  },
  { id: 'D003', commodity: 'Cotton', qty: '80 Tons',  budget: '₨8,200/40kg', location: 'Faisalabad', date: '1 week ago', status: 'Active'   },
];

const CommodityCard = ({ item, onPress }: any) => (
  <TouchableOpacity style={styles.commodityCard} onPress={onPress} activeOpacity={0.88}>
    <View style={styles.commodityEmoji}>
      <Text style={{ fontSize: 36 }}>{item.emoji}</Text>
    </View>
    <View style={styles.commodityInfo}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text style={styles.commodityName}>{item.name}</Text>
        {item.verified && <Text style={styles.verifiedBadge}>✓</Text>}
      </View>
      <Text style={styles.commodityMeta}>{item.qty} · 📍 {item.location}</Text>
      <Text style={styles.commoditySeller}>by {item.seller}</Text>
    </View>
    <View style={{ alignItems: 'flex-end' }}>
      <Text style={styles.commodityPrice}>{item.price}</Text>
      <TouchableOpacity style={styles.interestBtn} activeOpacity={0.85}>
        <Text style={styles.interestBtnText}>Interest</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const DemandCard = ({ item }: any) => (
  <TouchableOpacity style={styles.demandCard} activeOpacity={0.88}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
      <Text style={styles.demandId}>{item.id}</Text>
      <View style={[styles.statusBadge, item.status === 'Active' ? styles.statusActive : styles.statusPending]}>
        <Text style={[styles.statusText, item.status === 'Active' ? { color: C.green700 } : { color: '#D97706' }]}>
          {item.status}
        </Text>
      </View>
    </View>
    <Text style={styles.demandCommodity}>{item.commodity}</Text>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
      <Text style={styles.demandMeta}>{item.qty}</Text>
      <Text style={styles.demandBudget}>{item.budget}</Text>
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
      <Text style={styles.demandLocation}>📍 {item.location}</Text>
      <Text style={styles.demandDate}>{item.date}</Text>
    </View>
    <TouchableOpacity style={styles.offerBtn} activeOpacity={0.85}>
      <Text style={styles.offerBtnText}>Submit Offer →</Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

const MarketplaceScreen = ({ navigation }: any) => {
  const mode = useAppSelector(s => s.app.mode);
  const isBuyer = mode === 'buyer';
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = COMMODITIES.filter(c =>
    (activeCategory === 'All' || c.name.toLowerCase().includes(activeCategory.toLowerCase())) &&
    (!search || c.name.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.green900} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>{isBuyer ? 'Buy Commodities' : 'Buyer Demands'}</Text>
            <Text style={styles.headerCount}>
              {isBuyer ? `${filtered.length} listings available` : `${DEMANDS.length} active requests`}
            </Text>
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={{ fontSize: 14 }}>⚙️</Text>
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            placeholder={isBuyer ? 'Search commodities, locations...' : 'Search buyer requests...'}
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>

        {/* Category chips */}
        {isBuyer && (
          <FlatList
            horizontal
            data={CATEGORIES}
            keyExtractor={c => c}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setActiveCategory(item)}
                style={[styles.chip, activeCategory === item && styles.chipActive]}
              >
                <Text style={[styles.chipText, activeCategory === item && styles.chipTextActive]}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* List */}
      <FlatList
        data={(isBuyer ? filtered : DEMANDS) as any[]}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) =>
          isBuyer
            ? <CommodityCard item={item} onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })} />
            : <DemandCard item={item} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 40 }}>🔍</Text>
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySub}>Try adjusting your search or filters</Text>
          </View>
        }
      />

      {!isBuyer && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Post')} activeOpacity={0.88}>
          <Text style={{ fontSize: 24, color: C.white }}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default MarketplaceScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.gray50 },

  header: {
    backgroundColor: C.green900,
    paddingTop: 48,
    paddingBottom: 4,
    paddingHorizontal: Spacing.base,
  },
  headerRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.white },
  headerCount: { fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 },

  filterBtn: {
    flexDirection: 'row', gap: 6, alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.lg, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  filterText: { fontSize: 12, fontWeight: '600', color: C.white },

  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.lg, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 10,
  },
  searchInput: { flex: 1, fontSize: 13, color: C.white },

  chips:        { paddingBottom: 12, gap: 8 },
  chip:         { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(255,255,255,0.1)' },
  chipActive:   { backgroundColor: C.orange500, borderColor: C.orange500 },
  chipText:     { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  chipTextActive: { color: C.gray900, fontWeight: '800' },

  list: { padding: Spacing.base, paddingBottom: 100 },

  commodityCard: {
    flexDirection: 'row', gap: 12, alignItems: 'center',
    backgroundColor: C.white, borderRadius: Radius.xl,
    padding: 14, marginBottom: 10, ...Shadow.sm,
  },
  commodityEmoji: {
    width: 60, height: 60, borderRadius: Radius.lg,
    backgroundColor: C.green50, alignItems: 'center', justifyContent: 'center',
  },
  commodityInfo: { flex: 1 },
  commodityName: { fontSize: 14, fontWeight: '700', color: C.gray900 },
  verifiedBadge: { fontSize: 12, color: C.green600, backgroundColor: C.green100, paddingHorizontal: 5, borderRadius: 6 },
  commodityMeta: { fontSize: 11, color: C.gray500, marginTop: 2 },
  commoditySeller: { fontSize: 11, color: C.gray400, marginTop: 1 },
  commodityPrice: { fontSize: 13, fontWeight: '800', color: C.green700 },
  interestBtn: { marginTop: 8, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: C.green700, borderRadius: Radius.md },
  interestBtnText: { fontSize: 11, fontWeight: '700', color: C.white },

  demandCard: { backgroundColor: C.white, borderRadius: Radius.xl, padding: 14, marginBottom: 10, ...Shadow.sm },
  demandId:   { fontSize: 10, color: C.gray400, fontFamily: 'monospace' },
  demandCommodity: { fontSize: 16, fontWeight: '800', color: C.gray900 },
  demandMeta:     { fontSize: 12, color: C.gray600 },
  demandBudget:   { fontSize: 14, fontWeight: '800', color: C.green700 },
  demandLocation: { fontSize: 11, color: C.gray500 },
  demandDate:     { fontSize: 11, color: C.gray400 },
  offerBtn: {
    marginTop: 12, backgroundColor: C.green700,
    borderRadius: Radius.md, paddingVertical: 10, alignItems: 'center',
  },
  offerBtnText: { fontSize: 13, fontWeight: '700', color: C.white },

  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  statusActive: { backgroundColor: C.green50 },
  statusPending: { backgroundColor: '#FEF3C7' },
  statusText:   { fontSize: 11, fontWeight: '700' },

  empty:      { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.gray800 },
  emptySub:   { fontSize: 13, color: C.gray400 },

  fab: {
    position: 'absolute', bottom: 90, right: 20,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: C.green600, alignItems: 'center', justifyContent: 'center',
    ...Shadow.lg,
  },
});
