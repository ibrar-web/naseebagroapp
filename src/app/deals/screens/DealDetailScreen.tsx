import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import MockStatusBar from '../../components/MockStatusBar';
import { useAppSelector } from '../../../store';
import api from '../../../utils/api';
import SummaryTab, { DealSummaryData, Truck } from '../components/SummaryTab';
import TrucksTab from '../components/TrucksTab';
import PaymentTab, { PaymentSummaryData } from '../components/PaymentTab';

type Props = NativeStackScreenProps<RootStackParamList, 'DealDetail'>;

interface DealDetail extends DealSummaryData {
  trucks?: Truck[];
}

const TABS = ['Summary', 'Trucks', 'Payment'] as const;
type TabType = (typeof TABS)[number];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  matched: { bg: '#FFFDE6', text: '#D4AE02' },
  open: { bg: '#EEF6FF', text: '#3B82F6' },
  closed: { bg: '#F2FBF5', text: '#1A6B34' },
  cancelled: { bg: '#FEF2F2', text: '#EF4444' },
  disputed: { bg: '#FFF7ED', text: '#F97316' },
};

const formatPKR = (n: number) =>
  'PKR ' + Math.round(Number(n)).toLocaleString('en-PK');

const DealDetailScreen = ({ navigation, route }: Props) => {
  const { dealId } = route.params;
  const mode = useAppSelector(s => s.app.mode);

  const [deal, setDeal] = useState<DealDetail | null>(null);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [paymentSummary, setPaymentSummary] =
    useState<PaymentSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('Summary');

  const fetchAll = useCallback(async () => {
    try {
      const detailRes = (
        mode === 'buyer'
          ? await api.buyer.getDeal(dealId)
          : await api.seller.getDeal(dealId)
      ) as DealDetail | undefined;
      if (detailRes) setDeal(detailRes);

      if (mode === 'seller') {
        const truckRes = (await api.seller.getDealTrucks(
          dealId,
        )) as Truck[] | undefined;
        setTrucks(truckRes ?? []);
      } else {
        setTrucks(detailRes?.trucks ?? []);
      }

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

  const handleAddCompany = () => {
    Alert.prompt(
      'Company Name',
      'Enter company name for Bilti',
      async text => {
        if (!text?.trim()) return;
        try {
          await (api.buyer as any).updateDealCompany(dealId, text.trim());
          await fetchAll();
        } catch {
          Alert.alert('Error', 'Failed to update company name');
        }
      },
      'plain-text',
      deal?.buyer_company_name ?? '',
    );
  };

  const handleAddTruck = () => {
    Alert.prompt(
      'Add Truck',
      'Enter truck registration number',
      async text => {
        if (!text?.trim()) return;
        try {
          await (api.seller as any).addTruck(dealId, {
            truck_number: text.trim(),
          });
          await fetchAll();
        } catch {
          Alert.alert('Error', 'Failed to add truck');
        }
      },
      'plain-text',
    );
  };

  const handleAddPayment = () => {
    Alert.prompt(
      'Add Payment',
      'Enter payment amount (PKR)',
      async text => {
        const amount = Number(text);
        if (!text || isNaN(amount) || amount <= 0) return;
        try {
          await (api.buyer as any).addPayment(dealId, { amount });
          await fetchAll();
        } catch {
          Alert.alert('Error', 'Failed to submit payment');
        }
      },
      'plain-text',
    );
  };

  const handleContactAdmin = () => {
    Alert.alert('Contact Admin', 'Please reach out via WhatsApp or call our support team.');
  };

  const statusColor = STATUS_COLORS[deal?.status ?? ''] ?? STATUS_COLORS.matched;
  const totalLabel = mode === 'buyer' ? 'Total Amount' : 'Payable to You';
  const totalValue = deal
    ? formatPKR(
        mode === 'seller' && deal.payable_to_seller != null
          ? Number(deal.payable_to_seller)
          : Number(deal.total_amount),
      )
    : '—';

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#217A3C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MockStatusBar backgroundColor="#145228" textColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.85}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {deal?.commodity?.name ?? 'Deal'}
          </Text>
          <Text style={styles.headerCode}>
            {deal?.code ?? dealId.slice(0, 8)}
          </Text>
        </View>
        <View style={[styles.headerBadge, { backgroundColor: statusColor.bg }]}>
          <Text
            style={[styles.headerBadgeText, { color: statusColor.text }]}
          >
            {deal?.status ?? '—'}
          </Text>
        </View>
      </View>

      {/* Amount banner */}
      <View style={styles.amountBanner}>
        <Text style={styles.amountLabel}>{totalLabel}</Text>
        <Text style={styles.amountValue}>{totalValue}</Text>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TABS.map(tab => {
          const active = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabItem, active && styles.tabItemActive]}
              activeOpacity={0.75}
            >
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {tab === 'Trucks' ? `Trucks (${trucks.length})` : tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#217A3C']}
          />
        }
      >
        {activeTab === 'Summary' && deal && (
          <SummaryTab
            deal={deal}
            mode={mode}
            trucks={trucks}
            onAddCompany={handleAddCompany}
            onContactAdmin={handleContactAdmin}
          />
        )}
        {activeTab === 'Trucks' && deal && (
          <TrucksTab
            trucks={trucks}
            deal={deal}
            mode={mode}
            onAddTruck={handleAddTruck}
          />
        )}
        {activeTab === 'Payment' && (
          <PaymentTab
            paymentSummary={paymentSummary}
            mode={mode}
            onAddPayment={handleAddPayment}
          />
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: '#145228',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 14,
    paddingHorizontal: 14,
    gap: 10,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: 18, color: '#FFFFFF', lineHeight: 20 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  headerCode: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  headerBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  amountBanner: {
    backgroundColor: '#1A6B34',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
  },
  amountValue: { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: '#217A3C' },
  tabLabel: { fontSize: 12, fontWeight: '500', color: '#6B7280' },
  tabLabelActive: { fontWeight: '700', color: '#1A6B34' },
  scroll: { flex: 1 },
  scrollContent: { padding: 14 },
  bottomSpacer: { height: 40 },
});

export default DealDetailScreen;
