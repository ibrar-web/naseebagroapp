import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation/types';
import { MockStatusBar } from '../../components';
import { AppIcon } from '../../../assets/icons';
import api from '../../../utils/api';
import { useAppSelector } from '../../../store';

type Props = NativeStackScreenProps<RootStackParamList, 'DisputesQueries'>;

interface DisputeItem {
  id: string;
  code: string | null;
  type: string;
  description: string;
  status: string;
  ticket_type?: string;
  deal?: { code?: string | null; commodity?: { name: string } | null } | null;
  created_at: string;
}

interface QueryItem {
  id: string;
  code: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

const DISPUTE_STATUS_LABEL: Record<string, string> = {
  OPEN: 'Open',
  UNDER_REVIEW: 'Under Review',
  RESOLVED: 'Resolved',
};

const QUERY_STATUS_LABEL: Record<string, string> = {
  UNANSWERED: 'Open',
  ANSWERED: 'Answered',
  CLOSED: 'Closed',
};

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  'Under Review': { bg: '#FEF3C7', text: '#92400E' },
  'Open':         { bg: '#FEF3C7', text: '#92400E' },
  'Resolved':     { bg: '#D1FAE5', text: '#065F46' },
  'Answered':     { bg: '#D1FAE5', text: '#065F46' },
  'Closed':       { bg: '#F3F4F6', text: '#6B7280' },
};

const fmtDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
};

const DisputeCard = ({
  item,
  onPress,
}: {
  item: DisputeItem;
  onPress: () => void;
}) => {
  const statusLabel = DISPUTE_STATUS_LABEL[item.status] ?? item.status;
  const st = STATUS_STYLE[statusLabel] ?? STATUS_STYLE['Closed'];
  const typeLabel = item.type?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) ?? 'Dispute';

  return (
    <TouchableOpacity style={c.card} onPress={onPress} activeOpacity={0.8}>
      <View style={c.cardTop}>
        <View style={c.cardIconWrap}>
          <AppIcon name="alertTriangle" size={20} color="#EF4444" />
        </View>
        <Text style={c.cardTitle} numberOfLines={1}>{typeLabel}</Text>
        <View style={[c.badge, { backgroundColor: st.bg }]}>
          <Text style={[c.badgeText, { color: st.text }]}>{statusLabel}</Text>
        </View>
      </View>
      <Text style={c.cardDesc} numberOfLines={2}>{item.description}</Text>
      {(item.deal?.code || item.deal?.commodity?.name) && (
        <View style={c.cardMeta}>
          {item.deal?.code && <Text style={c.cardMetaCode}>{item.deal.code}</Text>}
          {item.deal?.code && item.deal?.commodity?.name && <View style={c.separator} />}
          {item.deal?.commodity?.name && <Text style={c.cardMetaBold}>{item.deal.commodity.name}</Text>}
        </View>
      )}
      <Text style={c.cardDate}>{fmtDate(item.created_at)}</Text>
    </TouchableOpacity>
  );
};

const QueryCard = ({
  item,
  onPress,
}: {
  item: QueryItem;
  onPress: () => void;
}) => {
  const statusLabel = QUERY_STATUS_LABEL[item.status] ?? item.status;
  const st = STATUS_STYLE[statusLabel] ?? STATUS_STYLE['Closed'];

  return (
    <TouchableOpacity style={c.card} onPress={onPress} activeOpacity={0.8}>
      <View style={c.cardTop}>
        <View style={c.cardIconWrap}>
          <AppIcon name="alertCircle" size={20} color="#F59E0B" />
        </View>
        <Text style={c.cardTitle} numberOfLines={1}>{item.subject}</Text>
        <View style={[c.badge, { backgroundColor: st.bg }]}>
          <Text style={[c.badgeText, { color: st.text }]}>{statusLabel}</Text>
        </View>
      </View>
      <Text style={c.cardDesc} numberOfLines={2}>{item.message}</Text>
      <Text style={c.cardDate}>{fmtDate(item.created_at)}</Text>
    </TouchableOpacity>
  );
};

