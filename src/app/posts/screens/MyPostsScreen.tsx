import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppIcon } from '../../../assets/icons';
import { useAppSelector } from '../../../store';
import api from '../../../utils/api';
import MockStatusBar from '../../components/MockStatusBar';

type AppMode = 'buyer' | 'seller';
type TabKey = 'posts' | 'offers';

interface PostItem {
  id: string;
  code: string;
  title: string;
  price: string;
  secondaryText: string;
  qty: string;
  date: string;
  status: string;
  image: string;
  fallback: string;
}

interface OfferItem {
  id: string;
  offerId: string;
  title: string;
  mill: string;
  price: string;
  counterPrice?: string;
  qty: string;
  sentDate: string;
  status: string;
  role: string;
  actionText: string;
}

const PAGE_SIZE = 20;
const FALLBACK_COLORS = ['#8A9A5B', '#C29A4A', '#D8D6C7', '#DCA640'];
const STATUS_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Closed', value: 'closed' },
];

const firstValue = (...values: any[]) =>
  values.find(value => value !== undefined && value !== null && value !== '');

const cleanParams = (params: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value === '' || value === undefined || value === null) {
        return false;
      }
      return true;
    }),
  );

const stringify = (value: any, fallback = '') => {
  const resolved = firstValue(value);
  if (resolved === undefined) {
    return fallback;
  }
  return String(resolved);
};

