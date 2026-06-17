import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { useAppSelector } from '../../../store';
import { useTranslation } from '../../../localization';
import MockStatusBar from '../../components/MockStatusBar';
import api from '../../../utils/api';

type DealStatus = 'open' | 'matched' | 'closed' | 'cancelled' | 'disputed';

interface DealListItem {
  id: string;
  code: string | null;
  status: DealStatus;
  total_amount: number;
  created_at: string;
  buyer_company_name?: string | null;
  current_stage?: number;
  total_stages?: number;
  offer?: {
    quantity?: number;
    current_buyer_price?: number;
    current_seller_price?: number;
    payment_term_type?: string | null;
  };
  commodity?: {
    id: string;
    name: string;
    image_url?: string | null;
  } | null;
}

const TABS = ['All', 'Active', 'Closed'] as const;
type TabType = (typeof TABS)[number];

const STAGE_NAMES = ['Created', 'Dispatch', 'Transit', 'Delivery', 'Payment', 'Complete'];

const STATUS_COLORS: Record<DealStatus, { bg: string; text: string }> = {
  matched: { bg: '#F3CD03', text: '#0D3B1F' },
  open: { bg: 'rgba(255,255,255,0.22)', text: '#FFFFFF' },
  closed: { bg: '#F2FBF5', text: '#1A6B34' },
  cancelled: { bg: '#FEF2F2', text: '#EF4444' },
  disputed: { bg: '#FFF7ED', text: '#F97316' },
};

const STATUS_LABELS: Record<DealStatus, string> = {
  matched: 'Matched',
  open: 'Active',
  closed: 'Closed',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
};

const isActive = (s: DealStatus) =>
  s === 'matched' || s === 'open' || s === 'disputed';
const isClosed = (s: DealStatus) => s === 'closed' || s === 'cancelled';
const formatPKR = (n: number) =>
  'PKR ' + Math.round(n).toLocaleString('en-PK');

const StageTimeline = ({ currentStage }: { currentStage: number }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={styles.timeline}
    contentContainerStyle={styles.timelineContent}
  >
    {STAGE_NAMES.map((name, idx) => {
      const stageNum = idx + 1;
      const isCompleted = stageNum < currentStage;
      const isCurrent = stageNum === currentStage;
      const leftLineActive = stageNum > 1 && currentStage >= stageNum;
      const rightLineActive = stageNum < 6 && currentStage > stageNum;

      return (
        <View key={name} style={styles.stageItem}>
          <View style={styles.stageCircleRow}>
            {idx > 0 ? (
              <View
                style={[
                  styles.stageLine,
                  leftLineActive && styles.stageLineActive,
                ]}
              />
            ) : (
              <View style={styles.stageLineSpacer} />
            )}
            <View
              style={[
                styles.stageCircle,
                isCurrent || isCompleted
                  ? styles.stageCircleActive
                  : styles.stageCirclePending,
              ]}
            >
              {isCompleted ? (
                <Text style={styles.stageCheckmark}>✓</Text>
              ) : isCurrent ? (
                <View style={styles.stageDot} />
              ) : null}
            </View>
            {idx < STAGE_NAMES.length - 1 ? (
              <View
                style={[
                  styles.stageLine,
                  rightLineActive && styles.stageLineActive,
                ]}
              />
            ) : (
              <View style={styles.stageLineSpacer} />
            )}
          </View>
          <Text
            style={[
              styles.stageName,
              (isCurrent || isCompleted) && styles.stageNameActive,
            ]}
          >
            {name}
          </Text>
        </View>
      );
    })}
  </ScrollView>
);

