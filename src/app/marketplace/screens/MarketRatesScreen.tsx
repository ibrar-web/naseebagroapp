import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppIcon } from '../../../assets/icons';
import type { AppIconName } from '../../../assets/icons';
import api from '../../../utils/api';
import MockStatusBar from '../../components/MockStatusBar';

type MarketMill = {
  id: string;
  mill_id?: string;
  name: string;
  city?: string;
  province?: string;
  short_code?: string;
};

type MarketRate = {
  id: string;
  name: string;
  category?: string;
  mill: string;
  mill_id?: string;
  price: string;
  prevPrice?: string | null;
  unit: string;
  change: string;
  up: boolean;
  updatedAt: string;
  image?: string;
  fallback?: string;
};

type MarketRatesPayload = {
  mills?: MarketMill[];
  rates?: MarketRate[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    total_pages?: number;
  };
  indicative_notice?: string;
};

type SortValue = 'latest' | 'price_asc' | 'price_desc' | 'rising';

const SORT_OPTIONS: Array<{
  label: string;
  value: SortValue;
  icon: AppIconName;
}> = [
  { label: 'Latest Updated', value: 'latest', icon: 'profileDateOfBirth' },
  { label: 'Price: Low to High', value: 'price_asc', icon: 'currency' },
  { label: 'Price: High to Low', value: 'price_desc', icon: 'currency' },
  { label: 'Rising First', value: 'rising', icon: 'tabMarket' },
];

const FALLBACK_COLORS = ['#8A9A5B', '#C29A4A', '#D8D6C7', '#DCA640', '#D9A825'];

const normalizeMarketRatesPayload = (response: any): MarketRatesPayload => {
  const payload = response?.data ?? response ?? {};
  return {
    mills: Array.isArray(payload.mills) ? payload.mills : [],
    rates: Array.isArray(payload.rates) ? payload.rates : [],
    meta: payload.meta ?? {},
    indicative_notice:
      payload.indicative_notice ??
      'Indicative rates only. Actual transaction price may vary.',
  };
};

const cleanParams = (params: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value != null),
  );

const buildRateParams = ({
  millId,
  search,
  sort,
}: {
  millId: string;
  search: string;
  sort: SortValue;
}) => {
  const sortParams =
    sort === 'rising'
      ? { trend: 'rising' }
      : {
          sort,
        };

  return cleanParams({
    page: 1,
    limit: 20,
    mill_id: millId,
    search: search.trim(),
    ...sortParams,
  });
};

const RateCard = ({ item, index }: { item: MarketRate; index: number }) => {
  const changeColor = item.up ? '#16A34A' : '#DC2626';
  const changeBg = item.up ? '#DCFCE7' : '#FEE2E2';
  const fallback =
    item.fallback ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];

  return (
    <View style={styles.card}>
      <View style={[styles.cardImageWrap, { backgroundColor: fallback }]}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.cardImage} />
        ) : null}
        <View style={styles.cardImageOverlay} />
      </View>

      <View style={styles.cardMiddle}>
        <Text style={styles.commodityName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.millName} numberOfLines={1}>
          {item.mill}
        </Text>
        <Text style={styles.prevRate} numberOfLines={1}>
          Prev rate:{' '}
          <Text style={styles.prevRateStrong}>
            {item.prevPrice ? `${item.prevPrice}${item.unit}` : 'N/A'}
          </Text>
        </Text>
        <Text style={styles.updatedAt}>Updated {item.updatedAt}</Text>
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