const numberFrom = (value: any, fallback = 0) => {
  const parsed = Number(String(value ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const titleCaseStatus = (status?: string) => {
  const raw = stringify(status, 'Pending').replace(/_/g, ' ').trim();
  if (!raw) {
    return 'Pending';
  }
  return raw
    .split(' ')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

const formatDateLabel = (value?: string, prefix = 'Posted') => {
  if (!value) {
    return `${prefix} recently`;
  }

  if (value.includes(prefix) || value.includes('ago')) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return `${prefix} ${parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })}`;
};

const priceDisplay = (item: any) => {
  const explicit = firstValue(
    item.price_display,
    item.budget_display,
    item.price_range_display,
    item.asking_price_display,
    item.counter_price_display,
    item.offer_price_display,
  );
  if (explicit) {
    return String(explicit);
  }

  const min = firstValue(item.min_price, item.price_min, item.minimum_price);
  const max = firstValue(item.max_price, item.price_max, item.maximum_price);
  if (min && max) {
    return `PKR ${min} - ${max}`;
  }
  if (min || max) {
    return `PKR ${min ?? max}`;
  }
  if (item.price) {
    return `PKR ${item.price}`;
  }
  return 'Ask';
};

const findArray = (body: any, keys: string[]) => {
  if (Array.isArray(body)) {
    return body;
  }

  for (const key of keys) {
    if (Array.isArray(body?.[key])) {
      return body[key];
    }
  }

  if (Array.isArray(body?.data)) {
    return body.data;
  }

  if (body?.data && typeof body.data === 'object') {
    for (const key of keys) {
      if (Array.isArray(body.data?.[key])) {
        return body.data[key];
      }
    }
  }

  return [];
};

const normalizeListPayload = (response: any, keys: string[]) => {
  const root =
    response?.status && response?.data ? response.data : response ?? {};
  const body =
    root?.data && !Array.isArray(root.data) && typeof root.data === 'object'
      ? root.data
      : root;

  return {
    items: findArray(body, keys),
    meta: root?.meta ?? body?.meta ?? body?.pagination ?? {},
  };
};

const getMetaPage = (meta: any) =>
  numberFrom(meta?.page ?? meta?.current_page ?? meta?.currentPage, 1);

const getMetaTotalPages = (meta: any, itemCount: number) => {
  const totalPages = numberFrom(
    meta?.total_pages ?? meta?.totalPages ?? meta?.last_page,
    0,
  );
  if (totalPages > 0) {
    return totalPages;
  }

  const total = numberFrom(meta?.total, 0);
  const limit = numberFrom(meta?.limit ?? meta?.per_page, PAGE_SIZE);
  if (total > 0 && limit > 0) {
    return Math.max(1, Math.ceil(total / limit));
  }

  return itemCount >= PAGE_SIZE ? getMetaPage(meta) + 1 : 1;
};

const normalizePostItem = (
  item: any,
  index: number,
  mode: AppMode,
): PostItem => {
  const id = stringify(
    firstValue(
      item.id,
      item.post_id,
      item.demand_id,
      item.supply_id,
      item.listing_id,
      item.uuid,
    ),
    `${mode}-post-${index}`,
  );
  const title = stringify(
    firstValue(
      item.title,
      item.name,
      item.commodity?.name,
      item.commodity_name,
      item.product_name,
    ),
    'Commodity',
  );
  const offersCount = numberFrom(
    firstValue(
      item.offers_count,
      item.offers_received_count,
      item.offer_count,
      item.received_offers_count,
      Array.isArray(item.offers) ? item.offers.length : undefined,
    ),
    0,
  );
  const millsCount = numberFrom(
    firstValue(item.mills_count, item.mill_count, item.mill_prices_total),
    0,
  );
  const secondaryText =
    offersCount > 0
      ? `${offersCount} ${offersCount === 1 ? 'offer' : 'offers'}`
      : millsCount > 0
      ? `${millsCount} ${millsCount === 1 ? 'mill' : 'mills'}`
      : mode === 'buyer'
      ? 'No offers yet'
      : 'No buyer offers yet';
  const image =
    firstValue(
      item.hero_image_url,
      item.image_url,
      item.image,
      item.commodity?.image_url,
    ) ?? `https://placehold.co/600x400?text=${encodeURIComponent(title)}`;

  return {
    id,
    code: stringify(
      firstValue(
        item.code,
        item.post_code,
        item.demand_code,
        item.supply_code,
        item.reference_no,
      ),
      id,
    ),
    title,
    price: priceDisplay(item),
    secondaryText,
    qty: stringify(
      firstValue(
        item.quantity_label,
        item.total_quantity_label,
        item.requested_quantity_label,
        item.available_quantity_label,
        item.qty,
        item.quantity,
      ),
      'Quantity not set',
    ),
    date: formatDateLabel(
      firstValue(item.posted_label, item.posted_at, item.created_at, item.date),
    ),
    status: titleCaseStatus(
      firstValue(item.status_label, item.status, item.badge_label, item.badge),
    ),
    image,
    fallback: FALLBACK_COLORS[index % FALLBACK_COLORS.length],
  };
};

const normalizeOfferItem = (
  item: any,
  index: number,
  mode: AppMode,
): OfferItem => {
  const id = stringify(
    firstValue(item.id, item.offer_id, item.negotiation_id, item.uuid),
    `${mode}-offer-${index}`,
  );
  const status = titleCaseStatus(firstValue(item.status_label, item.status));
  const role = stringify(
    firstValue(item.role_label, item.role, item.offer_type_label),
    mode === 'buyer' ? 'Seller Offer' : 'Buyer Offer',
  );

  return {
    id,
    offerId: stringify(
      firstValue(item.code, item.offer_code, item.reference_no),
      id,
    ),
    title: stringify(
      firstValue(
        item.title,
        item.post?.title,
        item.demand?.title,
        item.supply?.title,
        item.commodity?.name,
        item.commodity_name,
      ),
      'Offer',
    ),
    mill: stringify(
      firstValue(
        item.mill?.name,
        item.seller?.business_name,
        item.seller?.fullName,
        item.buyer?.business_name,
        item.buyer?.fullName,
        item.counterparty_name,
      ),
      mode === 'buyer' ? 'Seller' : 'Buyer',
    ),
    price: priceDisplay(item),
    counterPrice: firstValue(
      item.counter_price_display,
      item.counter_offer_display,
      item.latest_counter_display,
    ),
    qty: stringify(
      firstValue(
        item.quantity_label,
        item.supply_quantity_label,
        item.requested_quantity_label,
        item.quantity,
        item.supply_quantity,
      ),
      'Quantity not set',
    ),
    sentDate: formatDateLabel(
      firstValue(item.sent_label, item.created_at, item.sent_at, item.updated_at),
      'Sent',
    ),
    status,
    role,
    actionText: stringify(
      firstValue(item.action_label, item.next_action_label),
      status.toLowerCase().includes('counter') ? 'Respond' : 'View detail',
    ),
  };
};

const statusConfig = (status: string) => {
  const normalized = status.toLowerCase();
  if (
    normalized.includes('inactive') ||
    normalized.includes('closed') ||
    normalized.includes('stale')
  ) {
    return {
      bg: '#6B7280',
      dot: '#FFFFFF',
      text: '#FFFFFF',
      label: 'CLOSED',
    };
  }
  if (normalized.includes('aging') || normalized.includes('expired')) {
    return { bg: '#D97706', dot: '#FFFFFF', text: '#FFFFFF', label: 'AGING' };
  }
  return {
    bg: '#217A3C',
    dot: '#FFFFFF',
    text: '#FFFFFF',
    label: 'ACTIVE',
  };
};

const tagConfig = (status: string) => {
  const normalized = status.toLowerCase();
  if (
    normalized.includes('inactive') ||
    normalized.includes('closed') ||
    normalized.includes('stale')
  ) {
    return {
      bg: '#FEE2E2',
      dot: '#EF4444',
      text: '#EF4444',
      label: status,
    };
  }
  if (normalized.includes('aging') || normalized.includes('expired')) {
    return { bg: '#FEF3C7', dot: '#E8A838', text: '#92400E', label: status };
  }
  return { bg: '#F2FBF5', dot: '#2E9E52', text: '#1A6B34', label: status };
};

const offerStatusConfig = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized.includes('counter') || normalized.includes('awaiting')) {
    return {
      cardBorder: '#F3CD03',
      shadow: '#F3CD03',
      headerBg: '#FEF3C7',
      dot: '#E8A838',
      text: '#92400E',
      actionColor: '#D97706',
      respond: true,
    };
  }
  if (normalized.includes('accepted')) {
    return {
      cardBorder: 'transparent',
      shadow: '#000000',
      headerBg: '#E8F7EE',
      dot: '#2E9E52',
      text: '#1A6B34',
      actionColor: '#217A3C',
      respond: false,
    };
  }
  if (normalized.includes('rejected') || normalized.includes('cancelled')) {
    return {
      cardBorder: 'transparent',
      shadow: '#000000',
      headerBg: '#FEE2E2',
      dot: '#EF4444',
      text: '#EF4444',
      actionColor: '#9CA3AF',
      respond: false,
    };
  }
  return {
    cardBorder: 'transparent',
    shadow: '#000000',
    headerBg: '#F3F4F6',
    dot: '#9CA3AF',
    text: '#4B5563',
    actionColor: '#9CA3AF',
    respond: false,
  };
};

const PostCard = ({
  item,
  onPress,
}: {
  item: PostItem;
  onPress: () => void;
}) => {
  const sBadge = statusConfig(item.status);
  const sTag = tagConfig(item.status);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.card}
      activeOpacity={0.88}
    >
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.cardImage}
        resizeMode="cover"
        imageStyle={{ backgroundColor: item.fallback }}
      >
        <View style={styles.imageOverlay} />
        <View style={[styles.statusBadge, { backgroundColor: sBadge.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: sBadge.dot }]} />
          <Text style={[styles.statusText, { color: sBadge.text }]}>
            {sBadge.label}
          </Text>
        </View>
        <View style={styles.optionsBtn}>
          <AppIcon name="chevronRight" size={16} color="#FFFFFF" />
        </View>
        <View style={styles.imageBottom}>
          <Text style={styles.imageId}>{item.code}</Text>
          <Text style={styles.imageTitle} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
      </ImageBackground>

      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <Text style={styles.priceText} numberOfLines={1}>
            {item.price}
          </Text>
          <Text style={styles.millsText}>{item.secondaryText}</Text>
        </View>
        <View style={styles.tagsRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.qty}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.date}</Text>
          </View>
          <View
            style={[
              styles.tag,
              styles.statusTag,
              { backgroundColor: sTag.bg },
            ]}
          >
            <View style={[styles.tagDot, { backgroundColor: sTag.dot }]} />
            <Text
              style={[styles.tagText, { color: sTag.text, fontWeight: '700' }]}
            >
              {sTag.label}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const OfferCard = ({
  item,
  onPress,
}: {
  item: OfferItem;
  onPress: () => void;
}) => {
  const config = offerStatusConfig(item.status);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.offerListCard,
        {
          borderColor: config.cardBorder,
          shadowColor: config.shadow,
          shadowOpacity: config.respond ? 0.2 : 0.07,
        },
      ]}
      activeOpacity={0.88}
    >
      <View
        style={[styles.offerListHeader, { backgroundColor: config.headerBg }]}
      >
        <View
          style={[styles.offerStatusDot, { backgroundColor: config.dot }]}
        />
        <Text style={[styles.offerListStatus, { color: config.text }]}>
          {item.status}
        </Text>
        <View style={styles.offerRolePill}>
          <AppIcon name="business" size={11} color="#217A3C" />
          <Text style={styles.offerRoleText}>{item.role}</Text>
        </View>
        {config.respond ? (
          <View style={styles.respondPill}>
            <Text style={styles.respondPillText}>RESPOND</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.offerListBody}>
        <View style={styles.offerMainRow}>
          <View style={styles.offerLeft}>
            <Text style={styles.offerId}>{item.offerId}</Text>
            <Text style={styles.offerTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.offerMillRow}>
              <AppIcon name="business" size={10} color="#9CA3AF" />
              <Text style={styles.offerMillText} numberOfLines={1}>
                {item.mill}
              </Text>
            </View>
          </View>
          <View style={styles.offerRight}>
            <Text style={styles.offerPrice} numberOfLines={1}>
              {item.price}
            </Text>
            {item.counterPrice ? (
              <Text style={styles.offerCounterPrice} numberOfLines={1}>
                {item.counterPrice}
              </Text>
            ) : null}
            <Text style={styles.offerQty}>{item.qty}</Text>
          </View>
        </View>

        <View style={styles.offerFooterRow}>
          <Text style={styles.offerSent}>{item.sentDate}</Text>
          <View style={styles.offerActionRow}>
            <AppIcon
              name={
                item.status.toLowerCase().includes('accepted')
                  ? 'approved'
                  : 'notificationWarning'
              }
              size={12}
              color={config.actionColor}
            />
            <Text
              style={[styles.offerActionText, { color: config.actionColor }]}
            >
              {item.actionText}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const tabFromParam = (value?: string): TabKey =>
  value === 'offers' || value === 'My Offers' ? 'offers' : 'posts';

const MyPostsScreen = ({ navigation, route }: any) => {
  const mode = useAppSelector(s => s.app.mode) as AppMode;
  const isBuyer = mode === 'buyer';
  const initialTab = route?.params?.initialTab;
  const [activeTab, setActiveTab] = useState<TabKey>(tabFromParam(initialTab));
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [items, setItems] = useState<Array<PostItem | OfferItem>>([]);
  const [meta, setMeta] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(tabFromParam(initialTab));
    }
  }, [initialTab]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setItems([]);
    setMeta({});
    setHasLoadedOnce(false);
  }, [activeTab, mode]);

  const labels = useMemo(
    () => ({
      title: 'My Posts',
      subtitle: isBuyer ? 'Your demands and offers' : 'Your supplies and offers',
      postsTab: isBuyer ? 'My Demands' : 'My Supplies',
      emptyTitle: activeTab === 'offers' ? 'No offers yet' : 'No posts yet',
      emptySub:
        activeTab === 'offers'
          ? 'Offer updates will show here'
          : 'Tap New to create your first post',
    }),
    [activeTab, isBuyer],
  );

  const fetchList = useCallback(
    async (pageToLoad = 1, append = false, asRefresh = false) => {
      if (append) {
        setLoadingMore(true);
      } else if (asRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');

      const isOffersTab = activeTab === 'offers';
      const params = cleanParams({
        status,
        search: debouncedSearch.trim(),
        category_id: '',
        page: pageToLoad,
        limit: PAGE_SIZE,
        sort: 'newest',
      });

      try {
        const endpoint = isOffersTab
          ? isBuyer
            ? api.buyer.ListDemandOffers
            : api.seller.ListMyPostsOffers
          : isBuyer
          ? api.buyer.listMyDemands
          : api.seller.ListMyPosts;

        const response = await endpoint(params);
        const normalized = normalizeListPayload(
          response,
          isOffersTab
            ? ['offers', 'items', 'results']
            : ['demands', 'supplies', 'posts', 'items', 'listings', 'results'],
        );
        const mapped: Array<PostItem | OfferItem> = normalized.items.map(
          (item: any, index: number) =>
            isOffersTab
              ? normalizeOfferItem(item, index, mode)
              : normalizePostItem(item, index, mode),
        );
        const responsePage = getMetaPage(normalized.meta) || pageToLoad;

        setMeta({ ...normalized.meta, page: responsePage });
        setItems(current => {
          if (!append) {
            return mapped;
          }

          const seen = new Set(current.map(item => item.id));
          return [...current, ...mapped.filter(item => !seen.has(item.id))];
        });
        setHasLoadedOnce(true);
      } catch (err) {
        console.log('My posts load error', err);
        if ((err as { code?: string })?.code !== 'AUTH_REQUIRED') {
          setError('Unable to load posts. Pull latest again.');
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [activeTab, debouncedSearch, isBuyer, mode, status],
  );

  useFocusEffect(
    useCallback(() => {
      fetchList(1, false);
    }, [fetchList]),
  );

  const currentPage = getMetaPage(meta);
  const totalPages = getMetaTotalPages(meta, items.length);
  const hasMore = currentPage < totalPages;

  const loadMore = useCallback(() => {
    if (loading || loadingMore || refreshing || !hasMore) {
      return;
    }
    fetchList(currentPage + 1, true);
  }, [currentPage, fetchList, hasMore, loading, loadingMore, refreshing]);

  const renderItem = ({ item }: { item: PostItem | OfferItem }) =>
    activeTab === 'offers' ? (
      <OfferCard
        item={item as OfferItem}
        onPress={() =>
          navigation.navigate('OfferDetail', { offerId: item.id, mode })
        }
      />
    ) : (
      <PostCard
        item={item as PostItem}
        onPress={() =>
          navigation.navigate('PostDetail', { postId: item.id, mode })
        }
      />
    );

  return (
    <View style={styles.screen}>
      <MockStatusBar backgroundColor="#145228" textColor="#FFFFFF" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{labels.title}</Text>
          <Text style={styles.headerSub}>{labels.subtitle}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('PrePost')}
          style={styles.newButton}
          activeOpacity={0.82}
        >
          <AppIcon name="tabPost" size={16} color="#0D3B1F" />
          <Text style={styles.newButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        {[
          { key: 'posts' as TabKey, label: labels.postsTab },
          { key: 'offers' as TabKey, label: 'My Offers' },
        ].map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              activeOpacity={0.75}
            >
              <Text
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.controls}>
        <View style={styles.searchBox}>
          <AppIcon name="search" size={15} color="#9CA3AF" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search posts"
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
        </View>
        <FlatList
          horizontal
          data={STATUS_FILTERS}
          keyExtractor={item => item.value}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusFilterList}
          renderItem={({ item }) => {
            const active = status === item.value;
            return (
              <TouchableOpacity
                onPress={() => setStatus(item.value)}
                style={[
                  styles.statusFilterChip,
                  active && styles.statusFilterChipActive,
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.statusFilterText,
                    active && styles.statusFilterTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.35}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchList(1, false, true)}
            tintColor="#217A3C"
          />
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color="#217A3C" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          loading && !hasLoadedOnce ? (
            <View style={styles.empty}>
              <ActivityIndicator color="#217A3C" />
              <Text style={styles.emptyTitle}>Loading posts...</Text>
            </View>
          ) : (
            <View style={styles.empty}>
              <AppIcon
                name={error ? 'notificationWarning' : 'tabPost'}
                size={40}
                color={error ? '#D97706' : '#9CA3AF'}
              />
              <Text style={styles.emptyTitle}>
                {error || labels.emptyTitle}
              </Text>
              <Text style={styles.emptySub}>{labels.emptySub}</Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    backgroundColor: '#145228',
    paddingTop: 6,
    paddingBottom: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.53)', marginTop: 2 },
  newButton: {
    backgroundColor: '#F3CD03',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  newButtonText: { fontSize: 12, fontWeight: '700', color: '#0D3B1F' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: '#217A3C' },
  tabLabel: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
  tabLabelActive: { fontWeight: '700', color: '#1A6B34' },
  controls: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchBox: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 9,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
    paddingVertical: 0,
  },
  statusFilterList: { gap: 8, paddingRight: 14 },
  statusFilterChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 13,
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
  },
  statusFilterChipActive: {
    borderColor: '#217A3C',
    backgroundColor: '#F2FBF5',
  },
  statusFilterText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  statusFilterTextActive: { color: '#1A6B34' },
  listContent: { padding: 14, paddingBottom: 100, gap: 14 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  cardImage: { width: '100%', height: 110 },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    left: 12,
    zIndex: 3,
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 9, fontWeight: '800' },
  optionsBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 15,
    width: 32,
    height: 32,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBottom: { position: 'absolute', bottom: 10, left: 12, right: 12, zIndex: 3 },
  imageId: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.55)',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  imageTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  cardBody: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 14 },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  priceText: { flex: 1, fontSize: 14, fontWeight: '800', color: '#1A6B34' },
  millsText: { fontSize: 11, color: '#6B7280' },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    alignItems: 'center',
  },
  tag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagText: { fontSize: 11, color: '#4B5563' },
  tagDot: { width: 5, height: 5, borderRadius: 3 },
  offerListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  offerListHeader: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  offerStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    flexShrink: 0,
  },
  offerListStatus: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
  },
  offerRolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  offerRoleText: { fontSize: 9, fontWeight: '700', color: '#217A3C' },
  respondPill: {
    backgroundColor: '#F3CD03',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  respondPillText: { fontSize: 9, fontWeight: '800', color: '#0D3B1F' },
  offerListBody: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  offerMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 10,
  },
  offerLeft: { flex: 1 },
  offerId: {
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  offerTitle: { fontSize: 15, fontWeight: '800', color: '#111827' },
  offerMillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  offerMillText: { flex: 1, fontSize: 11, color: '#6B7280' },
  offerRight: { alignItems: 'flex-end', maxWidth: '46%' },
  offerPrice: { fontSize: 14, fontWeight: '900', color: '#1A6B34' },
  offerCounterPrice: {
    fontSize: 11,
    color: '#D97706',
    marginTop: 2,
    fontWeight: '700',
  },
  offerQty: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  offerFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  offerSent: { fontSize: 10, color: '#9CA3AF' },
  offerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  offerActionText: { fontSize: 11, fontWeight: '700' },
  footerLoading: { paddingVertical: 18, alignItems: 'center' },
  empty: { alignItems: 'center', paddingTop: 64, gap: 12, paddingHorizontal: 22 },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
  },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
});

export default MyPostsScreen;
