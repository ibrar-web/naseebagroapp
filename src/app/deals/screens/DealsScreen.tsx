import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useAppSelector } from '../../../store';
import { useTranslation } from '../../../localization';
import MockStatusBar from '../../components/MockStatusBar';

type StageStatus = 'done' | 'current' | 'pending';

interface Stage {
  label: string;
  status: StageStatus;
}

interface Deal {
  id: string;
  commodity: string;
  qty: string;
  unitRate: string;
  amount: string;
  counterparty: string;
  location: string;
  stages: Stage[];
  currentStageIndex: number;
  statusLabel: string;
  statusDesc: string;
  actionType: 'naseeb' | 'seller' | 'buyer' | 'done';
  actionLabel: string;
  status: 'Active' | 'Closed';
  image: string;
  fallback: string;
}

const DEALS: Deal[] = [
  {
    id: 'DEL-001',
    commodity: 'Premium Wheat',
    qty: '400 bags',
    unitRate: 'PKR 280/40kg',
    amount: 'PKR 112,000',
    counterparty: 'Asad Traders',
    location: 'Lahore → Karachi',
    currentStageIndex: 0,
    stages: [
      { label: 'Deal Created', status: 'current' },
      { label: 'Dispatch Prep', status: 'pending' },
      { label: 'In Transit', status: 'pending' },
      { label: 'Delivery', status: 'pending' },
      { label: 'Payment', status: 'pending' },
      { label: 'Complete', status: 'pending' },
    ],
    statusLabel: 'Deal Created',
    statusDesc: 'Waiting for dispatch preparation',
    actionType: 'naseeb',
    actionLabel: 'Naseeb Processing',
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=900&q=80',
    fallback: '#C29A4A',
  },
  {
    id: 'DEL-002',
    commodity: 'IRRI-6 Rice',
    qty: '200 bags',
    unitRate: 'PKR 420/40kg',
    amount: 'PKR 84,000',
    counterparty: 'Punjab Agri Co',
    location: 'Sheikhupura → Lahore',
    currentStageIndex: 2,
    stages: [
      { label: 'Deal Created', status: 'done' },
      { label: 'Dispatch Prep', status: 'done' },
      { label: 'In Transit', status: 'current' },
      { label: 'Delivery', status: 'pending' },
      { label: 'Payment', status: 'pending' },
      { label: 'Complete', status: 'pending' },
    ],
    statusLabel: 'Out for Delivery',
    statusDesc: 'Confirm delivery when received',
    actionType: 'buyer',
    actionLabel: 'Your Action',
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&q=80',
    fallback: '#8A9A5B',
  },
  {
    id: 'DEL-003',
    commodity: 'Desi Cotton',
    qty: '125 bags',
    unitRate: 'PKR 850/40kg',
    amount: 'PKR 106,250',
    counterparty: 'Cotton King',
    location: 'Multan → Faisalabad',
    currentStageIndex: 3,
    stages: [
      { label: 'Deal Created', status: 'done' },
      { label: 'Dispatch Prep', status: 'done' },
      { label: 'In Transit', status: 'done' },
      { label: 'Delivery', status: 'current' },
      { label: 'Payment', status: 'pending' },
      { label: 'Complete', status: 'pending' },
    ],
    statusLabel: 'Dispatch Preparation',
    statusDesc: 'Seller is preparing the shipment',
    actionType: 'seller',
    actionLabel: 'Seller Action',
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1594179047519-f347310d3322?w=900&q=80',
    fallback: '#D8D6C7',
  },
  {
    id: 'DEL-004',
    commodity: 'Yellow Maize',
    qty: '750 bags',
    unitRate: 'PKR 260/40kg',
    amount: 'PKR 195,000',
    counterparty: 'Farm Fresh Ltd',
    location: 'Faisalabad → Karachi',
    currentStageIndex: 5,
    stages: [
      { label: 'Deal Created', status: 'done' },
      { label: 'Dispatch Prep', status: 'done' },
      { label: 'In Transit', status: 'done' },
      { label: 'Delivery', status: 'done' },
      { label: 'Payment', status: 'done' },
      { label: 'Complete', status: 'done' },
    ],
    statusLabel: 'Payment In Progress',
    statusDesc: 'Transaction completed successfully',
    actionType: 'done',
    actionLabel: 'Completed',
    status: 'Closed',
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=900&q=80',
    fallback: '#DCA640',
  },
];

