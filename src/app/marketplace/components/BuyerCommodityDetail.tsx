import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppIcon } from '../../../assets/icons';
import type { AppIconName } from '../../../assets/icons';
import { RootStackParamList } from '../../../navigation/types';
import api from '../../../utils/api';
import MockStatusBar from '../../components/MockStatusBar';

type Props = NativeStackScreenProps<RootStackParamList, 'CommodityDetail'>;

export type BuyerCommodityDetailProps = Props;

type SupplySummaryCard = {
  key: string;
  label: string;
  value: string;
  is_highlighted?: boolean;
};

type SupplyMill = {
  id: string;
  name?: string;
  city?: string;
  price_per_unit?: string;
  available_quantity?: string;
  is_cheapest?: boolean;
  is_default_selected?: boolean;
};

type SupplyDetail = {
  listing_id: string;
  code?: string;
  commodity?: {
    id?: string;
    name?: string;
    image?: string;
  };
  category?: {
    id?: string;
    name?: string;
    image?: string;
  };
  total_quantity?: {
    value?: number;
    label?: string;
  };
  mills?: {
    is_mill_based?: boolean;
    available_mills?: SupplyMill[];
  };
  payment_terms?: {
    type?: string;
    label?: string;
    days?: number;
    method?: string;
  };
  location?: {
    city?: string;
    province?: string | null;
    label?: string;
  };
  created_date?: {
    value?: string;
    label?: string;
  };
  valid_date?: {
    value?: string;
    label?: string;
    is_expired?: boolean;
  };
  pricing?: {
    starting_price?: string;
    starting_price_label?: string;
    currency?: string;
    currency_symbol?: string;
    price_range_label?: string;
  };
  favorite?: {
    can_favorite?: boolean;
    is_favorited?: boolean;
  };
  delivery_option?: {
    option?: string;
    label?: string;
    terms?: string;
  };
  supply_condition?: {
    status?: string;
    is_verified?: boolean;
    verified_label?: string;
    badge?: string | null;
    badge_label?: string | null;
  };
};

const normalizeSupplyDetail = (response: any): SupplyDetail | null => {
  const payload = response?.listing_id ? response : response?.data ?? response;
  return payload?.listing_id ? payload : null;
};

const toStr = (val: any, fallback = ''): string => {
  if (val == null) return fallback;
  if (typeof val === 'string') return val || fallback;
  if (typeof val === 'object' && typeof val.label === 'string')
    return val.label || fallback;
  return String(val) || fallback;
};

const getSummaryIcon = (key: string): AppIconName => {
  if (key.includes('price')) {
    return 'currency';
  }
  if (key.includes('payment')) {
    return 'bank';
  }
  if (key.includes('delivery')) {
    return 'notificationLogistics';
  }
  if (key.includes('stock')) {
    return 'farmSize';
  }
  if (key.includes('order')) {
    return 'document';
  }
  return 'listing';
};

