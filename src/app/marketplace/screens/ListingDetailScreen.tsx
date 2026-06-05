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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppIcon } from '../../../assets/icons';
import type { AppIconName } from '../../../assets/icons';
import { RootStackParamList } from '../../../navigation/types';
import MockStatusBar from '../../components/MockStatusBar';
import api from '../../../utils/api';

type Props = NativeStackScreenProps<RootStackParamList, 'ListingDetail'>;

type HeaderStat = {
  key: string;
  label: string;
  value: string;
};

type DemandDetailRow = {
  key: string;
  label: string;
  value: string;
  is_highlighted?: boolean;
  value_color?: string;
};

type DemandMill = {
  id: string;
  mill?: {
    name?: string;
    location_label?: string;
  };
  price_display?: string;
  price_unit_label?: string;
  requested_quantity_label?: string;
};

type DemandDetail = {
  id: string;
  code?: string;
  status_label?: string;
  title?: string;
  hero_image_url?: string;
  header_stats?: HeaderStat[];
  quantity_label?: string;
  delivery_location?: {
    label?: string;
    full_label?: string;
  };
  dates?: {
    posted_label?: string;
    posted_full_label?: string;
    required_by_label?: string;
    is_expired?: boolean;
  };
  request_details?: {
    title?: string;
    icon?: string;
    rows?: DemandDetailRow[];
  };
  mills_specified_section?: {
    title?: string;
    icon?: string;
    subtitle?: string | null;
    has_mills?: boolean;
    mills?: DemandMill[];
    total_requested_label?: string;
  };
  buyer_requirements_section?: {
    title?: string;
    icon?: string;
    has_content?: boolean;
    body?: string;
  };
  actions?: {
    is_favorited?: boolean;
    primary_cta?: {
      label?: string;
    };
  };
};

const normalizeDemandDetail = (response: any): DemandDetail | null => {
  const payload = response?.id ? response : response?.data ?? response;
  return payload?.id ? payload : null;
};