const TABS = ['All', 'Active', 'Closed'] as const;
type TabType = (typeof TABS)[number];

const stageCircleStyle = (status: StageStatus) => {
  if (status === 'done') {
    return { bg: '#45B86A', border: '#7FD4A0' };
  }
  if (status === 'current') {
    return { bg: '#F3CD03', border: '#F7DB4A' };
  }
  return { bg: 'rgba(255,255,255,0.12)', border: 'rgba(255,255,255,0.133)' };
};

const actionBadgeStyle = (type: Deal['actionType']) => {
  if (type === 'naseeb') return { bg: '#FFFDE6', dot: '#D4AE02', text: '#D4AE02' };
  if (type === 'seller') return { bg: '#F2FBF5', dot: '#1A6B34', text: '#1A6B34' };
  if (type === 'buyer') return { bg: '#EEF6FF', dot: '#3B82F6', text: '#3B82F6' };
  return { bg: '#F3F4F6', dot: '#9CA3AF', text: '#9CA3AF' };
};

const StageTimeline = ({ stages }: { stages: Stage[] }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={styles.timelineScroll}
    contentContainerStyle={styles.timelineContent}
  >
    {stages.map((stage, i) => {
      const circle = stageCircleStyle(stage.status);
      const isLast = i === stages.length - 1;
      const lineDone = stage.status === 'done' || stage.status === 'current';

      return (
        <React.Fragment key={stage.label}>
          <View style={styles.stageNode}>
            <View
              style={[
                styles.stageCircle,
                { backgroundColor: circle.bg, borderColor: circle.border },
              ]}
            >
              {stage.status === 'done' && (
                <Text style={styles.checkmark}>✓</Text>
              )}
              {stage.status === 'current' && (
                <View style={styles.currentDot} />
              )}
            </View>
            <Text
              style={[
                styles.stageLabel,
                stage.status === 'pending' && styles.stageLabelPending,
              ]}
            >
              {stage.label}
            </Text>
          </View>
          {!isLast && (
            <View
              style={[
                styles.connector,
                { backgroundColor: lineDone ? '#45B86A' : 'rgba(255,255,255,0.133)' },
              ]}
            />
          )}
        </React.Fragment>
      );
    })}
  </ScrollView>
);

const DataPill = ({
  label,
  highlight,
}: {
  label: string;
  highlight?: boolean;
}) => (
  <View
    style={[styles.dataPill, highlight && styles.dataPillHighlight]}
  >
    <Text style={[styles.dataPillText, highlight && styles.dataPillTextHighlight]}>
      {label}
    </Text>
  </View>
);

