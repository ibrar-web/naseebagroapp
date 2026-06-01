import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '../../../store';
import { switchMode } from '../../../store/slices/appSlice';
import { useTranslation } from '../../../localization';
import type { TranslationKey } from '../../../localization';
import iconRegistry from '../../../assets/icons/iconRegistry';
import { AppIcon } from '../../../assets/icons';

const { width: W } = Dimensions.get('window');

const MARKET_DATA = [
  {
    name: 'Basmati Rice',
    mill: 'Gujranwala Mill A',
    price: 'PKR 4,200',
    unit: '/40kg',
    change: '+2.1%',
    up: true,
    image:
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80',
    fallback: '#8A9A5B',
  },
  {
    name: 'Punjab Wheat',
    mill: 'Faisalabad Mill B',
    price: 'PKR 2,800',
    unit: '/40kg',
    change: '-0.8%',
    up: false,
    image:
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80',
    fallback: '#C29A4A',
  },
  {
    name: 'Desi Cotton',
    mill: 'Multan Mill A',
    price: 'PKR 8,500',
    unit: '/40kg',
    change: '+1.4%',
    up: true,
    image:
      'https://images.unsplash.com/photo-1594179047519-f347310d3322?w=600&q=80',
    fallback: '#D8D6C7',
  },
  {
    name: 'Yellow Maize',
    mill: 'Okara Mill A',
    price: 'PKR 1,900',
    unit: '/40kg',
    change: '-1.2%',
    up: false,
    image:
      'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&q=80',
    fallback: '#DCA640',
  },
  {
    name: 'Mustard Seed',
    mill: 'Sahiwal Mill A',
    price: 'PKR 6,200',
    unit: '/40kg',
    change: '+0.5%',
    up: true,
    image:
      'https://images.unsplash.com/photo-1535567465397-7523840f2ae9?w=600&q=80',
    fallback: '#D9A825',
  },
];

const FEATURED_SUPPLIES = [
  {
    id: 'L001',
    displayId: 'LST-2024-001',
    name: 'Basmati Rice',
    category: 'Grains',
    qty: '8,000 kg total',
    location: 'Gujranwala',
    rating: '4.9',
    reviews: '31',
    price: 'PKR 4,200',
    unit: '/40kg',
    badge: 'FRESH',
    image:
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&q=80',
    fallback: '#8A9A5B',
  },
  {
    id: 'L002',
    displayId: 'LST-2024-002',
    name: 'Punjab Wheat',
    category: 'Grains',
    qty: '12,000 kg total',
    location: 'Faisalabad',
    rating: '4.7',
    reviews: '18',
    price: 'PKR 2,800',
    unit: '/40kg',
    badge: 'VERIFIED',
    image:
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=900&q=80',
    fallback: '#C29A4A',
  },
];

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
];

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

