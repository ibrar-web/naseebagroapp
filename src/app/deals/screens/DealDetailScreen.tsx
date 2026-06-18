import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ImageBackground,
  useWindowDimensions,
} from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useAppSelector } from '../../../store';
import api from '../../../utils/api';
import SummaryTab, { DealSummaryData, Truck } from '../components/SummaryTab';
import TrucksTab from '../components/TrucksTab';
import PaymentTab, { PaymentSummaryData } from '../components/PaymentTab';
import StagesTab from '../components/StagesTab';
import { MockStatusBar } from '../../components';

type Props = NativeStackScreenProps<RootStackParamList, 'DealDetail'>;

interface DealDetail extends DealSummaryData {
  trucks?: Truck[];
  current_stage?: number;
  total_stages?: number;
}

interface AddTruckData {
  truck_number: string;
  driver_name?: string;
  weight_tons?: number;
}

type RouteKey = 'summary' | 'trucks' | 'payment' | 'stages';
type TabRoute = { key: RouteKey; title: string };

const STATUS_LABEL_MAP: Record<string, string> = {
  matched: 'Deal Created',
  open: 'In Progress',
  closed: 'Complete',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
};

const formatPKR = (n: number) =>
  'PKR ' + Math.round(Number(n)).toLocaleString('en-PK');

const HEADER_HEIGHT = 140;

const DealDetailScreen = ({ navigation, route }: Props) => {
  const { dealId } = route.params;
  const mode = useAppSelector(s => s.app.mode);
  const layout = useWindowDimensions();

  const [deal, setDeal] = useState<DealDetail | null>(null);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  const fetchAll = useCallback(async () => {
    try {
      const detailRes = (
        mode === 'buyer'
          ? await api.buyer.getDeal(dealId)
          : await api.seller.getDeal(dealId)
      ) as DealDetail | undefined;
      if (detailRes) setDeal(detailRes);

      const payRes = (
        mode === 'buyer'
          ? await api.buyer.getPayments(dealId)
          : await api.seller.getDealPayments(dealId)
      ) as PaymentSummaryData | undefined;
      if (payRes) setPaymentSummary(payRes);
    } catch {
      // keep existing data
    }
  }, [dealId, mode]);

  useEffect(() => {
    setLoading(true);
    fetchAll().finally(() => setLoading(false));
  }, [fetchAll]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  }, [fetchAll]);

  const handleAddCompany = async (name: string) => {
    try {
      await api.buyer.updateDealCompany(dealId, { buyer_company_name: name });
      await fetchAll();
    } catch {
      Alert.alert('Error', 'Failed to update company name');
    }
  };

  const handleAddTruck = async (data: AddTruckData) => {
    try {
      await api.seller.addTruck(dealId, data);
      await fetchAll();
    } catch {
      Alert.alert('Error', 'Failed to add truck');
    }
  };

  const handleAddPayment = async (
    amount: number,
    receipt?: { uri: string; type: string; name: string },
  ) => {
    try {
      const form = new FormData();
      form.append('amount', String(amount));
      if (receipt) {
        form.append('file', {
          uri: receipt.uri,
          type: receipt.type,
          name: receipt.name,
        } as any);
      }
      await api.buyer.addPayment(dealId, form);
      await fetchAll();
    } catch {
      Alert.alert('Error', 'Failed to submit payment');
    }
  };

  const handleContactAdmin = () => {
    Alert.alert('Contact Admin', 'Please reach out via WhatsApp or call our support team.');
  };

  // Routes update the Trucks tab title when truck count changes
  const routes = useMemo(
    () => [
      { key: 'summary' as RouteKey, title: 'Summary' },
      { key: 'trucks' as RouteKey, title: trucks.length > 0 ? `Trucks (${trucks.length})` : 'Trucks' },
      { key: 'payment' as RouteKey, title: 'Payment' },
      { key: 'stages' as RouteKey, title: 'Stages' },
    ],
    [trucks.length],
  );

  const renderScene = ({ route: r }: { route: TabRoute }) => {
    const withRefresh = (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor="#217A3C"
        colors={['#217A3C']}
      />
    );

    switch (r.key) {
      case 'summary':
        return (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={withRefresh}
          >
            {deal ? (
              <SummaryTab
                deal={deal}
                mode={mode}
                trucks={trucks}
                onAddCompany={handleAddCompany}
                onContactAdmin={handleContactAdmin}
              />
            ) : null}
            <View style={styles.bottomSpacer} />
          </ScrollView>
        );

      case 'trucks':
        return (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={withRefresh}
          >
            {deal ? (
              <TrucksTab
                deal={deal}
                mode={mode}
                onAddTruck={handleAddTruck}
                onTrucksLoaded={loaded => setTrucks(loaded as Truck[])}
              />
            ) : null}
            <View style={styles.bottomSpacer} />
          </ScrollView>
        );

      case 'payment':
        return (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={withRefresh}
          >
            <PaymentTab
              paymentSummary={paymentSummary}
              mode={mode}
              onAddPayment={handleAddPayment}
            />
            <View style={styles.bottomSpacer} />
          </ScrollView>
        );

      case 'stages':
        return (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {deal ? <StagesTab deal={deal} mode={mode} /> : null}
            <View style={styles.bottomSpacer} />
          </ScrollView>
        );

      default:
        return null;
    }
  };

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      style={styles.tabBar}
      indicatorStyle={styles.tabIndicator}
      pressColor="rgba(33,122,60,0.08)"
      renderTabBarItem={({ route: r, focused, onPress, onLongPress, style }: any) => (
        <TouchableOpacity
          key={r.key}
          style={[style, styles.tabItem]}
          onPress={onPress}
          onLongPress={onLongPress}
          activeOpacity={0.75}
        >
          <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
            {r.title}
          </Text>
        </TouchableOpacity>
      )}
    />
  );

  const imageUri = deal?.commodity?.image_url ?? null;
  const statusLabel = STATUS_LABEL_MAP[deal?.status ?? ''] ?? deal?.status ?? '—';

  const summaryLine = [
    deal?.offer?.quantity ? `${deal.offer.quantity} bags` : null,
    deal?.total_amount ? formatPKR(Number(deal.total_amount)) : null,
    trucks.length > 0 ? `${trucks.length} truck${trucks.length !== 1 ? 's' : ''}` : null,
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
                <Text style={styles.backArrow}>←</Text>
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

      {/* Tab view with built-in tab bar */}
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
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#145228',
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
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
  backArrow: { fontSize: 18, color: '#FFFFFF', lineHeight: 20, fontWeight: '600' },

  statusBadgeWrap: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusBadgeLabel: { fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' },
  statusBadgeText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },

  heroCode: { fontSize: 9, color: '#FFFFFF', fontFamily: 'monospace', marginBottom: 2 },
  heroCommodity: { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },
  heroSummaryLine: { fontSize: 11, color: '#FFFFFF', marginTop: 2 },

  // TabBar styles (passed into <TabBar>)
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    elevation: 0,
    shadowOpacity: 0,
  },
  tabItem: { paddingVertical: 4 },
  tabIndicator: { backgroundColor: '#217A3C', height: 2.5 },
  tabLabel: { fontSize: 11, fontWeight: '500', color: '#6B7280' },
  tabLabelActive: { fontWeight: '700', color: '#1A6B34' },

  scroll: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: { padding: 14 },
  bottomSpacer: { height: 40 },
});

export default DealDetailScreen;
