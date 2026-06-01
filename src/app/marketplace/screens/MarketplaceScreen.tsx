import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import { useAppSelector } from '../../../store';
import { useTranslation } from '../../../localization';
import { AppIcon } from '../../../assets/icons';

const CATEGORIES = [
  {
    name: 'Grains',
    count: '142',
    image:
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=75',
    fallback: '#D8B45F',
  },
  {
    name: 'Cotton',
    count: '67',
    image:
      'https://images.unsplash.com/photo-1594179047519-f347310d3322?w=400&q=75',
    fallback: '#D8D6C7',
  },
  {
    name: 'Vegetables',
    count: '89',
    image:
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=75',
    fallback: '#4E9A51',
  },
  {
    name: 'Oilseeds',
    count: '54',
    image:
      'https://images.unsplash.com/photo-1535567465397-7523840f2ae9?w=400&q=75',
    fallback: '#D9A825',
  },
  {
    name: 'Fruits',
    count: '38',
    image:
      'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=75',
    fallback: '#C95347',
  },
  {
    name: 'Spices',
    count: '29',
    image:
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=75',
    fallback: '#9A5B3D',
  },
];

const COMMODITIES = [
  {
    id: 'L001',
    displayId: 'LST-2024-004',
    name: 'Sugarcane',
    category: 'Grains',
    qty: '10,000 kg total',
    location: 'Rahim Yar Khan',
    seller: 'South Agri Corp',
    rating: '4.8',
    reviews: '24',
    verified: true,
    badge: 'FRESH',
    image:
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=900&q=80',
    fallback: '#5F8F4E',
    mills: [
      {
        name: 'Rahim Yar Khan Mill A',
        avail: '200 bags avail.',
        price: 'PKR 280',
      },
      { name: 'Faisalabad Mill B', avail: '150 bags avail.', price: 'PKR 200' },
      { name: 'Lahore Mill C', avail: '100 bags avail.', price: 'PKR 400' },
    ],
  },
  {
    id: 'L002',
    displayId: 'LST-2024-002',
    name: 'Yellow Maize',
    category: 'Grains',
    qty: '14,000 kg total',
    location: 'Okara',
    seller: 'Farm Fresh Ltd',
    rating: '4.7',
    reviews: '18',
    verified: true,
    badge: 'READY',
    image:
      'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=900&q=80',
    fallback: '#DCA640',
    mills: [
      { name: 'Okara Mill A', avail: '340 bags avail.', price: 'PKR 1,900' },
      { name: 'Sahiwal Mill B', avail: '120 bags avail.', price: 'PKR 1,860' },
    ],
  },
  {
    id: 'L003',
    displayId: 'LST-2024-001',
    name: 'Basmati Rice',
    category: 'Grains',
    qty: '8,000 kg total',
    location: 'Gujranwala',
    seller: 'Punjab Agri Co',
    rating: '4.9',
    reviews: '31',
    verified: true,
    badge: 'FRESH',
    image:
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&q=80',
    fallback: '#8A9A5B',
    mills: [
      {
        name: 'Gujranwala Mill A',
        avail: '250 bags avail.',
        price: 'PKR 4,200',
      },
      { name: 'Lahore Mill B', avail: '160 bags avail.', price: 'PKR 4,150' },
    ],
  },
  {
    id: 'L004',
    displayId: 'LST-2024-005',
    name: 'Punjab Wheat',
    category: 'Grains',
    qty: '12,000 kg total',
    location: 'Faisalabad',
    seller: 'Asad Traders',
    rating: '4.6',
    reviews: '16',
    verified: true,
    badge: 'VERIFIED',
    image:
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=900&q=80',
    fallback: '#C29A4A',
    mills: [
      {
        name: 'Faisalabad Mill B',
        avail: '280 bags avail.',
        price: 'PKR 2,800',
      },
      {
        name: 'Sheikhupura Mill C',
        avail: '110 bags avail.',
        price: 'PKR 2,760',
      },
    ],
  },
  {
    id: 'L005',
    displayId: 'LST-2024-006',
    name: 'Mustard Seed',
    category: 'Oilseeds',
    qty: '4,500 kg total',
    location: 'Sahiwal',
    seller: 'Seed Masters',
    rating: '4.5',
    reviews: '12',
    verified: false,
    badge: 'NEW',
    image:
      'https://images.unsplash.com/photo-1535567465397-7523840f2ae9?w=900&q=80',
    fallback: '#D9A825',
    mills: [
      { name: 'Sahiwal Mill A', avail: '90 bags avail.', price: 'PKR 6,200' },
      { name: 'Multan Mill B', avail: '70 bags avail.', price: 'PKR 6,050' },
    ],
  },
  {
    id: 'L006',
    displayId: 'LST-2024-007',
    name: 'Desi Cotton',
    category: 'Cotton',
    qty: '6,000 kg total',
    location: 'Multan',
    seller: 'Cotton King',
    rating: '4.8',
    reviews: '20',
    verified: true,
    badge: 'GRADE A',
    image:
      'https://images.unsplash.com/photo-1594179047519-f347310d3322?w=900&q=80',
    fallback: '#D8D6C7',
    mills: [
      { name: 'Multan Mill A', avail: '140 bags avail.', price: 'PKR 8,500' },
      {
        name: 'Bahawalpur Mill C',
        avail: '85 bags avail.',
        price: 'PKR 8,380',
      },
    ],
  },
];