const SectionHeader = ({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) => (
  <View className="flex-row justify-between items-center mb-3">
    <Text className="text-gray-900 text-[15px] font-bold">{title}</Text>
    {action ? (
      <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center"
        style={{ gap: 3 }}
        activeOpacity={0.75}
      >
        <Text className="text-green-700 text-xs font-semibold">{action}</Text>
        <AppIcon name="chevronRight" size={12} color="#217A3C" />
      </TouchableOpacity>
    ) : null}
  </View>
);

const MarketRateCard = ({ item }: { item: (typeof MARKET_DATA)[number] }) => (
  <TouchableOpacity
    className="bg-white overflow-hidden"
    style={[styles.rateCard, cardShadow.medium]}
    activeOpacity={0.88}
  >
    <ImageBackground
      source={{ uri: item.image }}
      resizeMode="cover"
      imageStyle={styles.rateImage}
      style={[styles.rateImage, { backgroundColor: item.fallback }]}
    >
      <View style={styles.imageOverlay} />
      <View
        style={[
          styles.changeBadge,
          {
            backgroundColor: item.up
              ? 'rgba(22,163,74,0.9)'
              : 'rgba(220,38,38,0.9)',
          },
        ]}
      >
        <Text className="text-white text-[8px]">{item.up ? '▲' : '▼'}</Text>
        <Text className="text-white text-[10px] font-extrabold">
          {item.change}
        </Text>
      </View>
      <Text className="absolute bottom-2 left-2 right-2 text-white text-xs font-black">
        {item.name}
      </Text>
    </ImageBackground>
    <View className="px-2.5 pt-2 pb-2.5">
      <View className="flex-row items-center mb-1" style={{ gap: 4 }}>
        <AppIcon name="listing" size={10} color="#9CA3AF" />
        <Text className="text-gray-500 text-[10px] font-semibold">
          {item.mill}
        </Text>
      </View>
      <View className="flex-row items-baseline" style={{ gap: 2 }}>
        <Text className="text-green-800 text-[17px] font-black">
          {item.price}
        </Text>
        <Text className="text-gray-400 text-[9px] font-medium">
          {item.unit}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

const FeaturedSupplyCard = ({
  item,
  onPress,
}: {
  item: (typeof FEATURED_SUPPLIES)[number];
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-white overflow-hidden mb-3"
    style={[styles.supplyCard, cardShadow.large]}
    activeOpacity={0.9}
  >
    <ImageBackground
      source={{ uri: item.image }}
      resizeMode="cover"
      imageStyle={styles.supplyImage}
      style={[styles.supplyImage, { backgroundColor: item.fallback }]}
    >
      <View style={styles.strongOverlay} />
      <View className="absolute top-2.5 left-3 bg-yellow-400 rounded-md px-2.5 py-1">
        <Text className="text-green-950 text-[9px] font-black">
          {item.badge}
        </Text>
      </View>
      <View className="absolute top-2.5 right-3 flex-row items-center rounded-md px-2 py-1 bg-black/45">
        <AppIcon name="approved" size={10} color="#7FD4A0" />
        <Text className="text-[#7FD4A0] text-[9px] font-bold ml-1">
          VERIFIED
        </Text>
      </View>
      <View className="absolute bottom-3 left-3 right-3">
        <Text className="text-white/60 text-[9px] font-mono mb-0.5">
          {item.displayId}
        </Text>
        <Text className="text-white text-base font-black">{item.name}</Text>
      </View>
    </ImageBackground>
    <View className="px-3.5 pt-3 pb-3.5">
      <View className="flex-row justify-between items-center mb-2.5">
        <View className="flex-row items-center" style={{ gap: 6 }}>
          <Text className="text-gray-500 text-[11px] font-semibold">
            {item.category}
          </Text>
          <Text className="text-gray-200 text-[10px]">·</Text>
          <Text className="text-gray-700 text-[11px] font-bold">
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

      <View className="rounded-xl bg-green-900 px-3 py-2.5 mb-2.5 flex-row justify-between items-center">
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <View className="w-7 h-7 rounded-lg bg-white/15 items-center justify-center">
            <AppIcon name="listing" size={13} color="#FFFFFF" />
          </View>
          <View>
            <Text className="text-white text-[11px] font-bold">
              {item.location} Mill A
            </Text>
            <Text className="text-white/50 text-[10px] mt-0.5">
              Best available price
            </Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-yellow-300 text-sm font-black">
            {item.price}
          </Text>
          <Text className="text-white/40 text-[9px]">{item.unit}</Text>
        </View>
      </View>

      <View className="flex-row items-center" style={{ gap: 8 }}>
        <TouchableOpacity
          className="w-9 h-9 rounded-lg bg-white items-center justify-center"
          style={cardShadow.small}
          activeOpacity={0.8}
        >
          <AppIcon name="heart" size={17} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 rounded-xl bg-yellow-400 py-3 items-center"
          style={styles.interestButton}
          activeOpacity={0.86}
        >
          <Text className="text-green-950 text-[13px] font-bold">
            Send Interest →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

const CategoryCard = ({ item }: { item: (typeof CATEGORIES)[number] }) => (
  <TouchableOpacity
    className="bg-white overflow-hidden mr-2.5"
    style={[styles.categoryCard, cardShadow.medium]}
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
  const activeMode =
    modeOptions.find(option => option.value === mode) ?? modeOptions[0];

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
    <View className="flex-1 bg-gray-50">
      <View className="bg-green-950 px-[18px] pt-10 pb-5 overflow-visible">
        <View
          className="absolute rounded-full bg-green-600/20"
          style={{ width: 180, height: 180, top: -40, right: -40 }}
        />
        <View
          className="absolute rounded-full bg-yellow-400/10"
          style={{ width: 100, height: 100, bottom: -20, left: -20 }}
        />

        <View className="flex-row justify-between items-center mb-3.5">
          <Image
            source={iconRegistry.naseeb}
            style={{ height: 34, width: 34 }}
            resizeMode="contain"
          />

          <View style={{ position: 'relative', zIndex: 20 }}>
            <TouchableOpacity
              onPress={() => setShowModeMenu(current => !current)}
              className="flex-row items-center rounded-xl"
              style={styles.modeButton}
              activeOpacity={0.8}
            >
              <Text className="text-xs font-bold text-white">
                {activeMode.icon} {activeMode.label}
              </Text>
              <AppIcon
                name="chevronDown"
                size={13}
                color="rgba(255,255,255,0.8)"
              />
            </TouchableOpacity>

            {showModeMenu ? (
              <View
                className="absolute right-0 top-10 rounded-xl overflow-hidden"
                style={styles.modeMenu}
              >
                {modeOptions.map((option, index) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => {
                      dispatch(switchMode(option.value));
                      setShowModeMenu(false);
                    }}
                    className="px-3 py-2.5"
                    style={{
                      backgroundColor:
                        mode === option.value
                          ? 'rgba(255,255,255,0.12)'
                          : 'transparent',
                      borderBottomWidth: index < modeOptions.length - 1 ? 1 : 0,
                      borderBottomColor: 'rgba(255,255,255,0.12)',
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      className="text-xs font-bold"
                      style={{
                        color: mode === option.value ? '#F3CD03' : '#FFFFFF',
                      }}
                    >
                      {option.icon} {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>
        </View>

        <View className="h-px bg-white/10 mb-3.5" />

        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center" style={{ gap: 11 }}>
            <View className="w-11 h-11 rounded-[14px] bg-yellow-400 items-center justify-center border-2 border-white/20">
              <AppIcon name="profileAvatar" size={20} color="#0D3B1F" />
            </View>
            <View>
              <Text className="text-white text-base font-extrabold">
                {displayName}
              </Text>
              <View className="flex-row items-center mt-0.5" style={{ gap: 4 }}>
                <AppIcon
                  name="profileCity"
                  size={11}
                  color="rgba(255,255,255,0.55)"
                />
                <Text className="text-white/55 text-[11px]">{displayCity}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            className="w-[44px] h-[44px] rounded-[14px] bg-white/10 border border-white/15 items-center justify-center"
            activeOpacity={0.8}
          >
            <AppIcon name="menuNotifications" size={20} color="#FFFFFF" />
            <View className="absolute top-1.5 right-1.5 w-[9px] h-[9px] rounded-full bg-yellow-400 border-2 border-green-950" />
          </TouchableOpacity>
        </View>
      </View>

      <View
        className="bg-white px-4 py-3 border-b border-gray-100"
        style={cardShadow.strip}
      >
        <View className="flex-row" style={{ gap: 8 }}>
          {stats.map(s => (
            <View
              key={s.label}
              className="flex-1 rounded-xl px-2 py-2.5 items-center"
              style={{ backgroundColor: s.bg }}
            >
              <Text
                className="text-base font-extrabold"
                style={{ color: s.color }}
              >
                {s.val}
              </Text>
              <Text className="text-[10px] text-gray-500 mt-0.5 font-medium">
                {s.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        <View className="mb-5">
          <SectionHeader
            title={t('home.marketRates')}
            action={t('home.seeAll')}
            onPress={() => navigation.navigate('MarketRates')}
          />
          <FlatList
            horizontal
            data={MARKET_DATA}
            keyExtractor={item => item.name}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingBottom: 6 }}
            renderItem={({ item }) => <MarketRateCard item={item} />}
          />
        </View>

        {isBuyer ? (
          <>
            <View className="mb-5">
              <SectionHeader
                title={t('home.featuredSupplies')}
                action={t('home.viewAll')}
                onPress={() => navigation.navigate('Market')}
              />
              {FEATURED_SUPPLIES.map(item => (
                <FeaturedSupplyCard
                  key={item.id}
                  item={item}
                  onPress={() =>
                    navigation.navigate('CommodityDetail', {
                      listingId: item.id,
                    })
                  }
                />
              ))}
            </View>

            <View className="mb-2">
              <SectionHeader
                title={t('home.browseCategories')}
                action={t('home.all')}
              />
              <FlatList
                horizontal
                data={CATEGORIES}
                keyExtractor={item => item.name}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => <CategoryCard item={item} />}
              />
            </View>
          </>
        ) : (
          <>
            <View
              className="bg-green-900 rounded-2xl p-4 mb-5"
              style={cardShadow.large}
            >
              <Text className="text-green-200 text-xs">
                {t('home.totalEarningsMonth')}
              </Text>
              <Text className="text-white text-3xl font-extrabold mt-1">
                PKR 890,000
              </Text>
              <View className="flex-row mt-3" style={{ gap: 18 }}>
                {[
                  { l: t('home.released'), v: '₨640K', c: '#FFFFFF' },
                  { l: t('home.pending'), v: '₨250K', c: '#F3CD03' },
                  { l: t('home.thisWeek'), v: '₨120K', c: '#FFFFFF' },
                ].map(s => (
                  <View key={s.l}>
                    <Text className="text-green-200 text-xs">{s.l}</Text>
                    <Text className="text-sm font-bold" style={{ color: s.c }}>
                      {s.v}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <SectionHeader title={t('home.quickActions')} />
            <View className="flex-row flex-wrap" style={{ gap: 10 }}>
              {QUICK_ACTIONS.map(a => (
                <TouchableOpacity
                  key={a.labelKey}
                  className="bg-white rounded-2xl p-3.5"
                  style={[{ width: (W - 42) / 2 }, cardShadow.medium]}
                  activeOpacity={0.85}
                >
                  <View
                    className="w-11 h-11 rounded-xl items-center justify-center mb-2"
                    style={{ backgroundColor: a.bg }}
                  >
                    <Text style={{ fontSize: 22, color: a.color }}>
                      {a.emoji}
                    </Text>
                  </View>
                  <Text className="text-gray-900 text-sm font-bold">
                    {t(a.labelKey)}
                  </Text>
                  <Text className="text-gray-400 text-xs mt-1">
                    {t(a.subKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const cardShadow = StyleSheet.create({
  small: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  strip: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});

const styles = StyleSheet.create({
  modeButton: {
    backgroundColor: 'rgba(255,255,255,0.094)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingLeft: 12,
    paddingRight: 10,
    gap: 8,
  },
  modeMenu: {
    width: 150,
    backgroundColor: '#0D3B1F',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    zIndex: 30,
    elevation: 12,
  },
  rateCard: {
    width: 162,
    borderRadius: 14,
  },
  rateImage: {
    height: 80,
    overflow: 'hidden',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  strongOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.42)',
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
  supplyCard: {
    borderRadius: 18,
  },
  supplyImage: {
    height: 140,
    overflow: 'hidden',
  },
  interestButton: {
    shadowColor: '#F3CD03',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  categoryCard: {
    width: 90,
    borderRadius: 14,
  },
  categoryImage: {
    width: '100%',
    height: 62,
    overflow: 'hidden',
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
});

export default HomeScreen;
