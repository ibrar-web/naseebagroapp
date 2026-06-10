import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { ViewToken } from 'react-native';
import { useAppSelector } from '../../../store';
import { useTranslation } from '../../../localization';
import { AppIcon } from '../../../assets/icons';
import type { AppIconName } from '../../../assets/icons';
import MockStatusBar from '../../components/MockStatusBar';
import iconRegistry from '../../../assets/icons/iconRegistry';
import api from '../../../utils/api';

type SheetType = 'filter' | 'sort' | 'signup' | null;
type PostType = 'SUPPLY' | 'DEMAND';
type SortValue =
  | 'newest'
  | 'price_asc'
  | 'price_desc'
  | 'distance_nearest'
  | 'most_stock';

type MarketCategory = {
  id: string;
  name: string;
  image_url?: string | null;
  listings_count?: number;
};

type FilterOption = {
  id: string;
  name: string;
};

type ListingMillPrice = {
  mill?: {
    id?: string;
    mill_id?: string;
    name?: string;
    city?: string;
    province?: string;
  };
  price_display?: string;
  available_label?: string;
};

type MarketListing = {
  id: string;
  code?: string;
  post_type?: PostType;
  badge?: string | null;
  is_verified?: boolean;
  commodity?: {
    id?: string;
    name?: string;
    image_url?: string;
    category?: {
      id?: string;
      name?: string;
    };
  };
  unit?: {
    code?: string;
    name?: string;
  };
  seller?: {
    fullName?: string;
    is_verified?: boolean;
    rating?: string;
    deals_count?: number;
  };
  total_quantity?: number;
  total_quantity_label?: string;
  price_display?: string;
  is_mill_based?: boolean;
  mill_prices_preview?: ListingMillPrice[];
  mill_prices_total?: number;
  more_mills_label?: string | null;
  location?: string | null;
  avg_rating?: string;
  review_count?: number;
  rating_display?: string;
  min_order_quantity?: number | null;
  payment_term_type?: string | null;
  created_at?: string;
};

type MarketplaceMeta = {
  total?: number;
  page?: number;
  limit?: number;
  total_pages?: number;
  count_label?: string;
  listings_found_label?: string;
  indicative_notice?: string;
};

type MarketplacePayload = {
  categories: MarketCategory[];
  listings: MarketListing[];
  filterOptions: {
    commodities: FilterOption[];
    locations: string[];
    badges: string[];
  };
  meta: MarketplaceMeta;
};

type MarketplaceFilters = {
  selectedCommodityId: string;
  selectedLocation: string;
  selectedBadge: string;
  verifiedOnly: boolean;
  minPrice: string;
  maxPrice: string;
  minQuantity: string;
};

const PAGE_SIZE = 20;
const FALLBACK_COLORS = ['#8A9A5B', '#C29A4A', '#D8D6C7', '#DCA640', '#D9A825'];
const EMPTY_FILTERS: MarketplaceFilters = {
  selectedCommodityId: '',
  selectedLocation: '',
  selectedBadge: '',
  verifiedOnly: false,
  minPrice: '',
  maxPrice: '',
  minQuantity: '',
};

const SORT_OPTIONS: Array<{
  label: string;
  value: SortValue;
  icon: AppIconName;
}> = [
  { label: 'Newest First', value: 'newest', icon: 'profileDateOfBirth' },
  { label: 'Price: Low to High', value: 'price_asc', icon: 'currency' },
  { label: 'Price: High to Low', value: 'price_desc', icon: 'currency' },
  {
    label: 'Distance: Nearest',
    value: 'distance_nearest',
    icon: 'profileCity',
  },
  { label: 'Most Quantity', value: 'most_stock', icon: 'listing' },
];

const cleanParams = (params: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value === '' || value == null) {
        return false;
      }
      return true;
    }),
  );

const normalizeMarketplacePayload = (response: any): MarketplacePayload => {
  const root =
    response?.status && response?.data ? response.data : response ?? {};
  const body =
    root?.data &&
    (Array.isArray(root.data.categories) ||
      Array.isArray(root.data.listings) ||
      root.data.filter_options)
      ? root.data
      : root;
  const filterOptions = body?.filter_options ?? {};

  return {
    categories: Array.isArray(body.categories) ? body.categories : [],
    listings: Array.isArray(body.listings) ? body.listings : [],
    filterOptions: {
      commodities: Array.isArray(filterOptions.commodities)
        ? filterOptions.commodities
        : [],
      locations: Array.isArray(filterOptions.locations)
        ? filterOptions.locations
        : [],
      badges: Array.isArray(filterOptions.badges) ? filterOptions.badges : [],
    },
    meta: root?.meta ?? {},
  };
};

