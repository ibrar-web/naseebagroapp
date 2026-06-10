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
import { RootStackParamList } from '../../../navigation/types';
import api from '../../../utils/api';
import MockStatusBar from '../../components/MockStatusBar';

type Props = NativeStackScreenProps<RootStackParamList, 'CommodityDetail'>;

type DemandMill = {
  id: string;
  mill?: {
    name?: string;
    location_label?: string;
  };
  price_display?: string;
  available_quantity_label?: string;
};

type DemandDetail = {
  id: string;
  code?: string;
  title?: string;
  hero_image_url?: string;
  status_label?: string;
  commodity?: {
    name?: string;
  };
  quantity_label?: string;
  location_label?: string;
  posted_label?: string;
  is_broker_protected?: boolean;
  broker_protection_label?: string;
  request_details?: {
    rows?: Array<{ key: string; label: string; value: string }>;
  };
  mills_section?: {
    title?: string;
    mills?: DemandMill[];
  };
  buyer_requirements?: {
    title?: string;
    body?: string;
  };
  actions?: {
    primary_cta?: {
      label?: string;
    };
  };
};

const normalizeDemandDetail = (response: any): DemandDetail | null => {
  const payload = response?.id ? response : response?.data ?? response;
  return payload?.id ? payload : null;
};

const toStr = (val: any, fallback = ''): string => {
  if (val == null) return fallback;
  if (typeof val === 'string') return val || fallback;
  if (typeof val === 'object' && typeof val.label === 'string') return val.label || fallback;
  return String(val) || fallback;
};

const MillRow = ({ item, last }: { item: DemandMill; last?: boolean }) => (
  <View style={[styles.millRow, !last && styles.millRowBorder]}>
    <View style={styles.millIconBox}>
      <AppIcon name="business" size={17} color="#217A3C" />
    </View>
    <View style={styles.millMiddle}>
      <Text style={styles.millName} numberOfLines={1}>
        {toStr(item.mill?.name, 'Mill')}
      </Text>
      <View style={styles.millLocationRow}>
        <AppIcon name="profileCity" size={10} color="#9CA3AF" />
        <Text style={styles.millLocation} numberOfLines={1}>
          {toStr(item.mill?.location_label, 'Location not available')}
        </Text>
      </View>
    </View>
    <View style={styles.millRight}>
      <Text style={styles.millPrice}>{toStr(item.price_display, 'Ask')}</Text>
      <Text style={styles.millQuantity} numberOfLines={1}>
        {toStr(item.available_quantity_label)}
      </Text>
    </View>
  </View>
);

const DetailRow = ({
  label,
  value,
  highlight,
  mono,
  last,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  mono?: boolean;
  last?: boolean;
}) => (
  <View style={[styles.detailRow, !last && styles.detailRowBorder]}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text
      style={[
        styles.detailValue,
        highlight && styles.detailValueHighlight,
        mono && styles.detailValueMono,
      ]}
      numberOfLines={2}
    >
      {value}
    </Text>
  </View>
);

const HOW_IT_WORKS = [
  'Submit your offer price, quantity & timeline',
  'Naseeb team reviews and may negotiate',
  'If approved, a deal is created for you',
];

