import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import MockStatusBar from '../../components/MockStatusBar';

const RATES_DATA = [
  {
    id: '1',
    name: 'Basmati Rice',
    category: 'Grains',
    mill: 'Gujranwala Mill A',
    price: 'PKR 4,200',
    prevPrice: 'PKR 4,110',
    unit: '/40kg',
    change: '+2.1%',
    up: true,
    updatedAt: 'Today 9:00 AM',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=75',
    fallback: '#8A9A5B',
  },
  {
    id: '2',
    name: 'Punjab Wheat',
    category: 'Grains',
    mill: 'Faisalabad Mill B',
    price: 'PKR 2,800',
    prevPrice: 'PKR 2,823',
    unit: '/40kg',
    change: '-0.8%',
    up: false,
    updatedAt: 'Today 9:00 AM',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=75',
    fallback: '#C29A4A',
  },
  {
    id: '3',
    name: 'Desi Cotton',
    category: 'Cotton',
    mill: 'Multan Mill A',
    price: 'PKR 8,500',
    prevPrice: 'PKR 8,382',
    unit: '/40kg',
    change: '+1.4%',
    up: true,
    updatedAt: 'Today 9:00 AM',
    image: 'https://images.unsplash.com/photo-1594179047519-f347310d3322?w=400&q=75',
    fallback: '#D8D6C7',
  },
  {
    id: '4',
    name: 'Yellow Maize',
    category: 'Grains',
    mill: 'Okara Mill A',
    price: 'PKR 1,900',
    prevPrice: 'PKR 1,923',
    unit: '/40kg',
    change: '-1.2%',
    up: false,
    updatedAt: 'Today 9:00 AM',
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=75',
    fallback: '#DCA640',
  },
  {
    id: '5',
    name: 'Mustard Seed',
    category: 'Oilseeds',
    mill: 'Sahiwal Mill A',
    price: 'PKR 6,200',
    prevPrice: 'PKR 6,169',
    unit: '/40kg',
    change: '+0.5%',
    up: true,
    updatedAt: 'Today 8:45 AM',
    image: 'https://images.unsplash.com/photo-1535567465397-7523840f2ae9?w=400&q=75',
    fallback: '#D9A825',
  },
  {
    id: '6',
    name: 'Sugarcane',
    category: 'Crops',
    mill: 'Lahore Mill A',
    price: 'PKR 750',
    prevPrice: 'PKR 755',
    unit: '/40kg',
    change: '-0.7%',
    up: false,
    updatedAt: 'Today 8:30 AM',
    image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400&q=75',
    fallback: '#5A8C3A',
  },
  {
    id: '7',
    name: 'IRRI-6 Rice',
    category: 'Grains',
    mill: 'Sheikhupura Mill A',
    price: 'PKR 3,400',
    prevPrice: 'PKR 3,340',
    unit: '/40kg',
    change: '+1.8%',
    up: true,
    updatedAt: 'Today 9:00 AM',
    image: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&q=75',
    fallback: '#A3B77A',
  },
  {
    id: '8',
    name: 'Sunflower Seed',
    category: 'Oilseeds',
    mill: 'Multan Mill B',
    price: 'PKR 5,100',
    prevPrice: 'PKR 5,100',
    unit: '/40kg',
    change: '0.0%',
    up: true,
    updatedAt: 'Today 8:00 AM',
    image: 'https://images.unsplash.com/photo-1597131628149-a2c31d6e14ab?w=400&q=75',
    fallback: '#E8C53A',
  },
];

const CATEGORIES = ['All', 'Grains', 'Cotton', 'Oilseeds', 'Crops'];