const DealCard = ({
  item,
  onPress,
}: {
  item: DealListItem;
  onPress: () => void;
}) => {
  const statusColor =
    STATUS_COLORS[item.status] ?? STATUS_COLORS.matched;
  const qty = item.offer?.quantity;
  const price =
    item.offer?.current_buyer_price ?? item.offer?.current_seller_price;
  const currentStage = item.current_stage ?? 1;
  const imageUri = item.commodity?.image_url ?? null;
  const stageName = STAGE_NAMES[(currentStage - 1) % STAGE_NAMES.length];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.card}
      activeOpacity={0.88}
    >
      <ImageBackground
        source={imageUri ? { uri: imageUri } : undefined}
        style={styles.cardImage}
        imageStyle={styles.cardImageStyle}
      >
        {!imageUri && <View style={styles.cardImageFallback} />}
        <View style={styles.cardImageOverlay}>
          <View style={styles.cardImageTopRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>
                Step {currentStage}/6 · {stageName}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColor.bg },
              ]}
            >
              <Text
                style={[styles.statusBadgeText, { color: statusColor.text }]}
              >
                {STATUS_LABELS[item.status] ?? item.status}
              </Text>
            </View>
          </View>
          <View style={styles.cardImageBottom}>
            <Text style={styles.cardCommodityName} numberOfLines={1}>
              {item.commodity?.name ?? 'Commodity'}
            </Text>
            <Text style={styles.cardDealCode}>
              {item.code ?? item.id.slice(0, 8)}
            </Text>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.pillsRow}>
        {qty != null && (
          <View style={styles.pill}>
            <Text style={styles.pillText}>{qty} bags</Text>
          </View>
        )}
        {price != null && (
          <View style={styles.pill}>
            <Text style={styles.pillText}>
              PKR {Number(price).toLocaleString()}/40kg
            </Text>
          </View>
        )}
        <View style={[styles.pill, styles.pillGreen]}>
          <Text style={styles.pillGreenText}>
            {formatPKR(Number(item.total_amount))}
          </Text>
        </View>
      </View>

      <StageTimeline currentStage={currentStage} />

      <View style={styles.cardFooter}>
        <Text style={styles.footerDate}>
          {new Date(item.created_at).toLocaleDateString('en-PK', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </Text>
        <Text style={styles.footerArrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

const TabBadge = ({
  count,
  active,
}: {
  count: number;
  active: boolean;
}) => (
  <View
    style={[
      styles.tabBadge,
      active ? styles.tabBadgeActive : styles.tabBadgeInactive,
    ]}
  >
    <Text
      style={[
        styles.tabBadgeText,
        active ? styles.tabBadgeTextActive : styles.tabBadgeTextInactive,
      ]}
    >
      {count}
    </Text>
  </View>
);

const DealsScreen = ({ navigation }: any) => {
  const mode = useAppSelector(s => s.app.mode);
  const { t } = useTranslation();
  const [deals, setDeals] = useState<DealListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('All');

  const fetchDeals = useCallback(async () => {
    try {
      const res = (
        mode === 'buyer'
          ? await api.buyer.listDeals()
          : await api.seller.listDeals()
      ) as { data?: DealListItem[] } | undefined;
      setDeals(res?.data ?? []);
    } catch {
      // keep existing data on failure
    }
  }, [mode]);

  useEffect(() => {
    setLoading(true);
    fetchDeals().finally(() => setLoading(false));
  }, [fetchDeals]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDeals();
    setRefreshing(false);
  }, [fetchDeals]);

  const filtered = deals.filter(d => {
    if (activeTab === 'Active') return isActive(d.status);
    if (activeTab === 'Closed') return isClosed(d.status);
    return true;
  });

  const activeCount = deals.filter(d => isActive(d.status)).length;
  const closedCount = deals.filter(d => isClosed(d.status)).length;

  const tabCount = (tab: TabType) => {
    if (tab === 'All') return deals.length;
    if (tab === 'Active') return activeCount;
    return closedCount;
  };

  return (
    <View style={styles.screen}>
      <MockStatusBar backgroundColor="#145228" textColor="#FFFFFF" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {mode === 'buyer' ? t('deals.myDeals') : t('deals.myOrders')}
        </Text>
        <Text style={styles.headerSubtitle}>
          {deals.length} total · {activeCount} active
        </Text>
      </View>

      <View style={styles.tabBar}>
        {TABS.map(tab => {
          const isActiveTab = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabItem, isActiveTab && styles.tabItemActive]}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.tabLabel,
                  isActiveTab && styles.tabLabelActive,
                ]}
              >
                {tab}
              </Text>
              <TabBadge count={tabCount(tab)} active={isActiveTab} />
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#217A3C" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={d => d.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#217A3C']}
            />
          }
          renderItem={({ item }) => (
            <DealCard
              item={item}
              onPress={() =>
                navigation.navigate('DealDetail', { dealId: item.id })
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyTitle}>{t('deals.noDeals')}</Text>
              <Text style={styles.emptySubtitle}>
                {t('deals.differentFilter')}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    backgroundColor: '#145228',
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: '#217A3C' },
  tabLabel: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
  tabLabelActive: { fontWeight: '700', color: '#1A6B34' },
  tabBadge: {
    marginLeft: 5,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  tabBadgeActive: { backgroundColor: '#E8F7EE' },
  tabBadgeInactive: { backgroundColor: '#F3F4F6' },
  tabBadgeText: { fontSize: 11, fontWeight: '700' },
  tabBadgeTextActive: { color: '#1A6B34' },
  tabBadgeTextInactive: { color: '#9CA3AF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16, paddingBottom: 100, gap: 14 },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardImage: {
    height: 100,
    justifyContent: 'space-between',
  },
  cardImageStyle: { borderRadius: 0 },
  cardImageFallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#145228',
  },
  cardImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'space-between',
    padding: 10,
  },
  cardImageTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stepBadge: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stepBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  cardImageBottom: { gap: 2 },
  cardCommodityName: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
  cardDealCode: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'monospace',
  },

  // Pills
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
  },
  pill: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: { fontSize: 11, fontWeight: '600', color: '#4B5563' },
  pillGreen: { backgroundColor: '#F2FBF5' },
  pillGreenText: { fontSize: 11, fontWeight: '800', color: '#1A6B34' },

  // Stage timeline
  timeline: { borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  timelineContent: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  stageItem: { alignItems: 'center', width: 56 },
  stageCircleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  stageLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#E5E7EB',
  },
  stageLineSpacer: { flex: 1 },
  stageLineActive: { backgroundColor: '#F3CD03' },
  stageCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageCircleActive: {
    backgroundColor: '#F3CD03',
    borderColor: '#F3CD03',
  },
  stageCirclePending: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
  },
  stageCheckmark: { fontSize: 11, fontWeight: '800', color: '#0D3B1F' },
  stageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0D3B1F',
  },
  stageName: {
    fontSize: 9,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  stageNameActive: { color: '#D4AE02', fontWeight: '700' },

  // Footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  footerDate: { fontSize: 12, color: '#9CA3AF' },
  footerArrow: { fontSize: 18, color: '#D1D5DB' },

  // Empty state
  emptyState: { alignItems: 'center', paddingTop: 64, gap: 12 },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  emptySubtitle: { fontSize: 13, color: '#9CA3AF' },
});

export default DealsScreen;