const DealCard = ({ item, onPress }: { item: Deal; onPress: () => void }) => {
  const badge = actionBadgeStyle(item.actionType);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.card}
      activeOpacity={0.88}
    >
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.cardImage}
        resizeMode="cover"
        imageStyle={{ backgroundColor: item.fallback }}
      >
        <View style={styles.imageOverlay} />

        {/* Top-left: step badge */}
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>
            Step {item.currentStageIndex + 1}/6 · {item.stages[item.currentStageIndex].label}
          </Text>
        </View>

        {/* Top-right: status badge */}
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>{item.statusLabel}</Text>
        </View>

        {/* Stage timeline */}
        <View style={styles.timelineWrapper}>
          <StageTimeline stages={item.stages} />
        </View>
      </ImageBackground>

      <View style={styles.cardBody}>
        {/* Data pills */}
        <View style={styles.pillsRow}>
          <DataPill label={item.qty} />
          <DataPill label={item.unitRate} />
          <DataPill label={item.amount} highlight />
        </View>

        {/* Status footer */}
        <View style={styles.statusFooter}>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>{item.statusLabel}</Text>
            <Text style={styles.statusDesc} numberOfLines={2}>
              {item.statusDesc}
            </Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationPin}>📍</Text>
              <Text style={styles.locationText}>
                {item.counterparty} · {item.location}
              </Text>
            </View>
          </View>
          <View style={[styles.actionBadge, { backgroundColor: badge.bg }]}>
            <View style={[styles.actionDot, { backgroundColor: badge.dot }]} />
            <Text style={[styles.actionText, { color: badge.text }]}>
              {item.actionLabel}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const TabBadge = ({ count, active }: { count: number; active: boolean }) => (
  <View
    style={[
      styles.tabBadge,
      { backgroundColor: active ? '#E8F7EE' : '#F3F4F6' },
    ]}
  >
    <Text
      style={[
        styles.tabBadgeText,
        { color: active ? '#1A6B34' : '#9CA3AF' },
      ]}
    >
      {count}
    </Text>
  </View>
);

const DealsScreen = ({ navigation }: any) => {
  const mode = useAppSelector(s => s.app.mode);
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('All');

  const activeCount = DEALS.filter(d => d.status === 'Active').length;
  const closedCount = DEALS.filter(d => d.status === 'Closed').length;

  const tabCount = (tab: TabType) => {
    if (tab === 'All') return DEALS.length;
    if (tab === 'Active') return activeCount;
    return closedCount;
  };

  const filtered =
    activeTab === 'All' ? DEALS : DEALS.filter(d => d.status === activeTab);

  return (
    <View style={styles.screen}>
      <MockStatusBar backgroundColor="#145228" textColor="#FFFFFF" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {mode === 'buyer' ? t('deals.myDeals') : t('deals.myOrders')}
        </Text>
        <Text style={styles.headerSubtitle}>
          {DEALS.length} total · {activeCount} active
        </Text>
      </View>

      <View style={styles.tabBar}>
        {TABS.map(tab => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              activeOpacity={0.75}
            >
              <Text
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}
              >
                {tab}
              </Text>
              <TabBadge count={tabCount(tab)} active={isActive} />
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={d => d.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#145228',
    paddingTop: 6,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
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
  tabItemActive: {
    borderBottomColor: '#217A3C',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabLabelActive: {
    fontWeight: '700',
    color: '#1A6B34',
  },
  tabBadge: {
    marginLeft: 5,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 14,
  },
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
    width: '100%',
    minHeight: 180,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  stepBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  stepBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    backgroundColor: '#F3CD03',
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0D3B1F',
  },
  timelineWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 8,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  timelineScroll: {
    flexGrow: 0,
  },
  timelineContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 2,
  },
  stageNode: {
    alignItems: 'center',
    minWidth: 52,
  },
  stageCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  checkmark: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
    lineHeight: 13,
  },
  currentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  stageLabel: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 10,
  },
  stageLabelPending: {
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
  },
  connector: {
    flex: 1,
    height: 2,
    minWidth: 8,
    marginBottom: 14,
  },
  cardBody: {
    padding: 14,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 10,
  },
  dataPill: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dataPillHighlight: {
    backgroundColor: '#F2FBF5',
  },
  dataPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  dataPillTextHighlight: {
    fontWeight: '800',
    color: '#1A6B34',
  },
  statusFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  statusInfo: {
    flex: 1,
    gap: 2,
  },
  statusTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  statusDesc: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
    lineHeight: 15,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  locationPin: {
    fontSize: 10,
  },
  locationText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexShrink: 0,
    alignSelf: 'flex-start',
  },
  actionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  actionText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 64,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
  },
});

export default DealsScreen;
