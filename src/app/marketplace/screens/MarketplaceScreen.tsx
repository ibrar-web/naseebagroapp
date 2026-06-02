import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Image,
} from 'react-native';
import { useAppSelector } from '../../../store';
import { useTranslation } from '../../../localization';
import { AppIcon } from '../../../assets/icons';
import MockStatusBar from '../../components/MockStatusBar';
import iconRegistry from '../../../assets/icons/iconRegistry';

type SheetType = 'filter' | 'sort' | 'signup' | null;

const COMMODITY_FILTERS = [
  'All',
  'Basmati Rice',
  'Punjab Wheat',
  'Yellow Maize',
  'Corn',
  'Barley',
  'Desi Cotton',
  'BT Cotton',
  'Tomato',
  'Onion',
  'Potato',
  'Garlic',
  'Mustard Seed',
  'Sunflower',
  'Canola',
  'Mango',
  'Kinnow',
  'Cumin',
  'Coriander',
  'Turmeric',
  'Red Chilli',
  'Sugarcane',
  'Chickpea',
  'Lentil',
  'Mung Bean',
];

const LOCATION_FILTERS = [
  'All',
  'Lahore',
  'Faisalabad',
  'Multan',
  'Gujranwala',
  'Rawalpindi',
  'Karachi',
  'Okara',
  'Sahiwal',
  'Rahim Yar Khan',
];

const SORT_OPTIONS = [
  { label: 'Newest First', icon: 'profileDateOfBirth' },
  { label: 'Budget: Low to High', icon: 'currency' },
  { label: 'Budget: High to Low', icon: 'currency' },
  { label: 'Distance: Nearest', icon: 'profileCity' },
  { label: 'Most Quantity Needed', icon: 'listing' },
] as const;

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
    displayId: 'REQ-2024-041',
    name: 'Basmati Rice',
    commodity: 'Basmati Rice',
    qty: '150 bags',
    qtyLabel: 'Quantity required',
    budget: 'PKR 4,000/40kg',
    location: 'Lahore',
    posted: 'Posted Mar 28',
    status: 'OPEN DEMAND',
    mills: '2 mills specified',
    payment: '30 days payment',
    notes: 'Grade A preferred, dry packaging',
    image:
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&q=80',
    fallback: '#8A9A5B',
  },
  {
    id: 'D002',
    displayId: 'REQ-2024-039',
    name: 'Punjab Wheat',
    commodity: 'Punjab Wheat',
    qty: '220 bags',
    qtyLabel: 'Quantity required',
    budget: 'PKR 2,850/40kg',
    location: 'Faisalabad',
    posted: 'Posted Mar 26',
    status: 'OPEN DEMAND',
    mills: '3 mills specified',
    payment: '15 days payment',
    notes: 'Clean grain, moisture below 12%',
    image:
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=900&q=80',
    fallback: '#C29A4A',
  },
  {
    id: 'D003',
    displayId: 'REQ-2024-036',
    name: 'Yellow Maize',
    commodity: 'Yellow Maize',
    qty: '180 bags',
    qtyLabel: 'Quantity required',
    budget: 'PKR 1,920/40kg',
    location: 'Okara',
    posted: 'Posted Mar 24',
    status: 'OPEN DEMAND',
    mills: '2 mills specified',
    payment: 'Advance payment',
    notes: 'Machine cleaned, delivery this week',
    image:
      'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=900&q=80',
    fallback: '#DCA640',
  },
];

const parseAmount = (value?: string) =>
  Number(value?.replace(/[^\d]/g, '') || 0);

const parseQuantity = (value?: string) =>
  Number(value?.replace(/[^\d]/g, '') || 0);

const getListingBudget = (item: (typeof COMMODITIES)[number]) =>
  Math.min(...item.mills.map(mill => parseAmount(mill.price)));

const getItemBudget = (item: any) =>
  'mills' in item && Array.isArray(item.mills)
    ? getListingBudget(item)
    : parseAmount(item.budget);