const formatBadge = (badge?: string | null) =>
  badge ? badge.replace(/_/g, ' ') : '';

const formatDateLabel = (date?: string) => {
  if (!date) {
    return 'Recently posted';
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return 'Recently posted';
  }

  return `Posted ${parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })}`;
};

const getListingLocation = (item: MarketListing) => {
  if (item.location) {
    return item.location;
  }

  const mill = item.mill_prices_preview?.[0]?.mill;
  const parts = [mill?.city, mill?.province].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Multiple mills';
};

const getSellerName = (item: MarketListing, isBuyer: boolean) =>
  item.seller?.fullName ?? (isBuyer ? 'Verified seller' : 'Verified buyer');

const getMillRows = (item: MarketListing): ListingMillPrice[] => {
  if (item.mill_prices_preview?.length) {
    return item.mill_prices_preview;
  }

  return [
    {
      mill: {
        id: item.id,
        name: item.location ? `${item.location} listing` : 'Direct listing',
        city: item.location ?? undefined,
      },
      price_display: item.price_display,
      available_label: item.total_quantity_label,
    },
  ];
};

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
      {label}
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

const SelectDropdown = ({
  label,
  placeholder,
  options,
  selectedId,
  onSelect,
}: {
  label: string;
  placeholder: string;
  options: FilterOption[];
  selectedId: string;
  onSelect: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find(option => option.id === selectedId);

  return (
    <SheetSection title={label}>
      <TouchableOpacity
        onPress={() => setOpen(current => !current)}
        className="rounded-[10px] flex-row items-center justify-between px-3 py-3"
        style={styles.sheetInput}
        activeOpacity={0.84}
      >
        <Text
          className="text-[13px] font-semibold flex-1"
          style={selected ? styles.selectTextActive : styles.selectText}
          numberOfLines={1}
        >
          {selected?.name ?? placeholder}
        </Text>
        <AppIcon name="chevronDown" size={15} color="#9CA3AF" />
      </TouchableOpacity>
      {open ? (
        <View style={styles.commodityDropdown}>
          <FlatList
            nestedScrollEnabled
            data={[{ id: '', name: placeholder }, ...options]}
            keyExtractor={item => item.id || 'all'}
            renderItem={({ item }) => {
              const active = selectedId === item.id;
              return (
                <TouchableOpacity
                  className="flex-row items-center justify-between px-3 py-2.5"
                  onPress={() => {
                    onSelect(item.id);
                    setOpen(false);
                  }}
                  activeOpacity={0.82}
                >
                  <Text
                    className="text-[13px] font-semibold flex-1"
                    style={
                      active
                        ? styles.dropdownOptionTextActive
                        : styles.dropdownOptionText
                    }
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  {active ? (
                    <AppIcon name="approved" size={15} color="#217A3C" />
                  ) : null}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      ) : null}
    </SheetSection>
  );
};

const FilterSheet = ({
  commodities,
  locations,
  badges,
  selectedCommodityId,
  setSelectedCommodityId,
  selectedLocation,
  setSelectedLocation,
  selectedBadge,
  setSelectedBadge,
  verifiedOnly,
  setVerifiedOnly,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  minQuantity,
  setMinQuantity,
  onClear,
  onDone,
}: {
  commodities: FilterOption[];
  locations: string[];
  badges: string[];
  selectedCommodityId: string;
  setSelectedCommodityId: (value: string) => void;
  selectedLocation: string;
  setSelectedLocation: (value: string) => void;
  selectedBadge: string;
  setSelectedBadge: (value: string) => void;
  verifiedOnly: boolean;
  setVerifiedOnly: (value: boolean) => void;
  minPrice: string;
  setMinPrice: (value: string) => void;
  maxPrice: string;
  setMaxPrice: (value: string) => void;
  minQuantity: string;
  setMinQuantity: (value: string) => void;
  onClear: () => void;
  onDone: () => void;
}) => (
  <>
    <View style={styles.sheetFixedHeader}>
      <SheetHandle />
      <View className="flex-row justify-between items-center mb-5">
        <Text className="text-gray-900 text-[17px] font-extrabold">
          Filters
        </Text>
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <TouchableOpacity
            className="rounded-lg px-3.5 py-1.5 border border-gray-200"
            onPress={onClear}
            activeOpacity={0.84}
          >
            <Text className="text-gray-600 text-xs font-bold">
              Clear Filters
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-green-800 rounded-lg px-3.5 py-1.5"
            onPress={onDone}
            activeOpacity={0.84}
          >
            <Text className="text-white text-xs font-bold">Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
    <FlatList
      data={[0]}
      keyExtractor={item => String(item)}
      style={styles.sheetScroll}
      contentContainerStyle={styles.filterSheetContent}
      showsVerticalScrollIndicator={false}
      renderItem={() => (
        <>
          <SelectDropdown
            label="COMMODITY"
            placeholder="All Commodities"
            options={commodities}
            selectedId={selectedCommodityId}
            onSelect={setSelectedCommodityId}
          />

          <SheetSection title="LOCATION">
            <View className="flex-row flex-wrap">
              {['All', ...locations].map(location => (
                <ChoiceChip
                  key={location}
                  label={location}
                  active={
                    selectedLocation === (location === 'All' ? '' : location)
                  }
                  onPress={() =>
                    setSelectedLocation(location === 'All' ? '' : location)
                  }
                />
              ))}
            </View>
          </SheetSection>

          {badges.length ? (
            <SheetSection title="BADGE">
              <View className="flex-row flex-wrap">
                {['All', ...badges].map(badge => (
                  <ChoiceChip
                    key={badge}
                    label={badge === 'All' ? 'All' : formatBadge(badge)}
                    active={selectedBadge === (badge === 'All' ? '' : badge)}
                    onPress={() =>
                      setSelectedBadge(badge === 'All' ? '' : badge)
                    }
                  />
                ))}
              </View>
            </SheetSection>
          ) : null}

          <SheetSection title="PRICE RANGE">
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

          <SheetSection title="MINIMUM QUANTITY">
            <NumberInput
              value={minQuantity}
              onChangeText={setMinQuantity}
              placeholder="e.g. 50"
            />
          </SheetSection>

          <SheetSection title="VERIFICATION">
            <ChoiceChip
              label="Verified only"
              active={verifiedOnly}
              onPress={() => setVerifiedOnly(!verifiedOnly)}
            />
          </SheetSection>
        </>
      )}
    />
  </>
);

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
  sortBy: SortValue;
  onSelect: (value: SortValue) => void;
}) => (
  <View style={styles.sortSheetContent}>
    <SheetHandle />
    <Text className="text-gray-900 text-[17px] font-extrabold mb-4">
      Sort By
    </Text>
    {SORT_OPTIONS.map(option => (
      <SortOption
        key={option.value}
        option={option}
        active={sortBy === option.value}
        onPress={() => onSelect(option.value)}
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
  index,
  active,
  onPress,
}: {
  item: MarketCategory;
  index: number;
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
      source={{
        uri:
          item.image_url ??
          `https://placehold.co/200x200?text=${encodeURIComponent(item.name)}`,
      }}
      resizeMode="cover"
      imageStyle={styles.categoryImage}
      style={[
        styles.categoryImage,
        { backgroundColor: FALLBACK_COLORS[index % FALLBACK_COLORS.length] },
      ]}
    >
      <View style={styles.categoryOverlay} />
    </ImageBackground>
    <View className="py-1.5 px-1 items-center">
      <Text className="text-gray-900 text-[11px] font-bold" numberOfLines={1}>
        {item.name}
      </Text>
      <Text className="text-gray-400 text-[9px] mt-0.5">
        {item.listings_count ?? 0} listings
      </Text>
    </View>
  </TouchableOpacity>
);

const MillPriceRow = ({
  mill,
  featured,
}: {
  mill: ListingMillPrice;
  featured: boolean;
}) => {
  const millName = mill.mill?.name ?? 'Direct listing';
  const location = [mill.mill?.city, mill.mill?.province]
    .filter(Boolean)
    .join(', ');

  return (
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
            {millName}
          </Text>
          <Text
            className="text-[10px] mt-0.5"
            numberOfLines={1}
            style={{ color: featured ? 'rgba(255,255,255,0.48)' : '#9CA3AF' }}
          >
            {mill.available_label ?? location}
          </Text>
        </View>
      </View>
      <View className="items-end ml-2">
        <Text
          className="text-sm font-black"
          style={{ color: featured ? '#F7DB4A' : '#1A6B34' }}
        >
          {mill.price_display ?? 'Ask'}
        </Text>
        <Text
          className="text-[9px]"
          style={{ color: featured ? 'rgba(255,255,255,0.42)' : '#9CA3AF' }}
        >
          Price
        </Text>
      </View>
    </View>
  );
};

const MarketplaceListingCard = ({
  item,
  isBuyer,
  index,
  onPress,
}: {
  item: MarketListing;
  isBuyer: boolean;
  index: number;
  onPress: () => void;
}) => {
  const { t } = useTranslation();
  const image = item.commodity?.image_url;
  const fallback = FALLBACK_COLORS[index % FALLBACK_COLORS.length];
  const millRows = getMillRows(item);
  const badge = item.badge
    ? formatBadge(item.badge)
    : isBuyer
    ? 'SUPPLY'
    : 'OPEN DEMAND';
  const actionLabel = isBuyer ? t('listing.sendInterest') : 'Send Offer';
  const millsTitle = isBuyer ? 'Mill Prices' : 'Demand Prices';
  const category = item.commodity?.category?.name ?? 'Commodity';
  const rating = item.rating_display ?? `${item.seller?.rating ?? '0.0'}`;
  const location = getListingLocation(item);
  const counterparty = getSellerName(item, isBuyer);

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white overflow-hidden mb-3.5"
      style={[styles.listingCard, cardShadow.card]}
      activeOpacity={0.9}
    >
      <ImageBackground
        source={{
          uri:
            image ??
            `https://placehold.co/600x400?text=${encodeURIComponent(
              item.commodity?.name ?? 'Commodity',
            )}`,
        }}
        resizeMode="cover"
        imageStyle={styles.listingImage}
        style={[styles.listingImage, { backgroundColor: fallback }]}
      >
        <View style={isBuyer ? styles.listingOverlay : styles.demandOverlay} />
        <View className="absolute top-2.5 left-3 bg-yellow-400 rounded-md px-2.5 py-1">
          <Text className="text-green-950 text-[9px] font-black">{badge}</Text>
        </View>
        {item.is_verified ? (
          <View className="absolute top-2.5 right-3 flex-row items-center rounded-md px-2 py-1 bg-black/45">
            <AppIcon name="approved" size={10} color="#7FD4A0" />
            <Text className="text-[#7FD4A0] text-[9px] font-bold ml-1">
              VERIFIED
            </Text>
          </View>
        ) : (
          <View className="absolute top-2.5 right-3 rounded-md px-2 py-1 bg-black/45">
            <Text className="text-white/85 text-[9px] font-semibold">
              {formatDateLabel(item.created_at)}
            </Text>
          </View>
        )}
        <View className="absolute bottom-2.5 left-3 right-3">
          <Text className="text-white/60 text-[9px] font-mono mb-0.5">
            {item.code ?? item.id}
          </Text>
          <Text className="text-white text-base font-black" numberOfLines={1}>
            {item.commodity?.name ?? 'Commodity'}
          </Text>
        </View>
      </ImageBackground>

      <View className="px-3.5 pt-3 pb-3.5">
        <View className="flex-row justify-between items-center mb-2.5">
          <View className="flex-row items-center flex-1" style={{ gap: 6 }}>
            <Text className="text-gray-500 text-[11px] font-semibold">
              {category}
            </Text>
            <Text className="text-gray-200 text-[10px]">·</Text>
            <Text
              numberOfLines={1}
              className="text-gray-700 text-[11px] font-bold flex-1"
            >
              {item.total_quantity_label ?? 'Quantity available'}
            </Text>
          </View>
          <View className="flex-row items-center" style={{ gap: 3 }}>
            <Text className="text-[10px]">★</Text>
            <Text className="text-gray-700 text-[11px] font-bold">
              {rating}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center mb-3" style={{ gap: 5 }}>
          <AppIcon name="profileCity" size={11} color="#9CA3AF" />
          <Text className="text-gray-500 text-[11px]" numberOfLines={1}>
            {location} · {counterparty}
          </Text>
        </View>

        <View className="mb-3">
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-row items-center" style={{ gap: 5 }}>
              <View className="w-5 h-5 rounded-md bg-green-50 items-center justify-center">
                <AppIcon name="listing" size={11} color="#1A6B34" />
              </View>
              <Text className="text-green-900 text-[11px] font-bold">
                {millsTitle}
              </Text>
            </View>
            {item.mill_prices_total &&
            item.mill_prices_total > millRows.length ? (
              <Text className="text-green-700 text-[10px] font-bold bg-green-50 rounded-full px-2 py-0.5">
                {item.more_mills_label ??
                  `+${item.mill_prices_total - millRows.length} more mill`}
              </Text>
            ) : null}
          </View>
          {millRows.slice(0, 3).map((mill, millIndex) => (
            <MillPriceRow
              key={`${item.id}-${
                mill.mill?.id ?? mill.mill?.name ?? millIndex
              }`}
              mill={mill}
              featured={millIndex === 0}
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
              {actionLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const MarketplaceScreen = ({ navigation }: any) => {
  const mode = useAppSelector(s => s.app.mode);
  const { t } = useTranslation();
  const isBuyer = mode === 'buyer';
  const postType: PostType = isBuyer ? 'SUPPLY' : 'DEMAND';
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState('');
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);
  const [selectedCommodityId, setSelectedCommodityId] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedBadge, setSelectedBadge] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minQuantity, setMinQuantity] = useState('');
  const [appliedFilters, setAppliedFilters] =
    useState<MarketplaceFilters>(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState<SortValue>('newest');
  const [categories, setCategories] = useState<MarketCategory[]>([]);
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [filterOptions, setFilterOptions] = useState<
    MarketplacePayload['filterOptions']
  >({
    commodities: [],
    locations: [],
    badges: [],
  });
  const [meta, setMeta] = useState<MarketplaceMeta>({});
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timeout);
  }, [search]);

  const requestParams = useMemo(() => {
    const distanceSortNeedsCoordinates = sortBy === 'distance_nearest';

    return cleanParams({
      limit: PAGE_SIZE,
      search: debouncedSearch.trim(),
      post_type: postType,
      category_id: activeCategoryId,
      commodity_id: appliedFilters.selectedCommodityId,
      location: appliedFilters.selectedLocation,
      min_price: appliedFilters.minPrice,
      max_price: appliedFilters.maxPrice,
      min_quantity: appliedFilters.minQuantity,
      badge: appliedFilters.selectedBadge,
      verified_only: appliedFilters.verifiedOnly ? true : undefined,
      sort: distanceSortNeedsCoordinates ? undefined : sortBy,
    });
  }, [activeCategoryId, appliedFilters, debouncedSearch, postType, sortBy]);

  const fetchListings = useCallback(
    async (pageToLoad = 1, append = false, isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError('');

      try {
        const endpoint = isBuyer
          ? api.marketplace.public.listMarketSuppliesListing
          : api.marketplace.public.listMarketDemandsListing;
        const response = await endpoint({
          ...requestParams,
          page: pageToLoad,
        });
        console.log('market place api response:', response);
        const normalized = normalizeMarketplacePayload(response);
        const responsePage = normalized.meta.page ?? pageToLoad;

        setCategories(normalized.categories);
        setFilterOptions(normalized.filterOptions);
        setMeta({ ...normalized.meta, page: responsePage });
        setListings(current => {
          if (!append) {
            return normalized.listings;
          }

          const seen = new Set(current.map(item => item.id));
          return [
            ...current,
            ...normalized.listings.filter(item => !seen.has(item.id)),
          ];
        });
        setHasLoadedOnce(true);
      } catch (err) {
        console.log('Marketplace listings error', err);
        setError('Unable to load marketplace listings. Pull latest again.');
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        } else if (append) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [isBuyer, requestParams],
  );

  useEffect(() => {
    setListings([]);
    setMeta({});
    fetchListings(1, false);
  }, [fetchListings]);

  const hasMore = (meta.page ?? 1) < (meta.total_pages ?? 1);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) {
      return;
    }

    fetchListings((meta.page ?? 1) + 1, true);
  }, [fetchListings, hasMore, loading, loadingMore, meta.page]);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 35 });
  const paginationRef = useRef({
    listingsLength: 0,
    loadMore: () => {},
  });
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const { listingsLength, loadMore: loadNextPage } = paginationRef.current;
      const shouldLoad = viewableItems.some(
        viewable =>
          typeof viewable.index === 'number' &&
          viewable.index >= Math.max(listingsLength - 3, 0),
      );

      if (shouldLoad) {
        loadNextPage();
      }
    },
  );

  useEffect(() => {
    paginationRef.current = {
      listingsLength: listings.length,
      loadMore,
    };
  }, [listings.length, loadMore]);

  const syncDraftFilters = (filters: MarketplaceFilters) => {
    setSelectedCommodityId(filters.selectedCommodityId);
    setSelectedLocation(filters.selectedLocation);
    setSelectedBadge(filters.selectedBadge);
    setVerifiedOnly(filters.verifiedOnly);
    setMinPrice(filters.minPrice);
    setMaxPrice(filters.maxPrice);
    setMinQuantity(filters.minQuantity);
  };
  const getDraftFilters = (): MarketplaceFilters => ({
    selectedCommodityId,
    selectedLocation,
    selectedBadge,
    verifiedOnly,
    minPrice,
    maxPrice,
    minQuantity,
  });
  const openFilterSheet = () => {
    syncDraftFilters(appliedFilters);
    setActiveSheet('filter');
  };
  const applyFilters = () => {
    setAppliedFilters(getDraftFilters());
    setActiveSheet(null);
  };
  const clearDraftFilters = () => {
    syncDraftFilters(EMPTY_FILTERS);
  };
  const closeSheet = () => {
    if (activeSheet === 'filter') {
      syncDraftFilters(appliedFilters);
    }
    setActiveSheet(null);
  };
  const countLabel =
    meta.count_label ??
    (isBuyer
      ? `${meta.total ?? listings.length} verified supplies`
      : t('market.activeRequests', { count: meta.total ?? listings.length }));
  const foundLabel =
    meta.listings_found_label ??
    `${meta.total ?? listings.length} Listings Found`;

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
            <Text className="text-white/55 text-xs mt-0.5">{countLabel}</Text>
          </View>
          <View className="flex-row" style={{ gap: 8 }}>
            <HeaderAction
              icon="filter"
              label={t('market.filter')}
              onPress={openFilterSheet}
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
        data={listings}
        keyExtractor={(item: MarketListing) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.35}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchListings(1, false, true)}
            tintColor="#217A3C"
          />
        }
        ListHeaderComponent={
          <>
            <View className="mb-[18px]">
              <Text className="text-gray-900 text-[15px] font-bold mb-3">
                Browse by Category
              </Text>
              <FlatList
                horizontal
                data={categories}
                keyExtractor={item => item.id}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, index }) => (
                  <CategoryCard
                    item={item}
                    index={index}
                    active={activeCategoryId === item.id}
                    onPress={() =>
                      setActiveCategoryId(current =>
                        current === item.id ? '' : item.id,
                      )
                    }
                  />
                )}
              />
            </View>

            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-900 text-[15px] font-bold">
                {foundLabel}
              </Text>
              {activeCategoryId ? (
                <TouchableOpacity onPress={() => setActiveCategoryId('')}>
                  <Text className="text-green-700 text-xs font-semibold">
                    Show All
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </>
        }
        renderItem={({ item, index }) => (
          <MarketplaceListingCard
            item={item}
            isBuyer={isBuyer}
            index={index}
            onPress={() =>
              navigation.navigate(
                'CommodityDetail',
                {
                  listingId: item.id,
                },
              )
            }
          />
        )}
        ListFooterComponent={
          loadingMore ? (
            <View className="py-4 items-center">
              <ActivityIndicator color="#217A3C" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          loading && !hasLoadedOnce ? (
            <View className="items-center pt-16">
              <ActivityIndicator color="#217A3C" />
              <Text className="text-gray-500 text-sm mt-3">
                Loading marketplace...
              </Text>
            </View>
          ) : (
            <View className="items-center pt-16">
              <AppIcon name="search" size={40} color="#9CA3AF" />
              <Text className="text-gray-800 text-base font-bold mt-2">
                {error || t('market.noResults')}
              </Text>
              <Text className="text-gray-400 text-sm mt-1">
                {t('market.adjustSearch')}
              </Text>
            </View>
          )
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
          commodities={filterOptions.commodities}
          locations={filterOptions.locations}
          badges={filterOptions.badges}
          selectedCommodityId={selectedCommodityId}
          setSelectedCommodityId={setSelectedCommodityId}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          selectedBadge={selectedBadge}
          setSelectedBadge={setSelectedBadge}
          verifiedOnly={verifiedOnly}
          setVerifiedOnly={setVerifiedOnly}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          minQuantity={minQuantity}
          setMinQuantity={setMinQuantity}
          onClear={clearDraftFilters}
          onDone={applyFilters}
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
  interestButton: {
    shadowColor: '#F3CD03',
    shadowOpacity: 0.28,
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