const getSectionIcon = (icon?: string): AppIconName => {
  if (icon?.includes('briefcase')) {
    return 'business';
  }

  if (icon?.includes('clipboard')) {
    return 'verificationLicense';
  }

  if (icon?.includes('file')) {
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
    <View style={styles.sectionHeader}>
      {icon ? (
        <View style={styles.sectionIconBox}>
          <AppIcon name={icon} size={14} color="#217A3C" />
        </View>
      ) : null}
      <View style={styles.sectionTitleWrap}>
        <Text style={styles.cardTitle}>{title}</Text>
        {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
      </View>
    </View>
    {children}
  </View>
);

const DetailRow = ({ row, last }: { row: DemandDetailRow; last?: boolean }) => {
  const highlighted = row.is_highlighted || row.value_color === 'green';

  return (
    <View style={[styles.detailRow, !last && styles.detailRowBorder]}>
      <Text style={styles.detailLabel}>{row.label}</Text>
      <Text
        style={[
          styles.detailValue,
          row.key.includes('id') && styles.detailValueMono,
          highlighted && styles.detailValueHighlight,
        ]}
        numberOfLines={2}
      >
        {row.value}
      </Text>
    </View>
  );
};

const MillRow = ({ item, last }: { item: DemandMill; last?: boolean }) => (
  <View style={[styles.millRow, !last && styles.millRowBorder]}>
    <View style={styles.millIconBox}>
      <AppIcon name="business" size={15} color="#217A3C" />
    </View>
    <View style={styles.millMiddle}>
      <Text style={styles.millName} numberOfLines={1}>
        {item.mill?.name ?? 'Mill'}
      </Text>
      <View style={styles.millLocationRow}>
        <AppIcon name="profileCity" size={10} color="#9CA3AF" />
        <Text style={styles.millLocation} numberOfLines={1}>
          {item.mill?.location_label ?? 'Location not available'}
        </Text>
      </View>
    </View>
    <View style={styles.millRight}>
      <Text style={styles.millPrice} numberOfLines={1}>
        {item.price_display ?? 'Ask'}
        {item.price_unit_label ? (
          <Text style={styles.millPriceUnit}>{item.price_unit_label}</Text>
        ) : null}
      </Text>
      <Text style={styles.millQuantity} numberOfLines={1}>
        {item.requested_quantity_label ?? 'Requested'}
      </Text>
    </View>
  </View>
);

const ListingDetailScreen = ({ navigation, route }: Props) => {
  const { listingId } = route.params;
  const [detail, setDetail] = useState<DemandDetail | null>(null);
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
          await api.marketplace.public.DetailMarketDemandsListing(listingId);
        const normalized = normalizeDemandDetail(response);

        if (active) {
          setDetail(normalized);
          setSaved(Boolean(normalized?.actions?.is_favorited));
        }
      } catch (err) {
        console.log('Demand detail error', err);
        if (active) {
          setError('Unable to load request details.');
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

  const headerStats = useMemo(() => {
    if (detail?.header_stats?.length) {
      return detail.header_stats;
    }

    return [
      { key: 'quantity', label: 'QUANTITY', value: detail?.quantity_label },
      {
        key: 'location',
        label: 'LOCATION',
        value: detail?.delivery_location?.label,
      },
      { key: 'posted', label: 'POSTED', value: detail?.dates?.posted_label },
    ].filter((item): item is HeaderStat => Boolean(item.value));
  }, [detail]);

  if (loading && !detail) {
    return (
      <View style={styles.stateScreen}>
        <MockStatusBar backgroundColor="#F9FAFB" textColor="#111827" />
        <ActivityIndicator color="#217A3C" size="large" />
        <Text style={styles.stateText}>Loading request details...</Text>
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={styles.stateScreen}>
        <MockStatusBar backgroundColor="#F9FAFB" textColor="#111827" />
        <AppIcon name="notificationWarning" size={34} color="#D97706" />
        <Text style={styles.stateText}>
          {error || 'Request listing not found.'}
        </Text>
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
      detail.title ?? 'Demand',
    )}`;
  const requestRows = detail.request_details?.rows ?? [];
  const mills = detail.mills_specified_section?.mills ?? [];
  const hasMills =
    Boolean(detail.mills_specified_section?.has_mills) && mills.length > 0;
  const ctaLabel = detail.actions?.primary_cta?.label ?? 'Send Offer';

  return (
    <View style={styles.container}>
      <View style={styles.heroShell}>
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
            activeOpacity={0.85}
          >
            <AppIcon name="back" size={19} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSaved(current => !current)}
            style={styles.heartBtn}
            activeOpacity={0.85}
          >
            <AppIcon
              name="heart"
              size={16}
              color={saved ? '#EF4444' : '#FFFFFF'}
            />
          </TouchableOpacity>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {detail.status_label ?? 'OPEN'}
            </Text>
          </View>
          <View style={styles.heroBottom}>
            <Text style={styles.heroCode}>{detail.code ?? detail.id}</Text>
            <Text style={styles.heroTitle} numberOfLines={1}>
              {detail.title ?? 'Demand Request'}
            </Text>
          </View>
        </ImageBackground>

        {headerStats.length ? (
          <View style={styles.statsBar}>
            {headerStats.map((stat, index) => (
              <View
                key={stat.key}
                style={[styles.statItem, index > 0 && styles.statItemBorder]}
              >
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue} numberOfLines={1}>
                  {stat.value}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.protectedBox}>
          <View style={styles.protectedIconBox}>
            <AppIcon name="shield" size={17} color="#217A3C" />
          </View>
          <Text style={styles.protectedText}>
            <Text style={styles.protectedStrong}>Broker Protected</Text> - Buyer
            identity is private. All offers go through Naseeb team for review
            and negotiation.
          </Text>
        </View>

        <SectionCard
          title={detail.request_details?.title ?? 'Request Details'}
          icon={getSectionIcon(detail.request_details?.icon)}
        >
          {requestRows.length ? (
            requestRows.map((row, index) => (
              <DetailRow
                key={row.key}
                row={row}
                last={index === requestRows.length - 1}
              />
            ))
          ) : (
            <Text style={styles.emptySectionText}>
              Request details are not available.
            </Text>
          )}
        </SectionCard>

        <SectionCard
          title={
            detail.mills_specified_section?.title ?? 'Mills Specified by Buyer'
          }
          subtitle={
            detail.mills_specified_section?.subtitle ??
            detail.mills_specified_section?.total_requested_label
          }
          icon={getSectionIcon(detail.mills_specified_section?.icon)}
        >
          {hasMills ? (
            mills.map((mill, index) => (
              <MillRow
                key={mill.id}
                item={mill}
                last={index === mills.length - 1}
              />
            ))
          ) : (
            <Text style={styles.emptySectionText}>
              Buyer has not specified mills for this request.
            </Text>
          )}
        </SectionCard>

        {detail.buyer_requirements_section?.has_content &&
        detail.buyer_requirements_section.body ? (
          <SectionCard
            title={
              detail.buyer_requirements_section.title ?? 'Buyer Requirements'
            }
            icon={getSectionIcon(detail.buyer_requirements_section.icon)}
          >
            <Text style={styles.requirementsText}>
              {detail.buyer_requirements_section.body}
            </Text>
          </SectionCard>
        ) : null}

        <SectionCard title="How It Works" icon="shield">
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>
              Send your best offer for the requested commodity and quantity.
            </Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>
              Naseeb reviews the offer and coordinates buyer negotiation.
            </Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              Once accepted, the deal proceeds through the protected workflow.
            </Text>
          </View>
        </SectionCard>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.sendOfferBtn}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('SendOffer', { listingId })}
        >
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
  heroShell: { flexShrink: 0, backgroundColor: '#145228' },
  heroImage: { height: 160, width: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.48)',
  },
  backBtn: {
    position: 'absolute',
    top: 44,
    left: 16,
    zIndex: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBtn: {
    position: 'absolute',
    top: 44,
    right: 82,
    zIndex: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 44,
    right: 16,
    zIndex: 5,
    backgroundColor: '#F3CD03',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0D3B1F',
  },
  heroBottom: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    zIndex: 4,
  },
  heroCode: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '800',
    marginBottom: 3,
    fontFamily: 'monospace',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  statsBar: {
    backgroundColor: '#145228',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
  },
  statItem: { flex: 1 },
  statItemBorder: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.14)',
    paddingLeft: 12,
  },
  statLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '800',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 20 },
  protectedBox: {
    backgroundColor: '#F2FBF5',
    borderWidth: 1,
    borderColor: '#7FD4A0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  protectedIconBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#E8F7EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  protectedText: {
    flex: 1,
    fontSize: 12,
    color: '#145228',
    lineHeight: 18,
  },
  protectedStrong: { fontWeight: '900' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#E8F7EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitleWrap: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#111827' },
  cardSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 14,
  },
  detailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: { fontSize: 12, color: '#6B7280', flex: 1 },
  detailValue: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '800',
    textAlign: 'right',
    flex: 1.25,
  },
  detailValueMono: { fontFamily: 'monospace', fontSize: 11 },
  detailValueHighlight: { color: '#217A3C', fontSize: 13 },
  millRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    gap: 10,
  },
  millRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  millIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F2FBF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  millMiddle: { flex: 1, minWidth: 0 },
  millName: { fontSize: 13, fontWeight: '800', color: '#111827' },
  millLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  millLocation: { flex: 1, fontSize: 10, color: '#9CA3AF' },
  millRight: { alignItems: 'flex-end', maxWidth: 120 },
  millPrice: { fontSize: 13, fontWeight: '900', color: '#217A3C' },
  millPriceUnit: { fontSize: 10, color: '#6B7280', fontWeight: '700' },
  millQuantity: { fontSize: 10, color: '#6B7280', marginTop: 3 },
  emptySectionText: { fontSize: 12, color: '#9CA3AF', lineHeight: 18 },
  requirementsText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
    fontWeight: '600',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 8,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F3CD03',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 11,
    color: '#0D3B1F',
    fontWeight: '900',
  },
  stepText: {
    flex: 1,
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
    fontWeight: '600',
  },
  bottomSpacer: { height: 94 },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  sendOfferBtn: {
    backgroundColor: '#F3CD03',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sendOfferBtnText: { color: '#0D3B1F', fontSize: 14, fontWeight: '900' },
});

export default ListingDetailScreen;
