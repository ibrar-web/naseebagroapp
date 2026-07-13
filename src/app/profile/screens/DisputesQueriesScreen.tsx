import React, { useState, useCallback, useEffect } from 'react';
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

type Props = NativeStackScreenProps<RootStackParamList, 'DisputesQueries'>;

type Status = 'Under Review' | 'Resolved' | 'Open' | 'Closed';

interface DisputeItem {
  id: string;
  type: 'Quality Mismatch' | 'Quality Dispute' | 'Quantity Shortage' | 'Delayed Delivery' | string;
  description: string;
  status: Status;
  dealCode?: string;
  commodityName?: string;
  createdAt: string;
}

interface QueryItem {
  id: string;
  subject: string;
  lastMessage: string;
  status: Status;
  createdAt: string;
  unread?: number;
}

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  'Under Review': { bg: '#FEF3C7', text: '#92400E' },
  'Open':         { bg: '#FEF3C7', text: '#92400E' },
  'Resolved':     { bg: '#D1FAE5', text: '#065F46' },
  'Closed':       { bg: '#F3F4F6', text: '#6B7280' },
};

const MOCK_DISPUTES: DisputeItem[] = [
  {
    id: 'd1',
    type: 'Quality Mismatch',
    description: 'Buyer received 180 bags, expected 200. Shortfall of 20 bags worth Rs38,000.',
    status: 'Under Review',
    dealCode: 'Deal - 001',
    commodityName: 'Basmati Rice',
    createdAt: '2024-03-12',
  },
  {
    id: 'd2',
    type: 'Quality Dispute',
    description: 'Buyer received 180 bags, expected 200. Shortfall of 20 bags worth Rs38,000.',
    status: 'Resolved',
    createdAt: '2024-03-08',
  },
  {
    id: 'd3',
    type: 'Quality Mismatch',
    description: 'Buyer received 180 bags, expected 200. Shortfall of 20 bags worth Rs38,000.',
    status: 'Under Review',
    dealCode: 'Deal - 001',
    commodityName: 'Basmati Rice',
    createdAt: '2024-03-05',
  },
  {
    id: 'd4',
    type: 'Quality Dispute',
    description: 'Buyer received 180 bags, expected 200. Shortfall of 20 bags worth Rs38,000.',
    status: 'Resolved',
    createdAt: '2024-02-28',
  },
];

const MOCK_QUERIES: QueryItem[] = [
  {
    id: 'q1',
    subject: 'Quality Mismatch',
    lastMessage: 'Buyer received 180 bags, expected 200. Shortfall of 20 bags worth Rs38,000.',
    status: 'Under Review',
    createdAt: '2024-03-12',
    unread: 2,
  },
  {
    id: 'q2',
    subject: 'Quality Dispute',
    lastMessage: 'Buyer received 180 bags, expected 200. Shortfall of 20 bags worth Rs38,000.',
    status: 'Resolved',
    createdAt: '2024-03-08',
  },
  {
    id: 'q3',
    subject: 'Quality Mismatch',
    lastMessage: 'Buyer received 180 bags, expected 200. Shortfall of 20 bags worth Rs38,000.',
    status: 'Under Review',
    createdAt: '2024-03-05',
    unread: 1,
  },
  {
    id: 'q4',
    subject: 'Quality Dispute',
    lastMessage: 'Buyer received 180 bags, expected 200. Shortfall of 20 bags worth Rs38,000.',
    status: 'Resolved',
    createdAt: '2024-02-28',
  },
];