const DEMANDS = [
  {
    id: 'D001',
    commodity: 'Wheat',
    qty: '200 Tons',
    budget: '₨3,900/40kg',
    location: 'Lahore',
    date: '2 days ago',
    status: 'Active',
  },
  {
    id: 'D002',
    commodity: 'Rice',
    qty: '50 Tons',
    budget: '₨4,100/40kg',
    location: 'Karachi',
    date: '4 days ago',
    status: 'Pending',
  },
  {
    id: 'D003',
    commodity: 'Cotton',
    qty: '80 Tons',
    budget: '₨8,200/40kg',
    location: 'Faisalabad',
    date: '1 week ago',
    status: 'Active',
  },
];

const HeaderAction = ({
  icon,
  label,
}: {
  icon: 'filter' | 'sort';
  label: string;
}) => (
  <TouchableOpacity
    className="flex-row items-center rounded-[10px] px-3 py-2 border border-white/20 bg-white/15"
    style={{ gap: 5 }}
    activeOpacity={0.82}
  >
    <AppIcon name={icon} size={14} color="#FFFFFF" />
    <Text className="text-white text-[11px] font-semibold">{label}</Text>
  </TouchableOpacity>
);

const CategoryCard = ({
  item,
  active,
  onPress,
}: {
  item: (typeof CATEGORIES)[number];
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-white overflow-hidden mr-2.5"
    style={[
      styles.categoryCard,
      cardShadow.category,
      { borderColor: active ? '#217A3C' : 'transparent' },
    ]}
    activeOpacity={0.88}
  >
    <ImageBackground
      source={{ uri: item.image }}
      resizeMode="cover"
      imageStyle={styles.categoryImage}
      style={[styles.categoryImage, { backgroundColor: item.fallback }]}
    >
      <View style={styles.categoryOverlay} />
    </ImageBackground>
    <View className="py-1.5 px-1 items-center">
      <Text className="text-gray-900 text-[11px] font-bold">{item.name}</Text>
      <Text className="text-gray-400 text-[9px] mt-0.5">{item.count}</Text>
    </View>
  </TouchableOpacity>
);

const MillPriceRow = ({
  mill,
  featured,
}: {
  mill: (typeof COMMODITIES)[number]['mills'][number];
  featured: boolean;
}) => (
  <View
    className="flex-row items-center justify-between rounded-[9px] px-2.5 py-2 mb-1.5"
    style={[
      featured
        ? { backgroundColor: '#145228' }
        : {
            backgroundColor: '#F9FAFB',
            borderWidth: 1,
            borderColor: '#F3F4F6',
          },
    ]}
  >
    <View className="flex-row items-center flex-1" style={{ gap: 7 }}>
      <View
        className="w-[26px] h-[26px] rounded-lg items-center justify-center"
        style={{
          backgroundColor: featured ? 'rgba(255,255,255,0.14)' : '#E8F7EE',
        }}
      >
        <AppIcon
          name="listing"
          size={12}
          color={featured ? '#FFFFFF' : '#217A3C'}
        />
      </View>
      <View className="flex-1">
        <Text
          numberOfLines={1}
          className="text-[11px] font-bold"
          style={{ color: featured ? '#FFFFFF' : '#111827' }}
        >
          {mill.name}
        </Text>
        <Text
          className="text-[10px] mt-0.5"
          style={{ color: featured ? 'rgba(255,255,255,0.48)' : '#9CA3AF' }}
        >
          {mill.avail}
        </Text>
      </View>
    </View>
    <View className="items-end ml-2">
      <Text
        className="text-sm font-black"
        style={{ color: featured ? '#F7DB4A' : '#1A6B34' }}
      >
        {mill.price}
      </Text>
      <Text
        className="text-[9px]"
        style={{ color: featured ? 'rgba(255,255,255,0.42)' : '#9CA3AF' }}
      >
        /40kg
      </Text>
    </View>
  </View>
);

const CommodityCard = ({ item, onPress }: any) => {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white overflow-hidden mb-3.5"
      style={[styles.listingCard, cardShadow.card]}
      activeOpacity={0.9}
    >
      <ImageBackground
        source={{ uri: item.image }}
        resizeMode="cover"
        imageStyle={styles.listingImage}
        style={[styles.listingImage, { backgroundColor: item.fallback }]}
      >
        <View style={styles.listingOverlay} />
        <View className="absolute top-2.5 left-3 bg-yellow-400 rounded-md px-2.5 py-1">
          <Text className="text-green-950 text-[9px] font-black">
            {item.badge}
          </Text>
        </View>
        {item.verified ? (
          <View className="absolute top-2.5 right-3 flex-row items-center rounded-md px-2 py-1 bg-black/45">
            <AppIcon name="approved" size={10} color="#7FD4A0" />
            <Text className="text-[#7FD4A0] text-[9px] font-bold ml-1">
              VERIFIED
            </Text>
          </View>
        ) : null}
        <View className="absolute bottom-2.5 left-3 right-3">
          <Text className="text-white/60 text-[9px] font-mono mb-0.5">
            {item.displayId}
          </Text>
          <Text className="text-white text-base font-black">{item.name}</Text>
        </View>
      </ImageBackground>

      <View className="px-3.5 pt-3 pb-3.5">
        <View className="flex-row justify-between items-center mb-2.5">
          <View className="flex-row items-center flex-1" style={{ gap: 6 }}>
            <Text className="text-gray-500 text-[11px] font-semibold">
              {item.category}
            </Text>
            <Text className="text-gray-200 text-[10px]">·</Text>
            <Text
              numberOfLines={1}
              className="text-gray-700 text-[11px] font-bold flex-1"
            >
              {item.qty}
            </Text>
          </View>
          <View className="flex-row items-center" style={{ gap: 3 }}>
            <Text className="text-[10px]">★</Text>
            <Text className="text-gray-700 text-[11px] font-bold">
              {item.rating}
            </Text>
            <Text className="text-gray-400 text-[10px]">({item.reviews})</Text>
          </View>
        </View>

        <View className="flex-row items-center mb-3" style={{ gap: 5 }}>
          <AppIcon name="profileCity" size={11} color="#9CA3AF" />
          <Text className="text-gray-500 text-[11px]">
            {item.location} · {item.seller}
          </Text>
        </View>

        <View className="mb-3">
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-row items-center" style={{ gap: 5 }}>
              <View className="w-5 h-5 rounded-md bg-green-50 items-center justify-center">
                <AppIcon name="listing" size={11} color="#1A6B34" />
              </View>
              <Text className="text-green-900 text-[11px] font-bold">
                Mill Prices
              </Text>
            </View>
            {item.mills.length > 1 ? (
              <Text className="text-green-700 text-[10px] font-bold bg-green-50 rounded-full px-2 py-0.5">
                +{item.mills.length - 1} more mill
              </Text>
            ) : null}
          </View>
          {item.mills.slice(0, 3).map((mill: any, index: number) => (
            <MillPriceRow
              key={`${item.id}-${mill.name}`}
              mill={mill}
              featured={index === 0}
            />
          ))}
        </View>

        <View className="flex-row items-center" style={{ gap: 8 }}>
          <TouchableOpacity
            className="w-9 h-9 rounded-lg bg-white items-center justify-center"
            style={cardShadow.heart}
            activeOpacity={0.8}
          >
            <AppIcon name="heart" size={17} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 rounded-xl bg-yellow-400 py-3 flex-row items-center justify-center"
            style={styles.interestButton}
            activeOpacity={0.86}
          >
            <AppIcon name="currency" size={14} color="#0D3B1F" />
            <Text className="text-green-950 text-[13px] font-bold ml-1.5">
              {t('listing.sendInterest')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const DemandCard = ({ item }: any) => {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      className="bg-white rounded-[18px] p-3.5 mb-3"
      style={cardShadow.card}
      activeOpacity={0.88}
    >
      <View className="flex-row justify-between mb-2">
        <Text className="text-gray-400 text-xs font-mono">{item.id}</Text>
        <View
          className={`px-2 py-0.5 rounded-full ${
            item.status === 'Active' ? 'bg-green-50' : 'bg-amber-50'
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              item.status === 'Active' ? 'text-green-700' : 'text-amber-600'
            }`}
          >
            {item.status === 'Active'
              ? t('market.active')
              : t('market.pending')}
          </Text>
        </View>
      </View>
      <Text className="text-gray-900 text-base font-extrabold">
        {item.commodity}
      </Text>
      <View className="flex-row justify-between mt-1.5">
        <Text className="text-gray-600 text-xs">{item.qty}</Text>
        <Text className="text-green-700 text-sm font-extrabold">
          {item.budget}
        </Text>
      </View>
      <View className="flex-row justify-between mt-2">
        <Text className="text-gray-500 text-xs">📍 {item.location}</Text>
        <Text className="text-gray-400 text-xs">{item.date}</Text>
      </View>
      <TouchableOpacity
        className="mt-3 bg-yellow-400 rounded-xl py-2.5 items-center"
        activeOpacity={0.85}
      >
        <Text className="text-green-950 text-sm font-bold">
          {t('market.submitOffer')}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const MarketplaceScreen = ({ navigation }: any) => {
  const mode = useAppSelector(s => s.app.mode);
  const { t } = useTranslation();
  const isBuyer = mode === 'buyer';
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = COMMODITIES.filter(
    item =>
      (activeCategory === 'All' || item.category === activeCategory) &&
      (!search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase()) ||
        item.seller.toLowerCase().includes(search.toLowerCase())),
  );

  const listData = (isBuyer ? filtered : DEMANDS) as any[];

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-green-800 pt-10 pb-4 px-5 overflow-hidden">
        <View
          className="absolute rounded-full bg-green-600/25"
          style={{ width: 160, height: 160, top: -40, right: -40 }}
        />
        <View className="flex-row justify-between items-center mb-3">
          <View>
            <Text className="text-white text-xl font-extrabold">
              {isBuyer ? 'Supplies' : t('market.buyerDemands')}
            </Text>
            <Text className="text-white/55 text-xs mt-0.5">
              {isBuyer
                ? `${filtered.length} verified supplies`
                : t('market.activeRequests', { count: DEMANDS.length })}
            </Text>
          </View>
          <View className="flex-row" style={{ gap: 8 }}>
            <HeaderAction icon="filter" label={t('market.filter')} />
            <HeaderAction icon="sort" label="Sort" />
          </View>
        </View>

        <View className="bg-white rounded-xl flex-row items-center px-3">
          <AppIcon name="search" size={16} color="#9CA3AF" />
          <TextInput
            placeholder={
              isBuyer
                ? 'Search commodity, location...'
                : t('market.searchRequests')
            }
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            className="flex-1 text-gray-900 text-[13px] py-3 ml-2"
          />
        </View>
      </View>

      <FlatList
        data={listData}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          isBuyer ? (
            <>
              <View className="mb-[18px]">
                <Text className="text-gray-900 text-[15px] font-bold mb-3">
                  Browse by Category
                </Text>
                <FlatList
                  horizontal
                  data={CATEGORIES}
                  keyExtractor={item => item.name}
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <CategoryCard
                      item={item}
                      active={activeCategory === item.name}
                      onPress={() =>
                        setActiveCategory(current =>
                          current === item.name ? 'All' : item.name,
                        )
                      }
                    />
                  )}
                />
              </View>

              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-gray-900 text-[15px] font-bold">
                  {filtered.length} Listings Found
                </Text>
                {activeCategory !== 'All' ? (
                  <TouchableOpacity onPress={() => setActiveCategory('All')}>
                    <Text className="text-green-700 text-xs font-semibold">
                      Show All
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </>
          ) : null
        }
        renderItem={({ item }) =>
          isBuyer ? (
            <CommodityCard
              item={item}
              onPress={() =>
                navigation.navigate('ListingDetail', { listingId: item.id })
              }
            />
          ) : (
            <DemandCard item={item} />
          )
        }
        ListEmptyComponent={
          <View className="items-center pt-16">
            <AppIcon name="search" size={40} color="#9CA3AF" />
            <Text className="text-gray-800 text-base font-bold mt-2">
              {t('market.noResults')}
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              {t('market.adjustSearch')}
            </Text>
          </View>
        }
      />

      {!isBuyer && (
        <TouchableOpacity
          className="absolute bg-yellow-400 items-center justify-center"
          style={styles.fab}
          onPress={() => navigation.navigate('Post')}
          activeOpacity={0.88}
        >
          <Text className="text-green-950 text-2xl font-bold">+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const cardShadow = StyleSheet.create({
  category: {
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  heart: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});

const styles = StyleSheet.create({
  categoryCard: {
    width: 90,
    borderRadius: 14,
    borderWidth: 2,
  },
  categoryImage: {
    width: '100%',
    height: 62,
    overflow: 'hidden',
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  listingCard: {
    borderRadius: 18,
  },
  listingImage: {
    width: '100%',
    height: 140,
    overflow: 'hidden',
  },
  listingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.46)',
  },
  interestButton: {
    shadowColor: '#F3CD03',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  fab: {
    bottom: 90,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    shadowColor: '#1A6B34',
    shadowOpacity: 0.32,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
});

export default MarketplaceScreen;
