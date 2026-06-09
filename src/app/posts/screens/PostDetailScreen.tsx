import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { AppIcon } from '../../../assets/icons';
import MockStatusBar from '../../components/MockStatusBar';
import { useAppSelector } from '../../../store';
import api from '../../../utils/api';

type Props = NativeStackScreenProps<RootStackParamList, 'PostDetail'>;
type AppMode = 'buyer' | 'seller';
type TabType = 'Post Details' | 'Offers Received';

type PostOffer = {
  id: string;
  code: string;
  partyId: string;
  partyName: string;
  price: string;
  qty: string;
  payment: string;
  delivery: string;
  status: string;
  time: string;
  prompt?: string;
};

type PostDetail = {
  id: string;
  code: string;
  name: string;
  qty: string;
  price: string;
  status: string;
  image: string;
  fallback: string;
  details: {
    commodity: string;
    category: string;
    quantity: string;
    priceRange: string;
    deliveryCity: string;
    deliveryDate: string;
    paymentTerms: string;
    quality: string;
    notes: string;
    posted: string;
  };
  offers: PostOffer[];
};

const FALLBACK_COLORS = ['#8A9A5B', '#C29A4A', '#D8D6C7', '#DCA640'];

const firstValue = (...values: any[]) =>
  values.find(value => value !== undefined && value !== null && value !== '');

