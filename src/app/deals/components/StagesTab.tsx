import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import api from '../../../utils/api';

interface Props {
  dealId: string;
  mode: 'buyer' | 'seller';
}

interface DealForStages {
  status: string;
  created_at: string;
  current_stage?: number;
  total_stages?: number;
}

interface StageItem {
  name: string;
  desc: string;
  key: string;
  color?: string;
}

const BASE_STAGES: Omit<StageItem, 'color'>[] = [
  {
    key: 'created',
    name: 'Created',
    desc: 'Your deal has been matched and confirmed.',
  },
  {
    key: 'in_progress',
    name: 'In Progress',
    desc: 'Trucks have been dispatched and payments are being processed.',
  },
];

const FINAL_STAGE: Record<string, StageItem> = {
  closed: { key: 'completed', name: 'Completed', desc: 'All deliveries and payments have been settled successfully.', color: '#217A3C' },
  cancelled: { key: 'cancelled', name: 'Cancelled', desc: 'This deal has been cancelled.', color: '#EF4444' },
  disputed: { key: 'disputed', name: 'Disputed', desc: 'This deal is under review by admin.', color: '#F97316' },
};

const getDisplayStage = (status: string): number => {
  if (status === 'closed' || status === 'cancelled' || status === 'disputed') return 3;
  if (status === 'in_progress' || status === 'open') return 2;
  return 1;
};

const StagesTab: React.FC<Props> = ({ dealId, mode }) => {
  const [deal, setDeal] = useState<DealForStages | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDeal = useCallback(async () => {
    try {
      const res: any =
        mode === 'buyer'
          ? await api.buyer.getDeal(dealId)
          : await api.seller.getDeal(dealId);
      if (res) setDeal(res);
    } catch {
      // keep existing
    } finally {
      setLoading(false);
    }
  }, [dealId, mode]);

  useEffect(() => {
    loadDeal();
  }, [loadDeal]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDeal();
    setRefreshing(false);
  }, [loadDeal]);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#217A3C" />
      </View>
    );
  }

  if (!deal) return null;

  const displayStage = getDisplayStage(deal.status);
  const finalStage = FINAL_STAGE[deal.status] ?? FINAL_STAGE.closed;
  const allStages = [...BASE_STAGES, finalStage];
  // Only render stages up to and including the current one
  const stages = allStages.slice(0, displayStage);

  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#217A3C"
          colors={['#217A3C']}
        />
      }
    >
      <View style={s.headerCard}>
        <Text style={s.headerTitle}>Deal Progress</Text>
        <Text style={s.headerSub}>
          {stages[stages.length - 1]?.name ?? ''}
        </Text>
      </View>

      <View style={s.timeline}>
        {stages.map((stage, idx) => {
          const stageNum = idx + 1;
          const isCompleted = stageNum < displayStage;
          const isCurrent = stageNum === displayStage;
          const isLast = idx === stages.length - 1;
          const accentColor = (stage as StageItem).color ?? '#217A3C';

          return (
            <View key={stage.key} style={s.stageRow}>
              <View style={s.timelineCol}>
                <View
                  style={[
                    s.circle,
                    isCompleted
                      ? [s.circleCompleted, { backgroundColor: accentColor }]
                      : [s.circleCurrent, { backgroundColor: accentColor, shadowColor: accentColor }],
                  ]}
                >
                  {isCompleted ? (
                    <Text style={s.checkIcon}>✓</Text>
                  ) : (
                    <Text style={[s.stageNum, s.stageNumCurrent]}>{stageNum}</Text>
                  )}
                </View>
                {!isLast && <View style={[s.connector, s.connectorDone]} />}
              </View>

              <View
                style={[
                  s.stageContent,
                  !isLast && s.stageContentBordered,
                  isCurrent && s.stageContentCurrent,
                ]}
              >
                <View style={s.stageTopRow}>
                  <Text
                    style={[
                      s.stageName,
                      isCompleted ? s.stageNameDone : s.stageNameCurrent,
                    ]}
                  >
                    {stage.name}
                  </Text>
                  {isCurrent && (
                    <View style={s.currentBadge}>
                      <Text style={s.currentBadgeText}>Current</Text>
                    </View>
                  )}
                  {isCompleted && (
                    <View style={s.doneBadge}>
                      <Text style={s.doneBadgeText}>Done</Text>
                    </View>
                  )}
                </View>
                <Text style={s.stageDesc}>
                  {stage.desc}
                </Text>
                {isCompleted && (
                  <Text style={s.stageDate}>
                    {new Date(deal.created_at).toLocaleDateString('en-PK', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      <View style={s.bottomSpacer} />
    </ScrollView>
  );
};

const CIRCLE_SIZE = 28;

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: { padding: 14 },
  bottomSpacer: { height: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  headerCard: {
    backgroundColor: '#145228',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 3 },

  timeline: { paddingLeft: 4 },

  stageRow: { flexDirection: 'row', gap: 14, minHeight: 60 },

  timelineCol: { width: CIRCLE_SIZE, alignItems: 'center', flexShrink: 0 },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleCompleted: { backgroundColor: '#217A3C' },
  circleCurrent: {
    backgroundColor: '#F3CD03',
    shadowColor: '#F3CD03',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 3,
  },
  circlePending: {
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  checkIcon: { fontSize: 13, color: '#FFFFFF', fontWeight: '900' },
  stageNum: { fontSize: 12, fontWeight: '800' },
  stageNumCurrent: { color: '#0D3B1F' },
  stageNumPending: { color: '#9CA3AF' },
  connector: { flex: 1, width: 2, marginVertical: 3, borderRadius: 1 },
  connectorDone: { backgroundColor: '#217A3C' },
  connectorPending: { backgroundColor: '#E5E7EB' },

  stageContent: { flex: 1, paddingBottom: 20 },
  stageContentBordered: { borderBottomWidth: 0 },
  stageContentCurrent: {
    backgroundColor: '#FFFDE6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(243,205,3,0.4)',
  },
  stageTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  stageName: { fontSize: 14, fontWeight: '700', flex: 1 },
  stageNameDone: { color: '#217A3C' },
  stageNameCurrent: { color: '#0D3B1F' },
  stageNamePending: { color: '#9CA3AF' },
  currentBadge: {
    backgroundColor: '#F3CD03',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  currentBadgeText: { fontSize: 10, fontWeight: '800', color: '#0D3B1F' },
  doneBadge: {
    backgroundColor: '#E8F7EE',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  doneBadgeText: { fontSize: 10, fontWeight: '700', color: '#1A6B34' },
  stageDesc: { fontSize: 12, color: '#6B7280', lineHeight: 17 },
  stageDescPending: { color: '#D1D5DB' },
  stageDate: { fontSize: 10, color: '#9CA3AF', marginTop: 4 },
});

export default StagesTab;