const HeaderAction = ({
  icon,
  label,
  onPress,
}: {
  icon: 'filter' | 'sort';
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center rounded-[10px] px-3 py-2 border border-white/20 bg-white/15"
    style={{ gap: 5 }}
    activeOpacity={0.82}
  >
    <AppIcon name={icon} size={14} color="#FFFFFF" />
    <Text className="text-white text-[11px] font-semibold">{label}</Text>
  </TouchableOpacity>
);

const BottomSheet = ({
  visible,
  onClose,
  children,
  maxHeight,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeight?: number | `${number}%`;
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <View style={styles.modalRoot}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={[styles.sheetPanel, maxHeight ? { maxHeight } : null]}>
        {children}
      </View>
    </View>
  </Modal>
);

const SheetHandle = () => <View style={styles.sheetHandle} />;

const SheetSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.sheetSection}>
    <Text className="text-gray-500 text-xs font-bold mb-2.5">{title}</Text>
    {children}
  </View>
);

const ChoiceChip = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="rounded-full px-3.5 py-2 mr-2 mb-2"
    style={[
      styles.choiceChip,
      active ? styles.choiceChipActive : styles.choiceChipInactive,
    ]}
    activeOpacity={0.84}
  >
    <Text
      className="text-xs font-semibold"
      style={active ? styles.choiceChipTextActive : styles.choiceChipText}
    >
      {label === 'All' ? 'All' : label}
    </Text>
  </TouchableOpacity>
);

const NumberInput = ({
  value,
  onChangeText,
  placeholder,
  prefix,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  prefix?: string;
}) => (
  <View
    className="rounded-[10px] flex-row items-center"
    style={styles.sheetInput}
  >
    {prefix ? (
      <Text className="text-gray-400 text-[13px] font-bold mr-1.5">
        {prefix}
      </Text>
    ) : null}
    <TextInput
      value={value}
      onChangeText={onChangeText}
      keyboardType="number-pad"
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      className="flex-1 text-gray-900 text-[13px] py-2.5"
    />
  </View>
);

