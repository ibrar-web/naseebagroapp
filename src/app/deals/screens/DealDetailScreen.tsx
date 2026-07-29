import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  useWindowDimensions,
} from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useAppSelector } from '../../../store';
import api from '../../../utils/api';
import SummaryTab from '../components/SummaryTab';
import TrucksTab from '../components/TrucksTab';
import PaymentTab from '../components/PaymentTab';
import StagesTab from '../components/StagesTab';
import { MockStatusBar } from '../../components';
import { AppIcon } from '../../../assets/icons';
import { getSocket } from '../../../utils/sockets';

type Props = NativeStackScreenProps<RootStackParamList, 'DealDetail'>;

interface DealHeader {
  code: string | null;
  status: string;
  total_amount: number;
  has_rated?: boolean;
  buyer_rating?: { score: number; note?: string | null; created_at?: string } | null;
  commodity?: { name: string; image_url?: string | null } | null;
  offer?: { quantity?: number; payment_term_type?: string | null } | null;
}

type RouteKey = 'summary' | 'trucks' | 'payment' | 'stages';
type TabRoute = { key: RouteKey; title: string };

const STATUS_LABEL_MAP: Record<string, string> = {
  matched: 'Deal Created',
  open: 'In Progress',
  in_progress: 'In Progress',
  closed: 'Complete',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
};

const formatPKR = (n: number) =>
  'PKR ' + Math.round(Number(n)).toLocaleString('en-PK');

const HEADER_HEIGHT = 140;