const stringify = (value: any, fallback = '') => {
  const resolved = firstValue(value);
  if (resolved === undefined) {
    return fallback;
  }
  return String(resolved);
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

const formatDateLabel = (value?: string) => {
  if (!value) {
    return 'Recently posted';
  }

  if (value.includes('ago') || value.includes('Posted')) {
    return value.replace('Posted ', '');
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
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

  if (body?.data && typeof body.data === 'object') {
    for (const key of keys) {
      if (Array.isArray(body.data?.[key])) {
        return body.data[key];
      }
    }
  }

  return [];
};

const rowValue = (
  rows: any[],
  keys: string[],
  fallback: any,
): string => {
  const match = rows.find(row =>
    keys.some(key =>
      String(firstValue(row.key, row.label, row.name) ?? '')
        .toLowerCase()
        .includes(key),
    ),
  );
  return stringify(firstValue(match?.value, fallback), 'Not provided');
};

const normalizeOffer = (item: any, index: number, mode: AppMode): PostOffer => {
  const id = stringify(
    firstValue(item.id, item.offer_id, item.negotiation_id, item.uuid),
    `${mode}-detail-offer-${index}`,
  );
  const status = titleCaseStatus(firstValue(item.status_label, item.status));

  return {
    id,
    code: stringify(firstValue(item.code, item.offer_code), id),
    partyId: stringify(
      firstValue(
        item.seller?.code,
        item.buyer?.code,
        item.seller_id,
        item.buyer_id,
      ),
      mode === 'buyer' ? 'Seller' : 'Buyer',
    ),
    partyName: stringify(
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
    payment: stringify(
      firstValue(
        item.payment_terms_label,
        item.counter_payment_terms?.label,
        item.payment_terms?.label,
        item.payment_days ? `${item.payment_days} Days` : undefined,
      ),
      'Payment not set',
    ),
    delivery: stringify(
      firstValue(
        item.delivery_terms_label,
        item.counter_delivery_terms?.label,
        item.delivery_terms?.label,
        item.delivery_days ? `${item.delivery_days} Days` : undefined,
      ),
      'Delivery not set',
    ),
    status,
    time: stringify(
      firstValue(item.time_label, item.created_at, item.updated_at),
      'Recently',
    ),
    prompt:
      status.toLowerCase().includes('awaiting') ||
      status.toLowerCase().includes('counter')
        ? 'Tap to review and respond'
        : undefined,
  };
};

const normalizePostDetail = (
  response: any,
  id: string,
  mode: AppMode,
): PostDetail | null => {
  const root =
    response?.status && response?.data ? response.data : response ?? {};
  const payload = root?.id ? root : root?.data ?? root;

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const title = stringify(
    firstValue(
      payload.title,
      payload.name,
      payload.commodity?.name,
      payload.commodity_name,
      payload.product_name,
    ),
    mode === 'buyer' ? 'Demand' : 'Supply',
  );
  const rows = findArray(payload.post_details, ['rows']).length
    ? findArray(payload.post_details, ['rows'])
    : findArray(payload.request_details, ['rows']);
  const offers = findArray(payload, [
    'offers',
    'received_offers',
    'seller_offers',
    'buyer_offers',
    'offer_items',
  ]).map((offer: any, index: number) => normalizeOffer(offer, index, mode));

  return {
    id: stringify(
      firstValue(payload.id, payload.post_id, payload.demand_id, payload.supply_id),
      id,
    ),
    code: stringify(
      firstValue(
        payload.code,
        payload.post_code,
        payload.demand_code,
        payload.supply_code,
        payload.reference_no,
      ),
      id,
    ),
    name: title,
    qty: stringify(
      firstValue(
        payload.quantity_label,
        payload.total_quantity_label,
        payload.requested_quantity_label,
        payload.available_quantity_label,
        payload.quantity,
      ),
      'Quantity not set',
    ),
    price: priceDisplay(payload),
    status: titleCaseStatus(
      firstValue(payload.status_label, payload.status, payload.badge_label),
    ),
    image:
      firstValue(
        payload.hero_image_url,
        payload.image_url,
        payload.image,
        payload.commodity?.image_url,
      ) ?? `https://placehold.co/600x400?text=${encodeURIComponent(title)}`,
    fallback: FALLBACK_COLORS[0],
    details: {
      commodity: stringify(firstValue(payload.commodity?.name, payload.commodity_name, title), title),
      category: stringify(
        firstValue(payload.commodity?.category?.name, payload.category?.name, payload.category_name),
        'Not provided',
      ),
      quantity: rowValue(
        rows,
        ['quantity', 'stock', 'available'],
        firstValue(payload.quantity_label, payload.total_quantity_label, payload.quantity),
      ),
      priceRange: rowValue(rows, ['price', 'budget'], priceDisplay(payload)),
      deliveryCity: rowValue(
        rows,
        ['city', 'location', 'pickup', 'delivery'],
        firstValue(payload.delivery_location?.label, payload.location),
      ),
      deliveryDate: rowValue(
        rows,
        ['required', 'delivery date', 'date'],
        firstValue(payload.dates?.required_by_label, payload.delivery_date),
      ),
      paymentTerms: rowValue(
        rows,
        ['payment'],
        firstValue(payload.payment_terms_label, payload.payment_terms?.label),
      ),
      quality: rowValue(
        rows,
        ['quality', 'grade', 'condition'],
        firstValue(payload.quality_label, payload.condition),
      ),
      notes: stringify(
        firstValue(
          payload.notes,
          payload.additional_notes,
          payload.seller_notes?.body,
          payload.buyer_requirements_section?.body,
        ),
        '',
      ),
      posted: formatDateLabel(
        firstValue(
          payload.dates?.posted_label,
          payload.dates?.posted_full_label,
          payload.created_at,
          payload.posted_at,
        ),
      ),
    },
    offers,
  };
};

const statusConfig = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized.includes('aging') || normalized.includes('expired')) {
    return { bg: '#D97706', text: '#FFFFFF', dot: '#FFFFFF' };
  }
  if (
    normalized.includes('inactive') ||
    normalized.includes('closed') ||
    normalized.includes('stale')
  ) {
    return { bg: '#6B7280', text: '#FFFFFF', dot: '#FFFFFF' };
  }
  return { bg: '#217A3C', text: '#FFFFFF', dot: '#FFFFFF' };
};

const sellerOfferConfig = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized.includes('awaiting') || normalized.includes('counter')) {
    return {
      bg: '#FEF3C7',
      dot: '#92400E',
      text: '#92400E',
      border: 'rgba(46,158,82,0.2)',
      footerBg: 'rgba(46,158,82,0.05)',
      footerBorder: 'rgba(46,158,82,0.13)',
    };
  }
  if (normalized.includes('rejected') || normalized.includes('cancelled')) {
    return {
      bg: '#FEE2E2',
      dot: '#EF4444',
      text: '#EF4444',
      border: '#F3F4F6',
      footerBg: '#FFFFFF',
      footerBorder: '#FFFFFF',
    };
  }
  if (normalized.includes('accepted')) {
    return {
      bg: '#E8F7EE',
      dot: '#1A6B34',
      text: '#1A6B34',
      border: '#F3F4F6',
      footerBg: '#FFFFFF',
      footerBorder: '#FFFFFF',
    };
  }
  return {
    bg: '#F3F4F6',
    dot: '#9CA3AF',
    text: '#4B5563',
    border: '#F3F4F6',
    footerBg: '#FFFFFF',
    footerBorder: '#FFFFFF',
  };
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const OfferStat = ({
  value,
  label,
  bg,
  color,
}: {
  value: string;
  label: string;
  bg: string;
  color: string;
}) => (
  <View style={[styles.offerStat, { backgroundColor: bg }]}>
    <Text style={[styles.offerStatValue, { color }]}>{value}</Text>
    <Text style={styles.offerStatLabel}>{label}</Text>
  </View>
);