const FilterSheet = ({
  selectedCommodity,
  setSelectedCommodity,
  selectedLocation,
  setSelectedLocation,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  minQuantity,
  setMinQuantity,
  onDone,
}: {
  selectedCommodity: string;
  setSelectedCommodity: (value: string) => void;
  selectedLocation: string;
  setSelectedLocation: (value: string) => void;
  minPrice: string;
  setMinPrice: (value: string) => void;
  maxPrice: string;
  setMaxPrice: (value: string) => void;
  minQuantity: string;
  setMinQuantity: (value: string) => void;
  onDone: () => void;
}) => {
  const [commodityOpen, setCommodityOpen] = useState(false);
  const selectedCommodityLabel =
    selectedCommodity === 'All' ? 'All Commodities' : selectedCommodity;

  return (
    <>
      <View style={styles.sheetFixedHeader}>
        <SheetHandle />
        <View className="flex-row justify-between items-center mb-5">
          <Text className="text-gray-900 text-[17px] font-extrabold">
            Filters
          </Text>
          <TouchableOpacity
            className="bg-green-800 rounded-lg px-3.5 py-1.5"
            onPress={onDone}
            activeOpacity={0.84}
          >
            <Text className="text-white text-xs font-bold">Done</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        style={styles.sheetScroll}
        contentContainerStyle={styles.filterSheetContent}
        showsVerticalScrollIndicator={false}
      >
        <SheetSection title="COMMODITY">
          <TouchableOpacity
            onPress={() => setCommodityOpen(current => !current)}
            className="rounded-[10px] flex-row items-center justify-between px-3 py-3"
            style={styles.sheetInput}
            activeOpacity={0.84}
          >
            <Text
              className="text-[13px] font-semibold"
              style={
                selectedCommodity === 'All'
                  ? styles.selectText
                  : styles.selectTextActive
              }
            >
              {selectedCommodityLabel}
            </Text>
            <AppIcon name="chevronDown" size={15} color="#9CA3AF" />
          </TouchableOpacity>
          {commodityOpen ? (
            <View style={styles.commodityDropdown}>
              <ScrollView nestedScrollEnabled showsVerticalScrollIndicator>
                {COMMODITY_FILTERS.map(commodity => {
                  const active = selectedCommodity === commodity;
                  return (
                    <TouchableOpacity
                      key={commodity}
                      className="flex-row items-center justify-between px-3 py-2.5"
                      onPress={() => {
                        setSelectedCommodity(commodity);
                        setCommodityOpen(false);
                      }}
                      activeOpacity={0.82}
                    >
                      <Text
                        className="text-[13px] font-semibold"
                        style={
                          active
                            ? styles.dropdownOptionTextActive
                            : styles.dropdownOptionText
                        }
                      >
                        {commodity === 'All' ? 'All Commodities' : commodity}
                      </Text>
                      {active ? (
                        <AppIcon name="approved" size={15} color="#217A3C" />
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}
        </SheetSection>

        <SheetSection title="LOCATION">
          <View className="flex-row flex-wrap">
            {LOCATION_FILTERS.map(location => (
              <ChoiceChip
                key={location}
                label={location}
                active={selectedLocation === location}
                onPress={() => setSelectedLocation(location)}
              />
            ))}
          </View>
        </SheetSection>

        <SheetSection title="PRICE RANGE (per 40kg)">
          <View className="flex-row" style={styles.priceRangeRow}>
            <View className="flex-1">
              <NumberInput
                value={minPrice}
                onChangeText={setMinPrice}
                placeholder="Min"
                prefix="PKR"
              />
            </View>
            <View className="flex-1">
              <NumberInput
                value={maxPrice}
                onChangeText={setMaxPrice}
                placeholder="Max"
                prefix="PKR"
              />
            </View>
          </View>
        </SheetSection>

        <SheetSection title="MINIMUM QUANTITY (bags)">
          <NumberInput
            value={minQuantity}
            onChangeText={setMinQuantity}
            placeholder="e.g. 50"
          />
        </SheetSection>
      </ScrollView>
    </>
  );
};

const SortOption = ({
  option,
  active,
  onPress,
}: {
  option: (typeof SORT_OPTIONS)[number];
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="w-full flex-row items-center rounded-xl px-3.5 py-3.5 mb-2"
    style={[
      styles.sortOption,
      active ? styles.sortOptionActive : styles.sortOptionInactive,
    ]}
    activeOpacity={0.84}
  >
    <View
      className="w-[38px] h-[38px] rounded-[10px] items-center justify-center"
      style={active ? styles.sortIconActive : styles.sortIcon}
    >
      <AppIcon
        name={option.icon}
        size={17}
        color={active ? '#217A3C' : '#6B7280'}
      />
    </View>
    <Text
      className="flex-1 text-sm"
      style={active ? styles.sortLabelActive : styles.sortLabel}
    >
      {option.label}
    </Text>
    {active ? <AppIcon name="approved" size={18} color="#217A3C" /> : null}
  </TouchableOpacity>
);

const SortSheet = ({
  sortBy,
  onSelect,
}: {
  sortBy: string;
  onSelect: (value: string) => void;
}) => (
  <View style={styles.sortSheetContent}>
    <SheetHandle />
    <Text className="text-gray-900 text-[17px] font-extrabold mb-4">
      Sort By
    </Text>
    {SORT_OPTIONS.map(option => (
      <SortOption
        key={option.label}
        option={option}
        active={sortBy === option.label}
        onPress={() => onSelect(option.label)}
      />
    ))}
  </View>
);

const SignupSheet = ({
  onCreateAccount,
  onContinue,
}: {
  onCreateAccount: () => void;
  onContinue: () => void;
}) => (
  <View style={styles.signupSheetContent}>
    <SheetHandle />
    <Image source={iconRegistry.naseeb} style={styles.signupLogo} />
    <Text className="text-gray-900 text-lg font-extrabold text-center mb-2">
      Sign Up to Continue
    </Text>
    <Text className="text-gray-500 text-[13px] leading-5 text-center mb-[22px]">
      Create a free account to post demands, create listings, send offers and
      track deals.
    </Text>
    <TouchableOpacity
      className="bg-yellow-400 rounded-xl py-4 flex-row items-center justify-center mb-2.5"
      style={styles.signupPrimaryButton}
      onPress={onCreateAccount}
      activeOpacity={0.86}
    >
      <AppIcon
        name="back"
        size={17}
        color="#0D3B1F"
        style={styles.forwardIcon}
      />
      <Text className="text-green-950 text-[15px] font-semibold ml-2">
        Create Account
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      className="rounded-xl py-3 items-center"
      style={styles.signupSecondaryButton}
      onPress={onContinue}
      activeOpacity={0.84}
    >
      <Text className="text-gray-600 text-[13px] font-semibold">
        Continue Browsing
      </Text>
    </TouchableOpacity>
  </View>
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

const DemandCard = ({ item }: any) => (
  <TouchableOpacity
    className="bg-white overflow-hidden mb-3.5"
    style={[styles.listingCard, cardShadow.card]}
    activeOpacity={0.88}
  >
    <ImageBackground
      source={{ uri: item.image }}
      resizeMode="cover"
      imageStyle={styles.listingImage}
      style={[styles.listingImage, { backgroundColor: item.fallback }]}
    >
      <View style={styles.demandOverlay} />
      <View className="absolute top-2.5 left-3 bg-yellow-400 rounded-md px-2.5 py-1 flex-row items-center">
        <View className="w-[5px] h-[5px] rounded-full bg-green-950 mr-1" />
        <Text className="text-green-950 text-[9px] font-black">
          {item.status}
        </Text>
      </View>
      <View className="absolute top-2.5 right-3 rounded-md px-2 py-1 bg-black/45">
        <Text className="text-white/85 text-[9px] font-semibold">
          {item.posted}
        </Text>
      </View>
      <View className="absolute bottom-2.5 left-3">
        <Text className="text-white/55 text-[9px] font-mono mb-0.5">
          {item.displayId}
        </Text>
        <Text className="text-white text-[17px] font-black">{item.name}</Text>
      </View>
      <View
        className="absolute bottom-2.5 right-3 flex-row items-center"
        style={styles.locationOverlayRow}
      >
        <AppIcon name="profileCity" size={10} color="rgba(255,255,255,0.85)" />
        <Text className="text-white/85 text-[10px] font-medium">
          {item.location}
        </Text>
      </View>
    </ImageBackground>

    <View className="px-3.5 pt-3 pb-3.5">
      <View className="flex-row justify-between items-start mb-2">
        <View>
          <Text className="text-gray-900 text-[13px] font-extrabold">
            {item.qty}
          </Text>
          <Text className="text-gray-500 text-[11px] mt-0.5">
            {item.qtyLabel}
          </Text>
        </View>
        <View className="items-end flex-1 ml-3">
          <Text className="text-green-800 text-base font-black">
            {item.budget}
          </Text>
          <Text className="text-gray-400 text-[10px]">Buyer's budget</Text>
        </View>
      </View>

      <View style={styles.demandMetaBox}>
        <View className="flex-row flex-wrap" style={styles.demandMetaRow}>
          <View className="flex-row items-center" style={styles.demandMetaItem}>
            <AppIcon name="business" size={11} color="#9CA3AF" />
            <Text className="text-gray-600 text-[11px] font-semibold">
              {item.mills}
            </Text>
          </View>
          <View className="flex-row items-center" style={styles.demandMetaItem}>
            <AppIcon name="bank" size={11} color="#9CA3AF" />
            <Text className="text-gray-600 text-[11px] font-semibold">
              {item.payment}
            </Text>
          </View>
        </View>
      </View>

      <Text className="text-gray-500 text-[11px] italic leading-4 mb-2.5">
        "{item.notes}"
      </Text>

      <TouchableOpacity
        className="bg-yellow-400 rounded-[11px] py-3 items-center"
        style={styles.offerButton}
        activeOpacity={0.85}
      >
        <Text className="text-green-950 text-[13px] font-bold">
          Send Offer →
        </Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const MarketplaceScreen = ({ navigation }: any) => {
  const mode = useAppSelector(s => s.app.mode);
  const { t } = useTranslation();
  const isBuyer = mode === 'buyer';
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);
  const [selectedCommodity, setSelectedCommodity] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minQuantity, setMinQuantity] = useState('');
  const [sortBy, setSortBy] = useState('Newest First');

  const priceFloor = parseAmount(minPrice);
  const priceCeiling = parseAmount(maxPrice);
  const quantityFloor = parseQuantity(minQuantity);

  const filteredSupplies = COMMODITIES.filter(item => {
    const budget = getListingBudget(item);
    const quantity = parseQuantity(item.qty);

    return (
      (activeCategory === 'All' || item.category === activeCategory) &&
      (selectedCommodity === 'All' || item.name === selectedCommodity) &&
      (selectedLocation === 'All' || item.location === selectedLocation) &&
      (!priceFloor || budget >= priceFloor) &&
      (!priceCeiling || budget <= priceCeiling) &&
      (!quantityFloor || quantity >= quantityFloor) &&
      (!search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase()) ||
        item.seller.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const filteredDemands = DEMANDS.filter(item => {
    const budget = parseAmount(item.budget);
    const quantity = parseQuantity(item.qty);

    return (
      (selectedCommodity === 'All' || item.name === selectedCommodity) &&
      (selectedLocation === 'All' || item.location === selectedLocation) &&
      (!priceFloor || budget >= priceFloor) &&
      (!priceCeiling || budget <= priceCeiling) &&
      (!quantityFloor || quantity >= quantityFloor) &&
      (!search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase()) ||
        item.displayId.toLowerCase().includes(search.toLowerCase()) ||
        item.notes.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const sortItems = (items: any[]) => {
    const sorted = [...items];

    if (sortBy === 'Budget: Low to High') {
      sorted.sort((a, b) => getItemBudget(a) - getItemBudget(b));
    } else if (sortBy === 'Budget: High to Low') {
      sorted.sort((a, b) => getItemBudget(b) - getItemBudget(a));
    } else if (sortBy === 'Most Quantity Needed') {
      sorted.sort((a, b) => parseQuantity(b.qty) - parseQuantity(a.qty));
    }

    return sorted;
  };

  const listData = sortItems(
    isBuyer ? filteredSupplies : filteredDemands,
  ) as any[];
  const closeSheet = () => setActiveSheet(null);

  return (
    <View className="flex-1 bg-gray-50">
      <MockStatusBar backgroundColor="#145228" textColor="#FFFFFF" />
      <View
        style={{
          backgroundColor: '#145228',
          paddingTop: 6,
          paddingBottom: 14,
          paddingHorizontal: 20,
        }}
      >
        <View className="flex-row justify-between items-center mb-3">
          <View>
            <Text className="text-white text-xl font-extrabold">
              {isBuyer ? 'Supplies' : t('market.buyerDemands')}
            </Text>
            <Text className="text-white/55 text-xs mt-0.5">
              {isBuyer
                ? `${filteredSupplies.length} verified supplies`
                : t('market.activeRequests', { count: filteredDemands.length })}
            </Text>
          </View>
          <View className="flex-row" style={{ gap: 8 }}>
            <HeaderAction
              icon="filter"
              label={t('market.filter')}
              onPress={() => setActiveSheet('filter')}
            />
            <HeaderAction
              icon="sort"
              label="Sort"
              onPress={() => setActiveSheet('sort')}
            />
          </View>
        </View>

        <View
          className="bg-white rounded-xl flex-row items-center px-3"
          style={{ marginTop: 0 }}
        >
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
                  {filteredSupplies.length} Listings Found
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

      <TouchableOpacity
        className="absolute bg-yellow-400 items-center justify-center"
        style={styles.fab}
        onPress={() => setActiveSheet('signup')}
        activeOpacity={0.88}
      >
        <AppIcon name="add" size={24} color="#0D3B1F" />
      </TouchableOpacity>

      <BottomSheet
        visible={activeSheet === 'filter'}
        onClose={closeSheet}
        maxHeight="88%"
      >
        <FilterSheet
          selectedCommodity={selectedCommodity}
          setSelectedCommodity={setSelectedCommodity}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          minQuantity={minQuantity}
          setMinQuantity={setMinQuantity}
          onDone={closeSheet}
        />
      </BottomSheet>

      <BottomSheet visible={activeSheet === 'sort'} onClose={closeSheet}>
        <SortSheet
          sortBy={sortBy}
          onSelect={value => {
            setSortBy(value);
            closeSheet();
          }}
        />
      </BottomSheet>

      <BottomSheet visible={activeSheet === 'signup'} onClose={closeSheet}>
        <SignupSheet
          onCreateAccount={() => {
            closeSheet();
            navigation.navigate('Welcome');
          }}
          onContinue={closeSheet}
        />
      </BottomSheet>
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
  demandOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  demandMetaBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 11,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  demandMetaRow: {
    gap: 12,
  },
  demandMetaItem: {
    gap: 5,
  },
  locationOverlayRow: {
    gap: 3,
  },
  interestButton: {
    shadowColor: '#F3CD03',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  offerButton: {
    shadowColor: '#F3CD03',
    shadowOpacity: 0.26,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  fab: {
    bottom: 20,
    right: 18,
    width: 52,
    height: 52,
    borderRadius: 26,
    shadowColor: '#F3CD03',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
  sheetPanel: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetFixedHeader: {
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  sheetScroll: {
    flexGrow: 0,
  },
  filterSheetContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  sortSheetContent: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  signupSheetContent: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  sheetSection: {
    marginBottom: 22,
  },
  choiceChip: {
    borderWidth: 1.5,
  },
  choiceChipActive: {
    borderColor: '#2E9E52',
    backgroundColor: '#217A3C',
  },
  choiceChipInactive: {
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  choiceChipText: {
    color: '#4B5563',
  },
  choiceChipTextActive: {
    color: '#FFFFFF',
  },
  selectText: {
    color: '#9CA3AF',
  },
  selectTextActive: {
    color: '#111827',
  },
  dropdownOptionText: {
    color: '#374151',
  },
  dropdownOptionTextActive: {
    color: '#1A6B34',
  },
  priceRangeRow: {
    gap: 10,
  },
  sortOption: {
    gap: 14,
    borderWidth: 1.5,
  },
  sortOptionActive: {
    borderColor: '#2E9E52',
    backgroundColor: '#F2FBF5',
  },
  sortOptionInactive: {
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  sortIcon: {
    backgroundColor: '#F9FAFB',
  },
  sortIconActive: {
    backgroundColor: '#E8F7EE',
  },
  sortLabel: {
    color: '#374151',
    fontWeight: '500',
  },
  sortLabelActive: {
    color: '#1A6B34',
    fontWeight: '700',
  },
  sheetInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    minHeight: 44,
  },
  commodityDropdown: {
    maxHeight: 178,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  signupLogo: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 14,
  },
  signupPrimaryButton: {
    shadowColor: '#F3CD03',
    shadowOpacity: 0.33,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  signupSecondaryButton: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  forwardIcon: {
    transform: [{ rotate: '180deg' }],
  },
});

export default MarketplaceScreen;