const DealDetailScreen = ({ navigation, route }: Props) => {
  const { dealId, mode: routeMode } = route.params;
  const storeMode = useAppSelector(s => s.app.mode);
  const mode = routeMode ?? storeMode;
  const layout = useWindowDimensions();

  const [deal, setDeal] = useState<DealHeader | null>(null);
  const [truckCount, setTruckCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);

  const fetchDeal = useCallback(async () => {
    try {
      const res: any =
        mode === 'buyer'
          ? await api.buyer.getDeal(dealId)
          : await api.seller.getDeal(dealId);
      if (res) setDeal(res);
    } catch {
      // keep existing
    }
  }, [dealId, mode]);

  useEffect(() => {
    setLoading(true);
    fetchDeal().finally(() => setLoading(false));
  }, [fetchDeal]);

  // Re-fetch deal header when backend changes deal status (truck added, payment verified, etc.)
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const EVENTS = [
      'deal.truck_added', 'deal.truck_delivered',
      'deal.payment_verified', 'deal.truck_doc_approved',
      'deal.updated', 'deal.completed',
    ];
    const handler = (payload: any) => {
      const eid = payload?.deal_id ?? payload?.id;
      if (!eid || eid === dealId) fetchDeal();
    };
    EVENTS.forEach(e => socket.on(e, handler));
    return () => { EVENTS.forEach(e => socket.off(e, handler)); };
  }, [dealId, fetchDeal]);

  const handleTrucksLoaded = useCallback((count: number) => {
    setTruckCount(count);
  }, []);

  const routes = useMemo<TabRoute[]>(
    () => [
      { key: 'summary', title: 'Summary' },
      { key: 'trucks', title: truckCount > 0 ? `Trucks (${truckCount})` : 'Trucks' },
      { key: 'payment', title: 'Payment' },
      { key: 'stages', title: 'Stages' },
    ],
    [truckCount],
  );

  const renderScene = useCallback(
    ({ route: r }: { route: TabRoute }) => {
      switch (r.key) {
        case 'summary':
          return <SummaryTab dealId={dealId} mode={mode} />;
        case 'trucks':
          return (
            <TrucksTab
              dealId={dealId}
              mode={mode}
              totalAmount={deal?.total_amount ?? null}
              paymentTermType={deal?.offer?.payment_term_type ?? null}
              dealStatus={deal?.status}
              onTrucksLoaded={handleTrucksLoaded}
            />
          );
        case 'payment':
          return <PaymentTab dealId={dealId} mode={mode} />;
        case 'stages':
          return <StagesTab dealId={dealId} mode={mode} />;
        default:
          return null;
      }
    },
    [dealId, mode, deal?.total_amount, deal?.offer?.payment_term_type, deal?.status, handleTrucksLoaded],
  );

  const renderTabBar = useCallback(
    (props: any) => (
      <TabBar
        {...props}
        scrollEnabled={false}
        style={styles.tabBar}
        tabStyle={styles.tabItem}
        indicatorStyle={styles.tabIndicator}
        pressColor="rgba(33,122,60,0.08)"
        activeColor="#1A6B34"
        inactiveColor="#9CA3AF"
        labelStyle={styles.tabLabel}
      />
    ),
    [],
  );

  const imageUri = deal?.commodity?.image_url ?? null;
  const statusLabel =
    STATUS_LABEL_MAP[deal?.status ?? ''] ?? deal?.status ?? '—';
  const isCompleted = deal?.status === 'closed';
  const isActive = deal?.status !== 'cancelled';

  const summaryLine = [
    deal?.offer?.quantity ? `${deal.offer.quantity} bags` : null,
    deal?.total_amount ? formatPKR(Number(deal.total_amount)) : null,
    truckCount > 0 ? `${truckCount} truck${truckCount !== 1 ? 's' : ''}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#217A3C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MockStatusBar />

      {/* Hero banner */}
      <View style={styles.heroWrap}>
        <ImageBackground
          source={imageUri ? { uri: imageUri } : undefined}
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          {!imageUri && <View style={styles.heroFallback} />}
          <View style={styles.overlay} />

          <View style={styles.heroContent}>
            <View style={styles.heroTopRow}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backBtn}
                activeOpacity={0.85}
              >
                <AppIcon name="back" size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.statusBadgeWrap}>
                <Text style={styles.statusBadgeLabel}>STATUS</Text>
                <Text style={styles.statusBadgeText}>{statusLabel}</Text>
              </View>
            </View>

            <View style={styles.heroSpacer} />

            <View>
              <Text style={styles.heroCode} numberOfLines={1}>
                {deal?.code ?? dealId.slice(0, 8)}
              </Text>
              <Text style={styles.heroCommodity} numberOfLines={1}>
                {deal?.commodity?.name ?? 'Deal'}
              </Text>
              {summaryLine ? (
                <Text style={styles.heroSummaryLine} numberOfLines={1}>
                  {summaryLine}
                </Text>
              ) : null}
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Action buttons bar */}
      {(isActive || isCompleted) && (
        <View style={styles.actionBar}>
          {isActive && (
            <TouchableOpacity
              style={styles.actionBtnOutline}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('SubmitTicket', {
                  dealId,
                  mode,
                  dealCode: deal?.code,
                  commodityName: deal?.commodity?.name,
                  dealSummary: summaryLine || null,
                  imageUrl: imageUri,
                })
              }
            >
              <AppIcon name="ticket" size={14} color="#6B7280" />
              <Text style={styles.actionBtnOutlineText}>Submit Ticket</Text>
            </TouchableOpacity>
          )}
          {isCompleted && mode === 'buyer' && (
            <TouchableOpacity
              style={[styles.actionBtnFill, deal?.has_rated && styles.actionBtnFillRated]}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('RateDeal', {
                  dealId,
                  dealCode: deal?.code,
                  commodityName: deal?.commodity?.name,
                  dealSummary: summaryLine || null,
                  existingRating: deal?.buyer_rating ?? null,
                  onRatingSubmitted: (score, note) => {
                    setDeal(prev => prev ? {
                      ...prev,
                      has_rated: true,
                      buyer_rating: { score, note: note ?? null },
                    } : prev);
                  },
                })
              }
            >
              <Text style={styles.actionBtnFillStar}>★</Text>
              <Text style={styles.actionBtnFillText}>
                {deal?.has_rated ? 'View Rating' : 'Rate Deal'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <TabView
        navigationState={{ index: tabIndex, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setTabIndex}
        initialLayout={{ width: layout.width }}
        lazy={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  heroWrap: { height: HEADER_HEIGHT, overflow: 'hidden' },
  hero: { flex: 1 },
  heroImage: { resizeMode: 'cover' },
  heroFallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#145228',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  heroContent: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroSpacer: { flex: 1 },

  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    padding: 8,
  },
  statusBadgeWrap: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusBadgeLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
  },
  statusBadgeText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },

  heroCode: {
    fontSize: 9,
    color: '#FFFFFF',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  heroCommodity: { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },
  heroSummaryLine: { fontSize: 11, color: '#FFFFFF', marginTop: 2 },

  tabBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    elevation: 0,
    shadowOpacity: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    minHeight: 44,
  },
  tabIndicator: { backgroundColor: '#217A3C', height: 2.5 },
  tabLabel: { fontSize: 11, fontWeight: '700' },

  actionBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  actionBtnOutlineText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  actionBtnFill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#145228',
  },
  actionBtnFillRated: { backgroundColor: '#4B5563' },
  actionBtnFillStar: { fontSize: 14, color: '#F3CD03' },
  actionBtnFillText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
});

export default DealDetailScreen;