const DisputeCard = ({
  item,
  onPress,
}: {
  item: DisputeItem;
  onPress: () => void;
}) => {
  const st = STATUS_STYLE[item.status] ?? STATUS_STYLE['Closed'];
  const isMismatch = item.type.toLowerCase().includes('mismatch');

  return (
    <TouchableOpacity style={c.card} onPress={onPress} activeOpacity={0.8}>
      <View style={c.cardTop}>
        <View style={c.cardIconWrap}>
          <AppIcon
            name={isMismatch ? 'alertTriangle' : 'alertCircle'}
            size={20}
            color={isMismatch ? '#EF4444' : '#F59E0B'}
          />
        </View>
        <Text style={c.cardTitle} numberOfLines={1}>
          {item.type}
        </Text>
        <View style={[c.badge, { backgroundColor: st.bg }]}>
          <Text style={[c.badgeText, { color: st.text }]}>{item.status}</Text>
        </View>
      </View>
      <Text style={c.cardDesc} numberOfLines={2}>
        {item.description}
      </Text>
      {(item.dealCode || item.commodityName) && (
        <View style={c.cardMeta}>
          {item.dealCode && (
            <Text style={c.cardMetaCode}>{item.dealCode}</Text>
          )}
          {item.dealCode && item.commodityName && (
            <View style={c.separator} />
          )}
          {item.commodityName && (
            <Text style={c.cardMetaBold}>{item.commodityName}</Text>
          )}
        </View>
      )}
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
  const st = STATUS_STYLE[item.status] ?? STATUS_STYLE['Closed'];
  const isMismatch = item.subject.toLowerCase().includes('mismatch');

  return (
    <TouchableOpacity style={c.card} onPress={onPress} activeOpacity={0.8}>
      <View style={c.cardTop}>
        <View style={c.cardIconWrap}>
          <AppIcon
            name={isMismatch ? 'alertTriangle' : 'alertCircle'}
            size={20}
            color={isMismatch ? '#EF4444' : '#F59E0B'}
          />
        </View>
        <Text style={c.cardTitle} numberOfLines={1}>
          {item.subject}
        </Text>
        <View style={[c.badge, { backgroundColor: st.bg }]}>
          <Text style={[c.badgeText, { color: st.text }]}>{item.status}</Text>
        </View>
        {(item.unread ?? 0) > 0 && (
          <View style={c.unreadDot}>
            <Text style={c.unreadText}>{item.unread}</Text>
          </View>
        )}
      </View>
      <Text style={c.cardDesc} numberOfLines={2}>
        {item.lastMessage}
      </Text>
    </TouchableOpacity>
  );
};

const DisputesQueriesScreen = ({ navigation }: Props) => {
  const [activeTab, setActiveTab] = useState<'disputes' | 'queries'>('disputes');
  const [loading, setLoading] = useState(false);

  const disputes = MOCK_DISPUTES;
  const queries = MOCK_QUERIES;

  return (
    <View style={c.container}>
      <MockStatusBar />

      {/* Header */}
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

      {/* Tabs */}
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

      {/* Lists */}
      <View style={c.listContainer}>
        {activeTab === 'disputes' ? (
          <FlatList
            data={disputes}
            keyExtractor={item => item.id}
            contentContainerStyle={c.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <DisputeCard
                item={item}
                onPress={() =>
                  navigation.navigate('DisputeDetail', { disputeId: item.id })
                }
              />
            )}
            ListEmptyComponent={
              <View style={c.empty}>
                <Text style={c.emptyTitle}>No disputes found</Text>
                <Text style={c.emptySub}>
                  Disputes you raise will appear here.
                </Text>
              </View>
            }
          />
        ) : (
          <FlatList
            data={queries}
            keyExtractor={item => item.id}
            contentContainerStyle={c.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <QueryCard
                item={item}
                onPress={() =>
                  navigation.navigate('QueryChat', { queryId: item.id })
                }
              />
            )}
            ListEmptyComponent={
              <View style={c.empty}>
                <Text style={c.emptyTitle}>No queries yet</Text>
                <Text style={c.emptySub}>
                  Tap the + button to send a new query.
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* Floating + button (queries tab only) */}
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
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    flexShrink: 0,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  unreadDot: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  unreadText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },
  cardDesc: { fontSize: 12, color: '#6B7280', lineHeight: 17, marginBottom: 8 },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  cardMetaCode: { fontSize: 12, color: '#9CA3AF' },
  separator: {
    width: 1,
    height: 12,
    backgroundColor: '#D1D5DB',
  },
  cardMetaBold: { fontSize: 12, fontWeight: '700', color: '#374151' },

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
