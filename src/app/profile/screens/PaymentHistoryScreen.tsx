import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppIcon } from '../../../assets/icons';
import MockStatusBar from '../../components/MockStatusBar';
import api from '../../../utils/api/index';

type PaymentItem = {
  id: string;
  public_id: string;
  deal_code: string | null;
  amount: number;
  status: 'pending' | 'verified' | 'rejected';
  type: 'sent' | 'incoming';
  payment_term_type: string | null;
  commodity_name: string | null;
  created_at: string;
};

type Summary = {
  total_sent: number;
  total_received: number;
  total_transactions: number;
};

type HistoryData = {
  summary: Summary;
  items: PaymentItem[];
};

type Tab = 'all' | 'sent' | 'incoming';

const formatPKR = (amount: number): string => {
  if (amount >= 1_000_000) return `PKR ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `PKR ${(amount / 1_000).toFixed(0)}K`;
  return `PKR ${amount.toLocaleString('en-PK')}`;
};

const formatAmountFull = (amount: number): string =>
  `PKR ${amount.toLocaleString('en-PK')}`;

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: '2-digit' });
};

const GREEN_DARK = '#0D3B1F';

const PaymentHistoryScreen = ({ navigation }: any) => {
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('all');

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      console.log('[PaymentHistory] fetching...');
      const res = await api.profile.paymentHistory() as any;
      console.log('[PaymentHistory] raw response:', JSON.stringify(res?.data, null, 2));
      const d = res?.data?.data ?? res?.data;
      console.log('[PaymentHistory] parsed data:', JSON.stringify(d, null, 2));
      setData(d ?? null);
    } catch (err) {
      console.error('[PaymentHistory] error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(() => { setRefreshing(true); load(true); }, [load]);

  const filteredItems = (data?.items ?? []).filter((item) => {
    if (activeTab === 'all') return true;
    return item.type === activeTab;
  });

  const renderStatusBadge = (item: PaymentItem) => {
    if (item.status === 'verified') {
      return (
        <View style={styles.badgeGreen}>
          <Text style={styles.badgeGreenText}>✓ Verified</Text>
        </View>
      );
    }
    if (item.status === 'rejected') {
      return (
        <View style={styles.badgeRed}>
          <Text style={styles.badgeRedText}>✕ Rejected</Text>
        </View>
      );
    }
    return (
      <View style={styles.badgeYellow}>
        <Text style={styles.badgeYellowText}>⏳ Pending</Text>
      </View>
    );
  };

  const renderTypeTag = (type: 'sent' | 'incoming') => (
    <View style={[styles.typeTag, type === 'sent' ? styles.typeTagSent : styles.typeTagIncoming]}>
      <Text style={[styles.typeTagText, type === 'sent' ? styles.typeTagTextSent : styles.typeTagTextIncoming]}>
        {type === 'sent' ? '↑ Sent' : '↓ Received'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <MockStatusBar backgroundColor={GREEN_DARK} textColor="#FFFFFF" />
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <AppIcon name="back" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <View>
              <Text style={styles.title}>Payment History</Text>
              <Text style={styles.subtitle}>Your sent & received payments</Text>
            </View>
          </View>
        </View>
        <View style={styles.center}>
          <ActivityIndicator color={GREEN_DARK} size="large" />
        </View>
      </View>
    );
  }

  const summary = data?.summary;

  return (
    <View style={styles.container}>
      <MockStatusBar backgroundColor={GREEN_DARK} textColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <AppIcon name="back" size={18} color="#FFFFFF" />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Payment History</Text>
            <Text style={styles.subtitle}>Your sent & received payments</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardYellow]}>
            <Text style={[styles.statLabel, { color: '#0D3B1F' }]}>Total Sent</Text>
            <Text style={[styles.statValue, { color: '#0D3B1F' }]}>
              {formatPKR(summary?.total_sent ?? 0)}
            </Text>
          </View>
          <View style={[styles.statCard, styles.statCardDark]}>
            <Text style={[styles.statLabel, styles.statLabelDark]}>Received</Text>
            <Text style={[styles.statValue, { color: '#FFFFFF' }]}>
              {formatPKR(summary?.total_received ?? 0)}
            </Text>
          </View>
          <View style={[styles.statCard, styles.statCardDark]}>
            <Text style={[styles.statLabel, styles.statLabelDark]}>Total</Text>
            <Text style={[styles.statValue, { color: '#FFFFFF' }]}>
              {summary?.total_transactions ?? 0}
            </Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {(['all', 'sent', 'incoming'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.75}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'all' ? 'All' : tab === 'sent' ? 'Sent' : 'Received'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[GREEN_DARK]} />
        }
      >
        {filteredItems.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No payments found</Text>
          </View>
        ) : (
          filteredItems.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.cardLeft}>
                  <View style={styles.cardCodeRow}>
                    <Text style={styles.cardCode}>{item.public_id ?? '—'}</Text>
                    {item.deal_code ? (
                      <Text style={styles.cardDealCode}>{item.deal_code}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.cardAmount}>{formatAmountFull(item.amount)}</Text>
                  {item.commodity_name ? (
                    <Text style={styles.cardCommodity}>{item.commodity_name}</Text>
                  ) : null}
                </View>
                <View style={styles.cardRight}>
                  {renderStatusBadge(item)}
                  <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
                </View>
              </View>

              <View style={styles.cardBottom}>
                {renderTypeTag(item.type)}
                {item.payment_term_type ? (
                  <View style={styles.termTag}>
                    <Text style={styles.termTagText}>
                      {item.payment_term_type.toLowerCase().includes('weekly') ? 'Weekly 20%' : 'Fixed'}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  header: {
    backgroundColor: GREEN_DARK,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 44,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 10,
    padding: 8,
  },
  title: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  subtitle: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },

  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: { flex: 1, borderRadius: 10, padding: 10 },
  statCardYellow: { backgroundColor: '#F3CD03' },
  statCardDark: { backgroundColor: 'rgba(255,255,255,0.08)' },
  statLabel: { fontSize: 10, fontWeight: '500' },
  statLabelDark: { color: 'rgba(255,255,255,0.55)' },
  statValue: { fontSize: 14, fontWeight: '800', marginTop: 3 },

  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  tabActive: { backgroundColor: GREEN_DARK },
  tabText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#FFFFFF' },

  list: { flex: 1 },
  listContent: { padding: 14, paddingBottom: 30 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardLeft: { flex: 1, paddingRight: 8 },
  cardCodeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  cardCode: { fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace' },
  cardDealCode: {
    fontSize: 10,
    color: '#9CA3AF',
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  cardAmount: { fontSize: 15, fontWeight: '800', color: '#111827' },
  cardCommodity: { fontSize: 12, color: '#4B5563', marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  cardDate: { fontSize: 10, color: '#9CA3AF' },

  cardBottom: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },

  typeTag: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeTagSent: { backgroundColor: '#FEF3C7' },
  typeTagIncoming: { backgroundColor: '#E8F7EE' },
  typeTagText: { fontSize: 11, fontWeight: '700' },
  typeTagTextSent: { color: '#92400E' },
  typeTagTextIncoming: { color: '#1A6B34' },

  termTag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  termTagText: { fontSize: 10, color: '#4B5563' },

  badgeGreen: { backgroundColor: '#E8F7EE', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeGreenText: { fontSize: 11, fontWeight: '700', color: '#1A6B34' },
  badgeYellow: { backgroundColor: '#FEF3C7', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeYellowText: { fontSize: 11, fontWeight: '700', color: '#92400E' },
  badgeRed: { backgroundColor: '#FEE2E2', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeRedText: { fontSize: 11, fontWeight: '700', color: '#DC2626' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
});

export default PaymentHistoryScreen;