const SectionCard = ({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string | null;
  icon?: AppIconName;
  children: React.ReactNode;
}) => (
  <View style={styles.card}>
    <View style={styles.sectionTitleRow}>
      {icon ? (
        <View style={styles.sectionIconBox}>
          <AppIcon name={icon} size={14} color="#217A3C" />
        </View>
      ) : null}
      <View style={styles.sectionTitleTextWrap}>
        <Text style={styles.cardTitle}>{title}</Text>
        {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
      </View>
    </View>
    {children}
  </View>
);

const SummaryCard = ({ item }: { item: SupplySummaryCard }) => {
  const highlighted = item.is_highlighted;

  return (
    <View style={[styles.infoCard, highlighted && styles.infoCardHighlight]}>
      <View
        style={[styles.infoIconBox, highlighted && styles.infoIconBoxHighlight]}
      >
        <AppIcon
          name={getSummaryIcon(item.key)}
          size={15}
          color={highlighted ? '#FFFFFF' : '#217A3C'}
        />
      </View>
      <View style={styles.infoTextWrap}>
        <Text
          style={[styles.infoValue, highlighted && styles.infoValueHighlight]}
          numberOfLines={2}
        >
          {toStr(item.value)}
        </Text>
        <Text
          style={[styles.infoLabel, highlighted && styles.infoLabelHighlight]}
          numberOfLines={1}
        >
          {toStr(item.label)}
        </Text>
      </View>
    </View>
  );
};

const DetailRow = ({
  label,
  value,
  mono,
  highlighted,
  last,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlighted?: boolean;
  last?: boolean;
}) => (
  <View style={[styles.detailRow, !last && styles.detailRowBorder]}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text
      style={[
        styles.detailValue,
        mono && styles.detailValueMono,
        highlighted && styles.detailValueHighlight,
      ]}
      numberOfLines={2}
    >
      {value}
    </Text>
  </View>
);

const MillRow = ({ item, last }: { item: SupplyMill; last?: boolean }) => {
  const featured = item.is_cheapest || item.is_default_selected;

  return (
    <View style={[styles.millRow, !last && styles.millRowBorder]}>
      <View
        style={[styles.millIconBox, featured && styles.millIconBoxFeatured]}
      >
        <AppIcon
          name="business"
          size={16}
          color={featured ? '#FFFFFF' : '#217A3C'}
        />
      </View>
      <View style={styles.millMiddle}>
        <Text style={styles.millName} numberOfLines={1}>
          {toStr(item?.name, 'Mill')}
        </Text>
        <View style={styles.millLocationRow}>
          <AppIcon name="profileCity" size={10} color="#9CA3AF" />
          <Text style={styles.millLocation} numberOfLines={1}>
            {toStr(item?.city, 'Location not available')}
          </Text>
        </View>
      </View>
      <View style={styles.millRight}>
        <Text style={styles.millPrice}>{toStr(item.price_per_unit, 'Ask')}</Text>
        <Text style={styles.millQuantity} numberOfLines={1}>
          {toStr(item.available_quantity, 'Available')}
        </Text>
      </View>
    </View>
  );
};

const BuyerCommodityDetail = ({ navigation, route }: Props) => {
  const { listingId } = route.params;
  const [detail, setDetail] = useState<SupplyDetail | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadDetail = async () => {
      setLoading(true);
      setError('');

      try {
        const response =
          await api.marketplace.public.DetailMarketSuppliesListing(listingId);
        const normalized = normalizeSupplyDetail(response);
        console.log('listing details scree:', response);
        if (active) {
          setDetail(normalized);
          setSaved(Boolean(normalized?.favorite?.is_favorited));
        }
      } catch (err) {
        console.log('Supply detail error', err);
        if (active) {
          setError('Unable to load listing details.');
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
  }, [listingId]);

  if (loading && !detail) {
    return (
      <View style={styles.stateScreen}>
        <MockStatusBar backgroundColor="#F9FAFB" textColor="#111827" />
        <ActivityIndicator color="#217A3C" size="large" />
        <Text style={styles.stateText}>Loading listing details...</Text>
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={styles.stateScreen}>
        <MockStatusBar backgroundColor="#F9FAFB" textColor="#111827" />
        <AppIcon name="notificationWarning" size={34} color="#D97706" />
        <Text style={styles.stateText}>{error || 'Listing not found.'}</Text>
        <TouchableOpacity
          style={styles.stateButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Text style={styles.stateButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const heroImage =
    detail.commodity?.image ??
    `https://placehold.co/600x400?text=${encodeURIComponent(
      detail.commodity?.name ?? 'Commodity',
    )}`;
  const badge =
    detail.supply_condition?.badge_label ?? detail.supply_condition?.badge;

  const infoCards: SupplySummaryCard[] = [
    detail.pricing?.price_range_label
      ? {
          key: 'price',
          label: 'Price',
          value: detail.pricing.price_range_label,
          is_highlighted: true,
        }
      : null,
    detail.total_quantity?.label
      ? {
          key: 'stock',
          label: 'Total Quantity',
          value: detail.total_quantity.label,
        }
      : null,
    detail.location?.label
      ? { key: 'location', label: 'Location', value: detail.location.label }
      : null,
    detail.valid_date?.label
      ? {
          key: 'valid_until',
          label: 'Valid Until',
          value: detail.valid_date.label,
        }
      : null,
  ].filter(Boolean) as SupplySummaryCard[];

  const termCards: SupplySummaryCard[] = [
    detail.payment_terms?.label
      ? {
          key: 'payment_terms',
          label: 'Payment Terms',
          value: detail.payment_terms.label,
        }
      : null,
    detail.delivery_option?.label
      ? {
          key: 'delivery_terms',
          label: 'Delivery',
          value: detail.delivery_option.label,
        }
      : null,
  ].filter(Boolean) as SupplySummaryCard[];

  const mills = detail.mills?.available_mills ?? [];

  const rows: Array<{ key: string; label: string; value: string }> = [
    detail.code
      ? { key: 'code', label: 'Listing Code', value: detail.code }
      : null,
    detail.payment_terms?.method
      ? {
          key: 'payment_method',
          label: 'Payment Method',
          value: detail.payment_terms.method,
        }
      : null,
    detail.payment_terms?.label
      ? {
          key: 'payment_terms',
          label: 'Payment Terms',
          value: detail.payment_terms.label,
        }
      : null,
    detail.delivery_option?.label
      ? {
          key: 'delivery',
          label: 'Delivery',
          value: detail.delivery_option.label,
        }
      : null,
    detail.delivery_option?.terms
      ? {
          key: 'delivery_terms',
          label: 'Delivery Terms',
          value: detail.delivery_option.terms,
        }
      : null,
    detail.created_date?.label
      ? { key: 'posted', label: 'Posted', value: detail.created_date.label }
      : null,
    detail.valid_date?.label
      ? {
          key: 'valid_until',
          label: 'Valid Until',
          value: detail.valid_date.label,
        }
      : null,
  ].filter(Boolean) as Array<{ key: string; label: string; value: string }>;

  const ctaLabel = 'Request to Purchase';

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <MockStatusBar
          absolute
          backgroundColor="transparent"
          textColor="#FFFFFF"
        />
        <ImageBackground
          source={{ uri: heroImage }}
          style={styles.heroImage}
          resizeMode="cover"
        >
          <View style={styles.heroOverlay} />
          <TouchableOpacity
            onPress={() => {
              console.log('clicking');
              navigation.goBack();
            }}
            style={styles.backBtn}
          >
            <AppIcon name="back" size={20} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSaved(current => !current)}
            style={styles.heartBtn}
            activeOpacity={0.85}
          >
            <AppIcon
              name="heart"
              size={17}
              color={saved ? '#EF4444' : '#6B7280'}
            />
          </TouchableOpacity>
          <View style={styles.heroBottom}>
            <Text style={styles.heroId}>
              {toStr(detail.code ?? detail.listing_id)}
            </Text>
            <Text style={styles.heroName} numberOfLines={1}>
              {toStr(detail.commodity?.name, 'Commodity')}
            </Text>
            <View style={styles.heroBadgeRow}>
              {badge ? (
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumBadgeText}>{badge}</Text>
                </View>
              ) : null}
              {detail.supply_condition?.is_verified ? (
                <View style={styles.verifiedRow}>
                  <AppIcon name="approved" size={11} color="#7FD4A0" />
                  <Text style={styles.verifiedText}>
                    {toStr(
                      detail.supply_condition.verified_label,
                      'Naseeb Verified',
                    )}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </ImageBackground>
      </View>

      {detail.valid_date?.is_expired ? (
        <View style={styles.warningBar}>
          <AppIcon name="notificationWarning" size={13} color="#92400E" />
          <Text style={styles.warningText}>
            <Text style={styles.warningStrong}>Listing has expired.</Text>
          </Text>
        </View>
      ) : null}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {infoCards.length ? (
          <View style={styles.infoGrid}>
            {infoCards.map(card => (
              <SummaryCard key={card.key} item={card} />
            ))}
          </View>
        ) : null}

        {termCards.length ? (
          <View style={styles.termsRow}>
            {termCards.map(card => (
              <View key={card.key} style={styles.termCard}>
                <View style={styles.termTitleRow}>
                  <AppIcon
                    name={getSummaryIcon(card.key)}
                    size={12}
                    color="#217A3C"
                  />
                  <Text style={styles.termTitle}>{toStr(card.label)}</Text>
                </View>
                <Text style={styles.termValue}>{toStr(card.value)}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <SectionCard title="Available Mills" icon="business">
          {mills.length ? (
            mills.map((mill, index) => (
              <MillRow
                key={mill.id}
                item={mill}
                last={index === mills.length - 1}
              />
            ))
          ) : (
            <Text style={styles.emptySectionText}>No mills available.</Text>
          )}
        </SectionCard>

        <SectionCard title="POST DETAILS" icon="document">
          {rows.map((row, index) => (
            <DetailRow
              key={row.key}
              label={toStr(row.label)}
              value={toStr(row.value)}
              mono={row.key.includes('id')}
              last={index === rows.length - 1}
            />
          ))}
        </SectionCard>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.purchaseBtn}
          activeOpacity={0.88}
          onPress={() =>
            navigation.navigate('RequestToPurchase', { listingId })
          }
        >
          <Text style={styles.purchaseBtnText}>{ctaLabel}</Text>
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
    paddingHorizontal: 24,
  },
  stateText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  stateButton: {
    marginTop: 18,
    backgroundColor: '#217A3C',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  stateButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  hero: { height: 220, flexShrink: 0, overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 10,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBtn: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 8,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBottom: {
    position: 'absolute',
    bottom: 14,
    left: 18,
    right: 18,
    zIndex: 2,
  },
  heroId: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '700',
    marginBottom: 4,
  },
  heroName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
  },
  premiumBadge: {
    backgroundColor: '#F3CD03',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  premiumBadgeText: { fontSize: 9, fontWeight: '800', color: '#0D3B1F' },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  verifiedText: { fontSize: 10, color: '#7FD4A0', fontWeight: '700' },
  warningBar: {
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#FCD34D',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  warningText: { fontSize: 11, color: '#92400E', flex: 1 },
  warningStrong: { fontWeight: '800' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 20 },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '47%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoCardHighlight: { backgroundColor: '#145228' },
  infoIconBox: {
    width: 32,
    height: 32,
    backgroundColor: '#F2FBF5',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoIconBoxHighlight: { backgroundColor: 'rgba(255,255,255,0.15)' },
  infoTextWrap: { flex: 1 },
  infoValue: { fontSize: 13, fontWeight: '800', color: '#111827' },
  infoValueHighlight: { color: '#FFFFFF' },
  infoLabel: { fontSize: 10, color: '#9CA3AF', marginTop: 1 },
  infoLabelHighlight: { color: 'rgba(255,255,255,0.6)' },
  termsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  termCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  termTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 5,
  },
  termTitle: { fontSize: 10, fontWeight: '700', color: '#9CA3AF' },
  termValue: { fontSize: 12, fontWeight: '800', color: '#111827' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#E8F7EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitleTextWrap: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#111827' },
  cardSubtitle: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  emptySectionText: { fontSize: 12, color: '#9CA3AF' },
  millRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    gap: 10,
  },
  millRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  millIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F2FBF5',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  millIconBoxFeatured: { backgroundColor: '#145228' },
  millMiddle: { flex: 1 },
  millName: { fontSize: 13, fontWeight: '800', color: '#111827' },
  millLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  millLocation: { fontSize: 11, color: '#6B7280', flex: 1 },
  millRight: { alignItems: 'flex-end', maxWidth: 112 },
  millPrice: { fontSize: 15, fontWeight: '900', color: '#1A6B34' },
  millQuantity: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  detailRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  detailLabel: { fontSize: 12, color: '#6B7280', flex: 1 },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'right',
    flex: 1.2,
  },
  detailValueMono: { fontFamily: 'monospace' },
  detailValueHighlight: { color: '#1A6B34', fontWeight: '900' },
  notesBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 13,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 16,
  },
  notesTitle: { fontSize: 12, fontWeight: '800', color: '#4B5563' },
  notesBody: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
    marginTop: 5,
  },
  bottomSpacer: { height: 100 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  purchaseBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#1A6B34',
  },
  purchaseBtnText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
});

export default BuyerCommodityDetail;
