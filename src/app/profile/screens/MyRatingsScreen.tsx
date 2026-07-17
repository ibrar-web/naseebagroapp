import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { MockStatusBar } from '../../components';
import { AppIcon } from '../../../assets/icons';
import api from '../../../utils/api';
import { useAppSelector } from '../../../store';

type Props = NativeStackScreenProps<RootStackParamList, 'MyRatings'>;

interface RatingItem {
  id: string;
  deal_id: string;
  deal_code: string | null;
  deal_status: string | null;
  commodity_name: string | null;
  score: number;
  note: string | null;
  rater_role: string;
  created_at: string;
}

const PAGE = 20;

const StarRow = ({ score }: { score: number }) => (
  <View style={s.stars}>
    {[1, 2, 3, 4, 5].map(i => (
      <Text key={i} style={[s.star, i <= score && s.starFilled]}>★</Text>
    ))}
  </View>
);

const MyRatingsScreen = ({ navigation }: Props) => {
  const mode = useAppSelector(st => st.app.mode);

  const [items, setItems] = useState<RatingItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const fetch = useCallback(
    async (skip = 0, append = false, asRefresh = false) => {
      if (asRefresh) setRefreshing(true);
      else if (append) setLoadingMore(true);
      else setLoading(true);
      setError('');

      try {
        const res: any = await api.profile.getMyRatings({
          role: mode === 'seller' ? 'seller' : 'buyer',
          skip,
          limit: PAGE,
        });

        const data: RatingItem[] = res?.data ?? [];
        setTotal(res?.total ?? 0);
        setItems(prev => (append ? [...prev, ...data] : data));
        setHasLoadedOnce(true);
      } catch {
        setError('Unable to load. Pull to refresh.');
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [mode],
  );

  useFocusEffect(useCallback(() => { fetch(0); }, [fetch]));

  const loadMore = useCallback(() => {
    if (!loadingMore && items.length < total) {
      fetch(items.length, true);
    }
  }, [loadingMore, items.length, total, fetch]);

  const renderItem = ({ item }: { item: RatingItem }) => {
    const date = new Date(item.created_at).toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    return (
      <TouchableOpacity
        style={s.card}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate('DealDetail', { dealId: item.deal_id })
        }
      >
        <View style={s.cardHeader}>
          <View style={s.dealInfo}>
            {item.commodity_name ? (
              <Text style={s.commodity}>{item.commodity_name}</Text>
            ) : null}
            <Text style={s.dealCode}>{item.deal_code ?? 'Deal'}</Text>
          </View>
          <Text style={s.date}>{date}</Text>
        </View>

        <StarRow score={item.score} />

        {item.note ? (
          <Text style={s.note}>{item.note}</Text>
        ) : null}

        <View style={s.cardFooter}>
          <Text style={s.viewDeal}>View Deal →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={s.container}>
      <MockStatusBar />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
          activeOpacity={0.7}
        >
          <AppIcon name="back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Reviews & Ratings</Text>
        <View style={{ width: 30 }} />
      </View>

      <FlatList
        data={items}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetch(0, false, true)}
            tintColor="#217A3C"
          />
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={s.footerLoader}>
              <ActivityIndicator color="#217A3C" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          loading && !hasLoadedOnce ? (
            <View style={s.empty}>
              <ActivityIndicator color="#217A3C" />
              <Text style={s.emptyTitle}>Loading reviews...</Text>
            </View>
          ) : (
            <View style={s.empty}>
              <AppIcon
                name={error ? 'notificationWarning' : 'starOutline'}
                size={44}
                color={error ? '#D97706' : '#9CA3AF'}
              />
              <Text style={s.emptyTitle}>
                {error || 'No reviews yet'}
              </Text>
              {!error && (
                <Text style={s.emptySub}>
                  Reviews you leave after completed deals will appear here.
                </Text>
              )}
            </View>
          )
        }
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },

  list: { padding: 16, paddingBottom: 40 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  dealInfo: { flex: 1, marginRight: 8 },
  commodity: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  dealCode: { fontSize: 12, color: '#6B7280' },
  date: { fontSize: 11, color: '#9CA3AF' },

  stars: { flexDirection: 'row', marginBottom: 10 },
  star: { fontSize: 20, color: '#D1D5DB', marginRight: 2 },
  starFilled: { color: '#F59E0B' },

  note: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 19,
    marginBottom: 10,
    fontStyle: 'italic',
  },

  cardFooter: { alignItems: 'flex-end' },
  viewDeal: { fontSize: 12, color: '#217A3C', fontWeight: '600' },

  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#9CA3AF', marginTop: 6, textAlign: 'center', lineHeight: 18 },

  footerLoader: { paddingVertical: 16, alignItems: 'center' },
});

export default MyRatingsScreen;