const DisputesQueriesScreen = ({ navigation }: Props) => {
  const mode = useAppSelector(s => s.app.mode);
  const [activeTab, setActiveTab] = useState<'disputes' | 'queries'>('disputes');
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [queries, setQueries] = useState<QueryItem[]>([]);
  const [loadingDisputes, setLoadingDisputes] = useState(false);
  const [loadingQueries, setLoadingQueries] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDisputes = useCallback(async () => {
    try {
      const data: any =
        mode === 'buyer'
          ? await api.buyer.getDisputes()
          : await api.seller.getDisputes();
      setDisputes(Array.isArray(data) ? data : []);
    } catch {
      setDisputes([]);
    }
  }, [mode]);

  const fetchQueries = useCallback(async () => {
    try {
      const data: any = await api.queries.list();
      setQueries(Array.isArray(data) ? data : []);
    } catch {
      setQueries([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoadingDisputes(true);
      setLoadingQueries(true);
      Promise.all([
        fetchDisputes().finally(() => setLoadingDisputes(false)),
        fetchQueries().finally(() => setLoadingQueries(false)),
      ]);
    }, [fetchDisputes, fetchQueries]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchDisputes(), fetchQueries()]);
    setRefreshing(false);
  }, [fetchDisputes, fetchQueries]);

  const isLoading = activeTab === 'disputes' ? loadingDisputes : loadingQueries;

  return (
    <View style={c.container}>
      <MockStatusBar />

      <View style={c.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={c.backBtn}
          activeOpacity={0.7}
        >
          <AppIcon name="back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={c.headerTitle}>Disputes & Queries</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={c.tabs}>
        <TouchableOpacity
          style={[c.tab, activeTab === 'disputes' && c.tabActive]}
          onPress={() => setActiveTab('disputes')}
          activeOpacity={0.8}
        >
          <Text style={[c.tabText, activeTab === 'disputes' && c.tabTextActive]}>
            Disputes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[c.tab, activeTab === 'queries' && c.tabActive]}
          onPress={() => setActiveTab('queries')}
          activeOpacity={0.8}
        >
          <Text style={[c.tabText, activeTab === 'queries' && c.tabTextActive]}>
            Queries
          </Text>
        </TouchableOpacity>
      </View>

      <View style={c.listContainer}>
        {isLoading ? (
          <View style={c.center}>
            <ActivityIndicator size="large" color="#217A3C" />
          </View>
        ) : activeTab === 'disputes' ? (
          <FlatList
            data={disputes}
            keyExtractor={item => item.id}
            contentContainerStyle={c.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#217A3C']} />}
            renderItem={({ item }) => (
              <DisputeCard
                item={item}
                onPress={() => navigation.navigate('DisputeDetail', { disputeId: item.id })}
              />
            )}
            ListEmptyComponent={
              <View style={c.empty}>
                <Text style={c.emptyTitle}>No disputes found</Text>
                <Text style={c.emptySub}>Disputes you raise will appear here.</Text>
              </View>
            }
          />
        ) : (
          <FlatList
            data={queries}
            keyExtractor={item => item.id}
            contentContainerStyle={c.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#217A3C']} />}
            renderItem={({ item }) => (
              <QueryCard
                item={item}
                onPress={() => navigation.navigate('QueryChat', { queryId: item.id })}
              />
            )}
            ListEmptyComponent={
              <View style={c.empty}>
                <Text style={c.emptyTitle}>No queries yet</Text>
                <Text style={c.emptySub}>Tap the + button to send a new query.</Text>
              </View>
            }
          />
        )}
      </View>

      {activeTab === 'queries' && (
        <TouchableOpacity
          style={c.fab}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('QueryChat', {})}
        >
          <AppIcon name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const c = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: { padding: 4, borderRadius: 8 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },

  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tab: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#1A6B34' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#9CA3AF' },
  tabTextActive: { color: '#1A6B34' },

  listContainer: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 100, gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  cardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardTitle: { flex: 1, fontSize: 14, fontWeight: '800', color: '#111827' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, flexShrink: 0 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  cardDesc: { fontSize: 12, color: '#6B7280', lineHeight: 17, marginBottom: 6 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  cardMetaCode: { fontSize: 12, color: '#9CA3AF' },
  separator: { width: 1, height: 12, backgroundColor: '#D1D5DB' },
  cardMetaBold: { fontSize: 12, fontWeight: '700', color: '#374151' },
  cardDate: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },

  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 8 },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 },

  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#217A3C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2E9E52',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});

export default DisputesQueriesScreen;
