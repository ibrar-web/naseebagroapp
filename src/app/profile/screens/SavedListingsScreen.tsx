import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../../../assets/icons';
import api from '../../../utils/api';

type SavedListing = {
  id: string;
  listing_id: string;
  saved_at: string;
  listing: {
    id: string;
    code: string | null;
    post_type?: string;
    badge?: string | null;
    price_per_unit?: number | null;
    location?: string | null;
    status?: string;
    commodity?: {
      id?: string;
      name?: string;
      image_url?: string | null;
    } | null;
  } | null;
};

const SavedListingCard = ({
  item,
  onPress,
}: {
  item: SavedListing;
  onPress: () => void;
}) => {
  const name = item.listing?.commodity?.name ?? 'Listing';
  const code = item.listing?.code ?? item.listing_id.slice(0, 8).toUpperCase();
  const price = item.listing?.price_per_unit;
  const location = item.listing?.location;
  const status = item.listing?.status;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <View style={styles.cardIconBox}>
        <AppIcon name="listing" size={26} color="#1A6B34" />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>{name}</Text>
        <Text style={styles.cardCode} numberOfLines={1}>{code}</Text>
        {location ? (
          <View style={styles.cardLocationRow}>
            <AppIcon name="profileCity" size={10} color="#9CA3AF" />
            <Text style={styles.cardLocation} numberOfLines={1}>{location}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.cardRight}>
        {price != null ? (
          <Text style={styles.cardPrice}>Rs {price.toLocaleString()}</Text>
        ) : null}
        {status ? (
          <View style={[styles.statusBadge, status === 'approved' && styles.statusApproved]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        ) : null}
        <AppIcon name="heart" size={16} color="#EF4444" />
      </View>
    </TouchableOpacity>
  );
};

const SavedListingsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<SavedListing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchSaved = useCallback(async () => {
    setError('');
    try {
      const res: any = await api.profile.savedListings({ limit: 50, offset: 0 });
      const data = res?.data ?? res;
      setItems(data?.items ?? []);
      setTotal(data?.total ?? 0);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load saved listings.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchSaved(); }, [fetchSaved]);

  const onRefresh = () => { setRefreshing(true); fetchSaved(); };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#145228" translucent={false} />
      <View style={{ height: insets.top, backgroundColor: '#145228' }} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.75}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <AppIcon name="back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Saved Listings</Text>
          <Text style={styles.headerSubtitle}>
            {loading ? 'Loading...' : `${total} saved`}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator color="#217A3C" size="large" />
        </View>
      ) : error ? (
        <View style={styles.centerWrap}>
          <AppIcon name="notificationWarning" size={34} color="#D97706" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchSaved} activeOpacity={0.85}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconBox}>
            <AppIcon name="savedEmpty" size={54} color="#45B86A" />
          </View>
          <Text style={styles.emptyTitle}>No saved listings</Text>
          <Text style={styles.emptyBody}>
            Browse the marketplace and save listings you are interested in.
          </Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Market' })}
            activeOpacity={0.85}
          >
            <Text style={styles.browseBtnText}>Browse Marketplace</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#217A3C" />
          }
          renderItem={({ item }) => (
            <SavedListingCard
              item={item}
              onPress={() =>
                navigation.navigate('CommodityDetail', { listingId: item.listing_id })
              }
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    backgroundColor: '#145228',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 13, color: '#6B7280', textAlign: 'center', paddingHorizontal: 32 },
  retryBtn: {
    backgroundColor: '#217A3C',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  emptyWrap: { flex: 1, alignItems: 'center', paddingHorizontal: 32, paddingTop: 60 },
  emptyIconBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F7EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#111827', textAlign: 'center' },
  emptyBody: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 21,
  },
  browseBtn: {
    marginTop: 24,
    backgroundColor: '#1A6B34',
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  browseBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  listContent: { padding: 16, paddingBottom: 48 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E8F7EE',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardBody: { flex: 1 },
  cardName: { fontSize: 14, fontWeight: '800', color: '#111827' },
  cardCode: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  cardLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  cardLocation: { fontSize: 11, color: '#6B7280', flex: 1 },
  cardRight: { alignItems: 'flex-end', gap: 4, flexShrink: 0 },
  cardPrice: { fontSize: 13, fontWeight: '900', color: '#1A6B34' },
  statusBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusApproved: { backgroundColor: '#DCFCE7' },
  statusText: { fontSize: 9, fontWeight: '700', color: '#374151', textTransform: 'capitalize' },
});

export default SavedListingsScreen;