const RateCard = ({ item }: { item: (typeof RATES_DATA)[number] }) => {
  const changeColor = item.up ? '#16A34A' : '#DC2626';
  const changeBg = item.up ? '#DCFCE7' : '#FEE2E2';

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: item.image }}
        style={styles.cardImage}
        defaultSource={{ uri: '' }}
      />
      <View
        style={[styles.cardImagePlaceholder, { backgroundColor: item.fallback }]}
      />

      <View style={styles.cardMiddle}>
        <Text style={styles.commodityName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.millName} numberOfLines={1}>
          {item.mill}
        </Text>
        <Text style={styles.prevRate}>
          Prev: {item.prevPrice}{item.unit}
        </Text>
        <Text style={styles.updatedAt}>{item.updatedAt}</Text>
      </View>

      <View style={styles.cardRight}>
        <Text style={styles.rateLabel}>TODAY'S RATE</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{item.price}</Text>
          <Text style={styles.unit}>{item.unit}</Text>
        </View>
        <View style={[styles.changeBadge, { backgroundColor: changeBg }]}>
          <Text style={[styles.changeArrow, { color: changeColor }]}>
            {item.up ? '▲' : '▼'}
          </Text>
          <Text style={[styles.changeText, { color: changeColor }]}>
            {item.change}
          </Text>
        </View>
      </View>
    </View>
  );
};

const MarketRatesScreen = ({ navigation }: any) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = RATES_DATA.filter(item => {
    const matchesCategory =
      activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      search === '' ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.mill.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <MockStatusBar backgroundColor="#0D3B1F" textColor="#FFFFFF" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.headerTitleText}>Market Rates</Text>
            <Text style={styles.headerSubtitle}>
              Today's indicative rates · Admin updated
            </Text>
          </View>
          <TouchableOpacity style={styles.latestButton} activeOpacity={0.8}>
            <Text style={styles.latestIcon}>〜</Text>
            <Text style={styles.latestText}>Latest</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search commodity..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
              style={styles.clearButton}
            >
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(cat)}
                style={[styles.tab, isActive && styles.tabActive]}
                activeOpacity={0.75}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Warning Banner */}
      <View style={styles.warningBanner}>
        <Text style={styles.warningIcon}>⚠</Text>
        <Text style={styles.warningText}>
          Indicative rates only. Actual transaction price may vary.
        </Text>
      </View>

      {/* Rate List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <RateCard item={item} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyTitle}>No rates found</Text>
            <Text style={styles.emptySubtitle}>
              Try a different search or category
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#0D3B1F',
    paddingTop: 6,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.133)',
    borderRadius: 10,
    padding: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '300',
    lineHeight: 24,
    marginTop: -2,
  },
  headerTitle: {
    flex: 1,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 1,
  },
  latestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.133)',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 11,
  },
  latestIcon: {
    fontSize: 11,
    color: '#FFFFFF',
  },
  latestText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  searchIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
    paddingVertical: 9,
  },
  clearButton: {
    padding: 4,
  },
  clearText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  tabsWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tabsScroll: {
    paddingHorizontal: 4,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#217A3C',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    fontWeight: '800',
    color: '#1A6B34',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(243,205,3,0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(243,205,3,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  warningIcon: {
    fontSize: 11,
    color: '#F3CD03',
  },
  warningText: {
    fontSize: 10,
    color: '#92400E',
    flex: 1,
  },
  listContent: {
    padding: 12,
    paddingBottom: 100,
    gap: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'stretch',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardImagePlaceholder: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 64,
    bottom: 0,
  },
  cardImage: {
    width: 64,
    alignSelf: 'stretch',
  },
  cardMiddle: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 4,
    justifyContent: 'center',
    gap: 2,
  },
  commodityName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  millName: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 1,
  },
  prevRate: {
    fontSize: 9,
    color: '#D1D5DB',
    marginTop: 3,
  },
  updatedAt: {
    fontSize: 9,
    color: '#D1D5DB',
    marginTop: 1,
  },
  cardRight: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    flexShrink: 0,
  },
  rateLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.3,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A6B34',
    letterSpacing: -0.4,
    lineHeight: 22,
  },
  unit: {
    fontSize: 9,
    color: '#9CA3AF',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  changeArrow: {
    fontSize: 9,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 10,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
  },
});

export default MarketRatesScreen;
