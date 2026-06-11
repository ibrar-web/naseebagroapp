import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppIcon } from '../../../assets/icons';

export type AppMode = 'buyer' | 'seller';
export type TabKey = 'posts' | 'offers';

export interface PostItem {
  id: string;
  code: string;
  title: string;
  price: string;
  secondaryText: string;
  qty: string;
  date: string;
  status: string;
  commodity_image: string;
  fallback: string;
}

export interface OfferItem {
  id: string;
  offerId: string;
  title: string;
  mill: string;
  price: string;
  counterPrice?: string;
  qty: string;
  sentDate: string;
  status: string;
  statusColor: string;
  role: string;
  actionText: string;
}

export const PAGE_SIZE = 20;
const FALLBACK_COLORS = ['#8A9A5B', '#C29A4A', '#D8D6C7', '#DCA640'];

export const STATUS_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Closed', value: 'closed' },
];

export const firstValue = (...values: any[]) =>
  values.find(v => v !== undefined && v !== null && v !== '');

export const cleanParams = (params: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== '' && v !== undefined && v !== null,
    ),
  );

const stringify = (value: any, fallback = '') => {
  const resolved = firstValue(value);
  return resolved === undefined ? fallback : String(resolved);
};

const numberFrom = (value: any, fallback = 0) => {
  const parsed = Number(String(value ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const titleCaseStatus = (status?: string) => {
  const raw = stringify(status, 'Pending').replace(/_/g, ' ').trim();
  if (!raw) return 'Pending';
  return raw
    .split(' ')
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
};

const formatDateLabel = (value?: string, prefix = 'Posted') => {
  if (!value) return `${prefix} recently`;
  if (value.includes(prefix) || value.includes('ago')) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
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
  if (explicit) return String(explicit);
  const min = firstValue(item.min_price, item.price_min, item.minimum_price);
  const max = firstValue(item.max_price, item.price_max, item.maximum_price);
  if (min && max) return `PKR ${min} - ${max}`;
  if (min || max) return `PKR ${min ?? max}`;
  if (item.price) return `PKR ${item.price}`;
  return 'Ask';
};

const findArray = (body: any, keys: string[]) => {
  if (Array.isArray(body)) return body;
  for (const key of keys) {
    if (Array.isArray(body?.[key])) return body[key];
  }
  if (Array.isArray(body?.data)) return body.data;
  if (body?.data && typeof body.data === 'object') {
    for (const key of keys) {
      if (Array.isArray(body.data?.[key])) return body.data[key];
    }
  }
  return [];
};

export const normalizeListPayload = (response: any, keys: string[]) => {
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

export const getMetaPage = (meta: any) =>
  numberFrom(meta?.page ?? meta?.current_page ?? meta?.currentPage, 1);

export const getMetaTotalPages = (meta: any, itemCount: number) => {
  const totalPages = numberFrom(
    meta?.total_pages ?? meta?.totalPages ?? meta?.last_page,
    0,
  );
  if (totalPages > 0) return totalPages;
  const total = numberFrom(meta?.total, 0);
  const limit = numberFrom(meta?.limit ?? meta?.per_page, PAGE_SIZE);
  if (total > 0 && limit > 0) return Math.max(1, Math.ceil(total / limit));
  return itemCount >= PAGE_SIZE ? getMetaPage(meta) + 1 : 1;
};

export const normalizePostItem = (
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
  const commodity_image =
    firstValue(
      item.commodity_image,
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
        item.mills_count_label,
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
    commodity_image,
    fallback: FALLBACK_COLORS[index % FALLBACK_COLORS.length],
  };
};

export const normalizeOfferItem = (
  item: any,
  index: number,
  mode: AppMode,
): OfferItem => {
  const id = stringify(
    firstValue(item.id, item.offer_id, item.negotiation_id, item.uuid),
    `${mode}-offer-${index}`,
  );
  const status = titleCaseStatus(firstValue(item.status_label, item.status));
  const statusColor = stringify(item.status_color, '');
  const role = stringify(
    firstValue(item.offer_direction_label, item.role_label, item.role, item.offer_type_label),
    mode === 'buyer' ? 'Seller Offer' : 'Buyer Offer',
  );
  const millName = stringify(
    firstValue(item.mill?.name, item.seller?.business_name, item.seller?.fullName, item.buyer?.business_name, item.buyer?.fullName, item.counterparty_name),
    mode === 'buyer' ? 'Seller' : 'Buyer',
  );
  const millCity = item.mill?.city ? `, ${item.mill.city}` : '';
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
    mill: `${millName}${millCity}`,
    price: stringify(
      firstValue(
        item.offer_price_display,
        item.price_display,
        item.budget_display,
        item.price_range_display,
        item.asking_price_display,
      ),
      priceDisplay(item),
    ),
    counterPrice: firstValue(
      item.listed_price_display,
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
      firstValue(
        item.updated_label,
        item.sent_label,
        item.created_at,
        item.sent_at,
        item.updated_at,
      ),
      'Sent',
    ),
    status,
    statusColor,
    role,
    actionText: stringify(
      firstValue(item.action_label, item.next_action_label),
      (() => {
        const s = status.toLowerCase();
        if (s.includes('counter') || s.includes('awaiting'))
          return 'Counter received — respond';
        if (s.includes('accepted')) return 'View Deal →';
        return 'View detail';
      })(),
    ),
  };
};

// ─── Status helpers ───────────────────────────────────────────────────────────

export const statusConfig = (status: string) => {
  const n = status.toLowerCase();
  if (n.includes('inactive') || n.includes('closed') || n.includes('stale'))
    return { bg: '#6B7280', dot: '#FFFFFF', text: '#FFFFFF', label: 'CLOSED' };
  if (n.includes('aging') || n.includes('expired'))
    return { bg: '#D97706', dot: '#FFFFFF', text: '#FFFFFF', label: 'AGING' };
  return { bg: '#217A3C', dot: '#FFFFFF', text: '#FFFFFF', label: 'ACTIVE' };
};

export const tagConfig = (status: string) => {
  const n = status.toLowerCase();
  if (n.includes('inactive') || n.includes('closed') || n.includes('stale'))
    return { bg: '#FEE2E2', dot: '#EF4444', text: '#EF4444', label: status };
  if (n.includes('aging') || n.includes('expired'))
    return { bg: '#FEF3C7', dot: '#E8A838', text: '#92400E', label: status };
  return { bg: '#F2FBF5', dot: '#2E9E52', text: '#1A6B34', label: status };
};

export const offerStatusConfig = (status: string, statusColor = '') => {
  const n = status.toLowerCase();
  const c = statusColor.toLowerCase();
  if (c === 'blue' || n.includes('new offer') || n.includes('pending'))
    return {
      cardBorder: '#3B82F6',
      shadow: '#3B82F6',
      headerBg: '#EFF6FF',
      dot: '#3B82F6',
      text: '#1D4ED8',
      actionColor: '#3B82F6',
      respond: false,
    };
  if (n.includes('counter') || n.includes('awaiting'))
    return {
      cardBorder: '#F3CD03',
      shadow: '#F3CD03',
      headerBg: '#FEF3C7',
      dot: '#E8A838',
      text: '#92400E',
      actionColor: '#F3CD03',
      respond: true,
    };
  if (n.includes('accepted'))
    return {
      cardBorder: 'transparent',
      shadow: '#000000',
      headerBg: '#E8F7EE',
      dot: '#2E9E52',
      text: '#1A6B34',
      actionColor: '#217A3C',
      respond: false,
    };
  if (n.includes('rejected') || n.includes('cancelled'))
    return {
      cardBorder: 'transparent',
      shadow: '#000000',
      headerBg: '#FEE2E2',
      dot: '#EF4444',
      text: '#EF4444',
      actionColor: '#9CA3AF',
      respond: false,
    };
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

// ─── Card components ──────────────────────────────────────────────────────────

export const PostCard = ({
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
      style={cardStyles.card}
      activeOpacity={0.88}
    >
      <ImageBackground
        source={{ uri: item?.commodity_image }}
        style={cardStyles.cardImage}
        resizeMode="cover"
        imageStyle={{ backgroundColor: item.fallback }}
      >
        <View style={cardStyles.imageOverlay} />
        <View style={[cardStyles.statusBadge, { backgroundColor: sBadge.bg }]}>
          <View
            style={[cardStyles.statusDot, { backgroundColor: sBadge.dot }]}
          />
          <Text style={[cardStyles.statusText, { color: sBadge.text }]}>
            {sBadge.label}
          </Text>
        </View>
        <View style={cardStyles.optionsBtn}>
          <AppIcon name="chevronRight" size={16} color="#FFFFFF" />
        </View>
        <View style={cardStyles.imageBottom}>
          <Text style={cardStyles.imageId}>{item.code}</Text>
          <Text style={cardStyles.imageTitle} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
      </ImageBackground>
      <View style={cardStyles.cardBody}>
        <View style={cardStyles.cardTopRow}>
          <Text style={cardStyles.priceText} numberOfLines={1}>
            {item.price}
          </Text>
          <Text style={cardStyles.millsText}>{item.secondaryText}</Text>
        </View>
        <View style={cardStyles.tagsRow}>
          <View style={cardStyles.tag}>
            <Text style={cardStyles.tagText}>{item.qty}</Text>
          </View>
          <View style={cardStyles.tag}>
            <Text style={cardStyles.tagText}>{item.date}</Text>
          </View>
          <View
            style={[
              cardStyles.tag,
              cardStyles.statusTag,
              { backgroundColor: sTag.bg },
            ]}
          >
            <View style={[cardStyles.tagDot, { backgroundColor: sTag.dot }]} />
            <Text
              style={[
                cardStyles.tagText,
                { color: sTag.text, fontWeight: '700' },
              ]}
            >
              {sTag.label}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const OfferCard = ({
  item,
  onPress,
}: {
  item: OfferItem;
  onPress: () => void;
}) => {
  console.log('offer card :', item);
  const config = offerStatusConfig(item.status, item.statusColor);
  const isYourOffer =
    item.role.toLowerCase().includes('your') ||
    item.role.toLowerCase().includes('buyer');
  const roleEmoji = isYourOffer ? '🛒' : '📦';
  const roleLabel = isYourOffer ? 'YOUR OFFER' : item.role.toUpperCase();
  const roleLabelColor = isYourOffer ? '#3B82F6' : '#217A3C';
  const isAccepted = item.status.toLowerCase().includes('accepted');
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        cardStyles.offerListCard,
        {
          borderColor: config.cardBorder,
          shadowColor: config.shadow,
          shadowOpacity: config.respond ? 0.2 : 0.07,
        },
      ]}
      activeOpacity={0.88}
    >
      <View
        style={[
          cardStyles.offerListHeader,
          { backgroundColor: config.headerBg },
        ]}
      >
        <View
          style={[cardStyles.offerStatusDot, { backgroundColor: config.dot }]}
        />
        <Text style={[cardStyles.offerListStatus, { color: config.text }]}>
          {item.status}
        </Text>
        <View style={cardStyles.offerRolePill}>
          <Text style={cardStyles.offerRoleEmoji}>{roleEmoji}</Text>
          <Text style={[cardStyles.offerRoleText, { color: roleLabelColor }]}>
            {roleLabel}
          </Text>
        </View>
        {config.respond ? (
          <View style={cardStyles.respondPill}>
            <Text style={cardStyles.respondPillText}>RESPOND</Text>
          </View>
        ) : null}
      </View>
      <View style={cardStyles.offerListBody}>
        <View style={cardStyles.offerMainRow}>
          <View style={cardStyles.offerLeft}>
            <Text style={cardStyles.offerId}>{item.offerId}</Text>
            <Text style={cardStyles.offerTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={cardStyles.offerMillRow}>
              <AppIcon name="business" size={10} color="#9CA3AF" />
              <Text style={cardStyles.offerMillText} numberOfLines={1}>
                {item.mill}
              </Text>
            </View>
          </View>
          <View style={cardStyles.offerRight}>
            <Text style={cardStyles.offerPrice} numberOfLines={1}>
              {item.price}
            </Text>
            {item.counterPrice ? (
              <Text style={cardStyles.offerCounterPrice} numberOfLines={1}>
                {item.counterPrice.startsWith('↔')
                  ? item.counterPrice
                  : `↔ ${item.counterPrice}`}
              </Text>
            ) : null}
            <Text style={cardStyles.offerQty}>{item.qty}</Text>
          </View>
        </View>
        <View style={cardStyles.offerFooterRow}>
          <Text style={cardStyles.offerSent}>{item.sentDate}</Text>
          <View style={cardStyles.offerActionRow}>
            <AppIcon
              name={isAccepted ? 'approved' : 'chevronRight'}
              size={12}
              color={config.actionColor}
            />
            <Text
              style={[
                cardStyles.offerActionText,
                { color: config.actionColor },
              ]}
            >
              {item.actionText}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── usePostsPanel hook ───────────────────────────────────────────────────────

export interface PanelData {
  items: (PostItem | OfferItem)[];
  loading: boolean;
  loadingMore: boolean;
  refreshing: boolean;
  hasLoadedOnce: boolean;
  error: string;
  search: string;
  status: string;
  setSearch: (v: string) => void;
  setStatus: (v: string) => void;
  fetch: (
    page?: number,
    append?: boolean,
    asRefresh?: boolean,
  ) => Promise<void>;
  loadMore: () => void;
}

export const usePostsPanel = (
  fetchFn: (params: any) => Promise<any>,
  normalizeKeys: string[],
  normalizeItem: (item: any, index: number) => PostItem | OfferItem,
): PanelData => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [items, setItems] = useState<(PostItem | OfferItem)[]>([]);
  const [meta, setMeta] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [error, setError] = useState('');

  // Refs so the stable fetch callback always reads fresh values
  const debouncedSearchRef = useRef(debouncedSearch);
  debouncedSearchRef.current = debouncedSearch;
  const statusRef = useRef(status);
  statusRef.current = status;
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;
  const normalizeKeysRef = useRef(normalizeKeys);
  normalizeKeysRef.current = normalizeKeys;
  const normalizeItemRef = useRef(normalizeItem);
  normalizeItemRef.current = normalizeItem;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetch = useCallback(
    async (page = 1, append = false, asRefresh = false) => {
      if (asRefresh) setRefreshing(true);
      else if (append) setLoadingMore(true);
      else setLoading(true);
      setError('');

      const params = cleanParams({
        status: statusRef.current,
        search: debouncedSearchRef.current.trim(),
        page,
        limit: PAGE_SIZE,
        sort: 'newest',
      });
      try {
        const response = await fetchFnRef.current(params);
        console.log(
          '[usePostsPanel] API response:',
          JSON.stringify(response, null, 2),
        );
        const normalized = normalizeListPayload(
          response,
          normalizeKeysRef.current,
        );
        const mapped = normalized.items.map(normalizeItemRef.current);
        const responsePage = getMetaPage(normalized.meta) || page;
        setMeta({ ...normalized.meta, page: responsePage });
        setItems(current =>
          append
            ? [
                ...current,
                ...mapped.filter((m: any) => !current.some(x => x.id === m.id)),
              ]
            : mapped,
        );
        setHasLoadedOnce(true);
      } catch (err) {
        console.log('Panel fetch error', err);
        if ((err as any)?.code !== 'AUTH_REQUIRED') {
          setError('Unable to load. Pull to refresh.');
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [],
  ); // stable — all values accessed via refs

  // Re-fetch when search or status filter changes (skip initial mount)
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    setItems([]);
    setMeta({});
    setHasLoadedOnce(false);
    fetch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, status]);

  const currentPage = getMetaPage(meta);
  const totalPages = getMetaTotalPages(meta, items.length);
  const hasMore = currentPage < totalPages;

  const loadMore = useCallback(() => {
    if (loading || loadingMore || refreshing || !hasMore) return;
    fetch(currentPage + 1, true);
  }, [loading, loadingMore, refreshing, hasMore, currentPage, fetch]);

  return {
    items,
    loading,
    loadingMore,
    refreshing,
    hasLoadedOnce,
    error,
    search,
    status,
    setSearch,
    setStatus,
    fetch,
    loadMore,
  };
};

// ─── Shared panel + tab styles ────────────────────────────────────────────────

export const sharedStyles = StyleSheet.create({
  panel: { flex: 1 },
  panelHidden: { display: 'none' },
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
  searchInput: { flex: 1, fontSize: 13, color: '#111827', paddingVertical: 0 },
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
  footerLoading: { paddingVertical: 18, alignItems: 'center' },
  empty: {
    alignItems: 'center',
    paddingTop: 64,
    gap: 12,
    paddingHorizontal: 22,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
  },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
});

const cardStyles = StyleSheet.create({
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
  imageBottom: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
    zIndex: 3,
  },
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
  statusTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
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
  offerStatusDot: { width: 7, height: 7, borderRadius: 4, flexShrink: 0 },
  offerListStatus: { flex: 1, fontSize: 11, fontWeight: '700' },
  offerRolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  offerRoleEmoji: { fontSize: 13 },
  offerRoleText: { fontSize: 9, fontWeight: '700' },
  respondPill: {
    backgroundColor: '#F3CD03',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  respondPillText: { fontSize: 9, fontWeight: '800', color: '#0D3B1F' },
  offerListBody: { paddingHorizontal: 14, paddingVertical: 12 },
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
    color: '#F3CD03',
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
  offerActionRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  offerActionText: { fontSize: 11, fontWeight: '700' },
});