const SellerOfferCard = ({
  offer,
  onPress,
}: {
  offer: PostOffer;
  onPress: () => void;
}) => {
  const config = sellerOfferConfig(offer.status);

  return (
    <TouchableOpacity
      style={[styles.sellerOfferCard, { borderColor: config.border }]}
      activeOpacity={0.88}
      onPress={onPress}
    >
      <View style={[styles.sellerOfferHeader, { backgroundColor: config.bg }]}>
        <View style={[styles.sellerOfferDot, { backgroundColor: config.dot }]} />
        <Text style={[styles.sellerOfferStatus, { color: config.text }]}>
          {offer.status}
        </Text>
        <Text style={styles.sellerOfferTime}>{formatDateLabel(offer.time)}</Text>
      </View>

      <View style={styles.sellerOfferBody}>
        <View style={styles.sellerOfferMainRow}>
          <View style={styles.sellerOfferLeft}>
            <Text style={styles.sellerOfferId}>
              {offer.partyId} - {offer.code}
            </Text>
            <Text style={styles.sellerOfferMill}>{offer.partyName}</Text>
            <Text style={styles.sellerOfferPrice}>{offer.price}</Text>
          </View>
          <View style={styles.sellerOfferRight}>
            <Text style={styles.sellerOfferQty}>{offer.qty}</Text>
            <AppIcon name="chevronRight" size={18} color="#D1D5DB" />
          </View>
        </View>

        <View style={styles.offerChipsRow}>
          <View style={styles.offerChip}>
            <AppIcon name="bank" size={10} color="#9CA3AF" />
            <Text style={styles.offerChipText}>{offer.payment}</Text>
          </View>
          <View style={styles.offerChip}>
            <AppIcon name="notificationLogistics" size={10} color="#9CA3AF" />
            <Text style={styles.offerChipText}>{offer.delivery}</Text>
          </View>
        </View>
      </View>

      {offer.prompt ? (
        <View
          style={[
            styles.sellerOfferFooter,
            {
              backgroundColor: config.footerBg,
              borderTopColor: config.footerBorder,
            },
          ]}
        >
          <AppIcon name="notificationWarning" size={12} color="#217A3C" />
          <Text style={styles.sellerOfferPrompt}>{offer.prompt}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const PostDetailScreen = ({ navigation, route }: Props) => {
  const currentMode = useAppSelector(s => s.app.mode) as AppMode;
  const mode = route.params.mode ?? currentMode;
  const isBuyer = mode === 'buyer';
  const { postId } = route.params;
  const [post, setPost] = useState<PostDetail | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('Offers Received');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'MainTabs',
            params: { screen: 'Post', params: { initialTab: 'posts' } },
          },
        ],
      }),
    );
  };

  useEffect(() => {
    let active = true;
    const loadDetail = async () => {
      setLoading(true);
      setError('');

      try {
        const response = isBuyer
          ? await api.buyer.myDemandDetails(postId)
          : await api.seller.myPostDetails(postId);
        const normalized = normalizePostDetail(response, postId, mode);
        if (active) {
          setPost(normalized);
        }
      } catch (err) {
        console.log('Post detail load error', err);
        if (active && (err as { code?: string })?.code !== 'AUTH_REQUIRED') {
          setError('Unable to load post details.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDetail();
    return () => {
      active = false;
    };
  }, [isBuyer, mode, postId]);

  const offerStats = useMemo(() => {
    const offers = post?.offers ?? [];
    return {
      total: String(offers.length),
      new: String(
        offers.filter(o => {
          const status = o.status.toLowerCase();
          return status.includes('awaiting') || status.includes('pending');
        }).length,
      ),
      accepted: String(
        offers.filter(o => o.status.toLowerCase().includes('accepted')).length,
      ),
      rejected: String(
        offers.filter(o => o.status.toLowerCase().includes('rejected')).length,
      ),
    };
  }, [post?.offers]);

  if (loading && !post) {
    return (
      <View style={styles.stateScreen}>
        <MockStatusBar backgroundColor="#F9FAFB" textColor="#111827" />
        <ActivityIndicator color="#217A3C" size="large" />
        <Text style={styles.stateText}>Loading post details...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.stateScreen}>
        <MockStatusBar backgroundColor="#F9FAFB" textColor="#111827" />
        <AppIcon name="notificationWarning" size={34} color="#D97706" />
        <Text style={styles.stateText}>
          {error || 'Post details not found.'}
        </Text>
        <TouchableOpacity
          style={styles.stateButton}
          onPress={goBack}
          activeOpacity={0.85}
        >
          <Text style={styles.stateButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const status = statusConfig(post.status);
  const detailTitle = isBuyer ? 'Demand Details' : 'Supply Details';
  const editLabel = isBuyer ? 'Edit Demand' : 'Edit Supply';
  const closeLabel = isBuyer ? 'Close Demand' : 'Close Supply';

  const renderPostDetails = () => (
    <View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{detailTitle}</Text>
        <DetailRow label="Commodity" value={post.details.commodity} />
        <DetailRow label="Category" value={post.details.category} />
        <DetailRow label="Quantity" value={post.details.quantity} />
        <DetailRow label="Price Range" value={post.details.priceRange} />
        <DetailRow label={isBuyer ? 'Delivery City' : 'Pickup City'} value={post.details.deliveryCity} />
        <DetailRow label="Delivery Date" value={post.details.deliveryDate} />
        <DetailRow label="Payment Terms" value={post.details.paymentTerms} />
        <DetailRow label="Quality" value={post.details.quality} />
        <DetailRow label="Posted" value={post.details.posted} />
      </View>

      {post.details.notes ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Additional Notes</Text>
          <Text style={styles.notesText}>{post.details.notes}</Text>
        </View>
      ) : null}
    </View>
  );

  const renderOffers = () => (
    <View>
      <View style={styles.offerStatsRow}>
        <OfferStat value={offerStats.total} label="TOTAL" bg="#F9FAFB" color="#374151" />
        <OfferStat value={offerStats.new} label="NEW" bg="#EEF6FF" color="#3B82F6" />
        <OfferStat value={offerStats.accepted} label="ACCEPTED" bg="#E8F7EE" color="#1A6B34" />
        <OfferStat value={offerStats.rejected} label="REJECTED" bg="#FEE2E2" color="#EF4444" />
      </View>

      {post.offers.length === 0 ? (
        <View style={styles.emptyState}>
          <AppIcon name="notificationOffers" size={34} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No offers yet</Text>
          <Text style={styles.emptySubtitle}>
            Offers related to this post will show here.
          </Text>
        </View>
      ) : (
        <View style={styles.sellerOfferList}>
          {post.offers.map(offer => (
            <SellerOfferCard
              key={offer.id}
              offer={offer}
              onPress={() =>
                navigation.navigate('OfferDetail', { offerId: offer.id, mode })
              }
            />
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <MockStatusBar absolute backgroundColor="transparent" textColor="#FFFFFF" />
        <ImageBackground
          source={{ uri: post.image }}
          style={styles.heroImage}
          resizeMode="cover"
          imageStyle={{ backgroundColor: post.fallback }}
        >
          <View style={styles.heroOverlay} />

          <TouchableOpacity
            onPress={goBack}
            style={styles.backBtn}
            activeOpacity={0.85}
          >
            <AppIcon name="back" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.heroRightActions}>
            <View style={[styles.heroStatusBadge, { backgroundColor: status.bg }]}>
              <View style={[styles.heroStatusDot, { backgroundColor: status.dot }]} />
              <Text style={[styles.heroStatusText, { color: status.text }]}>
                {post.status}
              </Text>
            </View>
          </View>

          <View style={styles.heroBottom}>
            <Text style={styles.heroId}>{post.code}</Text>
            <Text style={styles.heroName}>{post.name}</Text>
            <Text style={styles.heroMeta}>
              {post.qty} - {post.price}
            </Text>
          </View>
        </ImageBackground>
      </View>

      <View style={styles.tabBar}>
        {(['Post Details', 'Offers Received'] as TabType[]).map(tab => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              activeOpacity={0.75}
            >
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab === 'Offers Received'
                  ? `Offers Received (${post.offers.length})`
                  : tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'Post Details' ? renderPostDetails() : renderOffers()}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.editBtn} activeOpacity={0.85}>
          <Text style={styles.editBtnText}>{editLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeBtn} activeOpacity={0.85}>
          <Text style={styles.closeBtnText}>{closeLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  stateScreen: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 12,
  },
  stateText: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    fontWeight: '600',
  },
  stateButton: {
    marginTop: 4,
    backgroundColor: '#217A3C',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  stateButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  scroll: { flex: 1 },
  hero: { height: 180, flexShrink: 0, overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.62)',
  },
  backBtn: {
    position: 'absolute',
    top: 44,
    left: 14,
    zIndex: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRightActions: {
    position: 'absolute',
    top: 44,
    right: 14,
    zIndex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroStatusBadge: {
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroStatusDot: { width: 5, height: 5, borderRadius: 3 },
  heroStatusText: { fontSize: 10, fontWeight: '800' },
  heroBottom: { position: 'absolute', bottom: 14, left: 16, right: 16, zIndex: 3 },
  heroId: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'monospace',
    marginBottom: 3,
  },
  heroName: { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
  heroMeta: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexShrink: 0,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: '#217A3C' },
  tabLabel: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
  tabLabelActive: { fontWeight: '700', color: '#1A6B34' },
  scrollContent: { padding: 14, paddingBottom: 118 },
  offerStatsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  offerStat: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  offerStatValue: { fontSize: 18, fontWeight: '900' },
  offerStatLabel: { fontSize: 9, fontWeight: '600', color: '#9CA3AF', marginTop: 2 },
  sellerOfferList: { gap: 10 },
  sellerOfferCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  sellerOfferHeader: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  sellerOfferDot: { width: 6, height: 6, borderRadius: 3 },
  sellerOfferStatus: { flex: 1, fontSize: 10, fontWeight: '700' },
  sellerOfferTime: { fontSize: 10, color: '#9CA3AF' },
  sellerOfferBody: { paddingHorizontal: 14, paddingVertical: 12 },
  sellerOfferMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  sellerOfferLeft: { flex: 1 },
  sellerOfferId: {
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: 'monospace',
    marginBottom: 3,
  },
  sellerOfferMill: { fontSize: 13, fontWeight: '700', color: '#111827' },
  sellerOfferPrice: { fontSize: 17, fontWeight: '900', color: '#1A6B34', marginTop: 2 },
  sellerOfferRight: { alignItems: 'flex-end', gap: 4 },
  sellerOfferQty: { fontSize: 12, color: '#6B7280' },
  offerChipsRow: { flexDirection: 'row', gap: 7, flexWrap: 'wrap' },
  offerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F9FAFB',
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  offerChipText: { fontSize: 11, color: '#4B5563' },
  sellerOfferFooter: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sellerOfferPrompt: { fontSize: 11, fontWeight: '600', color: '#1A6B34' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 10 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  detailLabel: { fontSize: 12, color: '#6B7280', flex: 1 },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'right',
  },
  notesText: { fontSize: 13, color: '#4B5563', lineHeight: 20 },
  emptyState: { alignItems: 'center', paddingTop: 48, gap: 10 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#374151' },
  emptySubtitle: { fontSize: 12, color: '#9CA3AF', textAlign: 'center' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  editBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1A6B3499',
  },
  editBtnText: { fontSize: 13, fontWeight: '700', color: '#1A6B34' },
  closeBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EF444499',
  },
  closeBtnText: { fontSize: 13, fontWeight: '700', color: '#EF4444' },
});

export default PostDetailScreen;