const SellerCommodityDetail = ({ navigation, route }: Props) => {
  const { listingId } = route.params;
  const [detail, setDetail] = useState<DemandDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadDetail = async () => {
      setLoading(true);
      setError('');

      try {
        const response =
          await api.marketplace.public.DetailMarketDemandsListing(listingId);
        const normalized = normalizeDemandDetail(response);
        console.log('seller listing details screen:', response);
        if (active) {
          setDetail(normalized);
        }
      } catch (err) {
        console.log('Demand detail error', err);
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
    detail.hero_image_url ??
    `https://placehold.co/600x400?text=${encodeURIComponent(
      detail.title ?? 'Commodity',
    )}`;

  const statusLabel = detail.status_label ?? 'OPEN';
  const mills = detail.mills_section?.mills ?? [];
  const requestRows = detail.request_details?.rows ?? [];
  const ctaLabel = detail.actions?.primary_cta?.label ?? 'Send Offer';

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
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <AppIcon name="back" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{statusLabel}</Text>
          </View>

          <View style={styles.heroBottom}>
            <Text style={styles.heroId}>{toStr(detail.code ?? detail.id)}</Text>
            <Text style={styles.heroName} numberOfLines={1}>
              {toStr(detail.title ?? detail.commodity?.name, 'Commodity')}
            </Text>
          </View>
        </ImageBackground>
      </View>

      <View style={styles.metaBar}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>QUANTITY</Text>
          <Text style={styles.metaValue}>
            {toStr(detail.quantity_label, '—')}
          </Text>
        </View>
        <View style={[styles.metaItem, styles.metaItemBorder]}>
          <Text style={styles.metaLabel}>LOCATION</Text>
          <Text style={styles.metaValue}>
            {toStr(detail.location_label, '—')}
          </Text>
        </View>
        <View style={[styles.metaItem, styles.metaItemBorder]}>
          <Text style={styles.metaLabel}>POSTED</Text>
          <Text style={styles.metaValue}>
            {toStr(detail.posted_label, '—')}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brokerCard}>
          <AppIcon name="approved" size={18} color="#217A3C" />
          <Text style={styles.brokerText}>
            <Text style={styles.brokerStrong}>Broker Protected</Text>
            {' — Buyer identity is private. All offers go through Naseeb team for review and negotiation.'}
          </Text>
        </View>

        {requestRows.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconBox}>
                <AppIcon name="document" size={14} color="#217A3C" />
              </View>
              <Text style={styles.cardTitle}>Request Details</Text>
            </View>
            {requestRows.map((row, index) => (
              <DetailRow
                key={row.key}
                label={toStr(row.label)}
                value={toStr(row.value)}
                highlight={row.key.includes('price') || row.key.includes('budget')}
                mono={row.key.includes('id')}
                last={index === requestRows.length - 1}
              />
            ))}
          </View>
        )}

        {mills.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconBox}>
                <AppIcon name="business" size={14} color="#217A3C" />
              </View>
              <Text style={styles.cardTitle}>
                {toStr(detail.mills_section?.title, 'Mills Specified by Buyer')}
              </Text>
            </View>
            {mills.map((mill, index) => (
              <MillRow
                key={mill.id}
                item={mill}
                last={index === mills.length - 1}
              />
            ))}
          </View>
        )}

        {detail.buyer_requirements?.body ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBox, styles.cardIconBoxYellow]}>
                <AppIcon name="document" size={14} color="#D4AE02" />
              </View>
              <Text style={styles.cardTitle}>
                {toStr(detail.buyer_requirements.title, 'Buyer Requirements')}
              </Text>
            </View>
            <View style={styles.notesBox}>
              <Text style={styles.notesBody}>
                {toStr(detail.buyer_requirements.body)}
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.howItWorksTitle}>How It Works</Text>
          {HOW_IT_WORKS.map((step, index) => (
            <View
              key={index}
              style={[
                styles.stepRow,
                index < HOW_IT_WORKS.length - 1 && styles.stepRowGap,
              ]}
            >
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.sendOfferBtn}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('SendOffer', { listingId })}
        >
          <AppIcon name="notificationLogistics" size={17} color="#0D3B1F" />
          <Text style={styles.sendOfferBtnText}>{ctaLabel}</Text>
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
  hero: { height: 160, flexShrink: 0, overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  backBtn: {
    position: 'absolute',
    top: 44,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    padding: 8,
  },
  statusBadge: {
    position: 'absolute',
    top: 44,
    right: 16,
    zIndex: 10,
    backgroundColor: '#F3CD03',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  statusBadgeText: { fontSize: 10, fontWeight: '800', color: '#0D3B1F' },
  heroBottom: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    zIndex: 2,
  },
  heroId: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '700',
    marginBottom: 3,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  metaBar: {
    backgroundColor: '#145228',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    flexShrink: 0,
  },
  metaItem: { flex: 1, paddingLeft: 0 },
  metaItemBorder: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.13)',
    paddingLeft: 12,
  },
  metaLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 2,
    fontWeight: '600',
  },
  metaValue: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 20 },
  brokerCard: {
    backgroundColor: '#F2FBF5',
    borderWidth: 1,
    borderColor: '#7FD4A0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brokerText: { fontSize: 12, color: '#145228', lineHeight: 18, flex: 1 },
  brokerStrong: { fontWeight: '800' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardIconBox: {
    width: 28,
    height: 28,
    backgroundColor: '#E8F7EE',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconBoxYellow: { backgroundColor: '#FFFDE6' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 9,
  },
  detailRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  detailLabel: { fontSize: 12, color: '#6B7280', flex: 1 },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'right',
    flex: 1.2,
  },
  detailValueHighlight: { fontSize: 13, fontWeight: '800', color: '#1A6B34' },
  detailValueMono: { fontFamily: 'monospace' },
  millRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  millRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  millIconBox: {
    width: 38,
    height: 38,
    backgroundColor: '#F2FBF5',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  millMiddle: { flex: 1 },
  millName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  millLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  millLocation: { fontSize: 11, color: '#6B7280', flex: 1 },
  millRight: { alignItems: 'flex-end' },
  millPrice: { fontSize: 15, fontWeight: '900', color: '#1A6B34' },
  millQuantity: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  notesBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
  },
  notesBody: { fontSize: 13, color: '#374151', lineHeight: 21 },
  howItWorksTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepRowGap: { marginBottom: 12 },
  stepNumber: {
    width: 32,
    height: 32,
    backgroundColor: '#145228',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumberText: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
    paddingTop: 6,
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
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  sendOfferBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F3CD03',
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: '#F3CD03',
    shadowOpacity: 0.33,
    shadowRadius: 12,
    elevation: 4,
  },
  sendOfferBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0D3B1F',
  },
});

export default SellerCommodityDetail;