const SortSheet = ({
  visible,
  selectedSort,
  onClose,
  onSelect,
}: {
  visible: boolean;
  selectedSort: SortValue;
  onClose: () => void;
  onSelect: (sort: SortValue) => void;
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <View style={styles.modalRoot}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={styles.sheetPanel}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>Sort By</Text>
        {SORT_OPTIONS.map(option => {
          const active = selectedSort === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onSelect(option.value)}
              style={[
                styles.sortOption,
                active ? styles.sortOptionActive : styles.sortOptionInactive,
              ]}
              activeOpacity={0.84}
            >
              <View
                style={[
                  styles.sortIconWrap,
                  active ? styles.sortIconWrapActive : null,
                ]}
              >
                <AppIcon
                  name={option.icon}
                  size={16}
                  color={active ? '#217A3C' : '#6B7280'}
                />
              </View>
              <Text
                style={[
                  styles.sortOptionText,
                  active ? styles.sortOptionTextActive : null,
                ]}
              >
                {option.label}
              </Text>
              {active ? (
                <AppIcon name="approved" size={16} color="#217A3C" />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  </Modal>
);

const MarketRatesScreen = ({ navigation }: any) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedMillId, setSelectedMillId] = useState('');
  const [selectedSort, setSelectedSort] = useState<SortValue>('latest');
  const [sortSheetVisible, setSortSheetVisible] = useState(false);
  const [mills, setMills] = useState<MarketMill[]>([]);
  const [rates, setRates] = useState<MarketRate[]>([]);
  const [notice, setNotice] = useState(
    'Indicative rates only. Actual transaction price may vary.',
  );
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timeout);
  }, [search]);

  const params = useMemo(
    () =>
      buildRateParams({
        millId: selectedMillId,
        search: debouncedSearch,
        sort: selectedSort,
      }),
    [debouncedSearch, selectedMillId, selectedSort],
  );

  const loadRates = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      try {
        const response: any = await api.marketplace.public.listMarketRatesAll(
          params,
        );
        const payload = normalizeMarketRatesPayload(response);
        setMills(payload.mills ?? []);
        setRates(payload.rates ?? []);
        setNotice(
          payload.indicative_notice ??
            'Indicative rates only. Actual transaction price may vary.',
        );
        setTotalCount(payload.meta?.total ?? payload.rates?.length ?? 0);
        setHasLoadedOnce(true);
      } catch {
        setError('Unable to load market rates. Pull latest again.');
        setRates([]);
        setHasLoadedOnce(true);
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [params],
  );

  useEffect(() => {
    loadRates();
  }, [loadRates]);

  const selectedSortLabel =
    SORT_OPTIONS.find(option => option.value === selectedSort)?.label ??
    'Latest';

  const tabs = useMemo(() => [{ id: '', name: 'All' }, ...mills], [mills]);

  return (
    <View style={styles.container}>
      <MockStatusBar backgroundColor="#0D3B1F" textColor="#FFFFFF" />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <AppIcon name="back" size={18} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.headerTitleText}>Market Rates</Text>
            <Text style={styles.headerSubtitle}>
              {loading && !hasLoadedOnce
                ? 'Loading latest rates...'
                : `${totalCount} rates · Admin updated`}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.latestButton}
            activeOpacity={0.8}
            onPress={() => setSortSheetVisible(true)}
          >
            <AppIcon name="notificationWarning" size={13} color="#FFFFFF" />
            <Text style={styles.latestText}>Latest</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <AppIcon name="search" size={14} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search commodity..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 ? (
            <TouchableOpacity
              onPress={() => setSearch('')}
              style={styles.clearButton}
              activeOpacity={0.75}
            >
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {tabs.map(mill => {
            const isActive = selectedMillId === mill.id;
            return (
              <TouchableOpacity
                key={mill.id || 'all-mills'}
                onPress={() => setSelectedMillId(mill.id)}
                style={[styles.tab, isActive && styles.tabActive]}
                activeOpacity={0.75}
              >
                <Text
                  style={[styles.tabText, isActive && styles.tabTextActive]}
                  numberOfLines={1}
                >
                  {mill.short_code || mill.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.warningBanner}>
        <AppIcon name="version" size={11} color="#F3CD03" />
        <Text style={styles.warningText}>{notice}</Text>
      </View>

      {error ? (
        <TouchableOpacity
          style={styles.errorBanner}
          onPress={() => setDebouncedSearch(search)}
          activeOpacity={0.8}
        >
          <Text style={styles.errorText}>{error}</Text>
        </TouchableOpacity>
      ) : null}

      <FlatList
        data={rates}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadRates(true)}
            tintColor="#217A3C"
          />
        }
        renderItem={({ item, index }) => <RateCard item={item} index={index} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {loading ? (
              <ActivityIndicator color="#217A3C" />
            ) : (
              <>
                <Text style={styles.emptyEmoji}>📊</Text>
                <Text style={styles.emptyTitle}>No rates found</Text>
                <Text style={styles.emptySubtitle}>
                  Try a different mill, search, or filter
                </Text>
              </>
            )}
          </View>
        }
      />

      <SortSheet
        visible={sortSheetVisible}
        selectedSort={selectedSort}
        onClose={() => setSortSheetVisible(false)}
        onSelect={sort => {
          setSelectedSort(sort);
          setSortSheetVisible(false);
        }}
      />

      {loading && hasLoadedOnce ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color="#217A3C" />
          <Text style={styles.loadingText}>Updating {selectedSortLabel}</Text>
        </View>
      ) : null}
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
    paddingTop: 10,
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
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
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
  latestText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 2,
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
    paddingHorizontal: 12,
  },
  tab: {
    maxWidth: 150,
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
  warningText: {
    fontSize: 10,
    color: '#92400E',
    flex: 1,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderBottomWidth: 1,
    borderBottomColor: '#FCA5A5',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B91C1C',
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
  cardImageWrap: {
    width: 64,
    height: 84,
    alignSelf: 'stretch',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  cardMiddle: {
    flex: 1,
    paddingVertical: 11,
    paddingLeft: 12,
    paddingRight: 4,
    justifyContent: 'center',
    gap: 4,
  },
  commodityName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 16,
  },
  millName: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6B7280',
  },
  prevRate: {
    fontSize: 10,
    color: '#6B7280',
  },
  prevRateStrong: {
    fontWeight: '700',
    color: '#4B5563',
  },
  updatedAt: {
    fontSize: 9,
    color: '#D1D5DB',
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
    gap: 3,
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
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheetPanel: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 14,
    paddingHorizontal: 18,
    paddingBottom: 28,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  sortOption: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 7,
    borderWidth: 1.5,
    borderRadius: 11,
  },
  sortOptionActive: {
    borderColor: '#2E9E52',
    backgroundColor: '#F2FBF5',
  },
  sortOptionInactive: {
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  sortIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortIconWrapActive: {
    backgroundColor: '#E8F7EE',
  },
  sortOptionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  sortOptionTextActive: {
    fontWeight: '700',
    color: '#1A6B34',
  },
  loadingOverlay: {
    position: 'absolute',
    right: 14,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
});

export default MarketRatesScreen;
