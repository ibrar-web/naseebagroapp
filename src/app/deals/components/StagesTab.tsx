import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
}

const STAGES: StageItem[] = [
  {
    key: 'created',
    name: 'Deal Created',
    desc: 'Your deal has been matched and confirmed with the seller.',
  },
  {
    key: 'dispatch',
    name: 'Dispatch Preparation',
    desc: 'Seller is preparing and registering trucks for dispatch.',
  },
  {
    key: 'transit',
    name: 'In Transit',
    desc: 'Trucks are loaded and en route to the delivery location.',
  },
  {
    key: 'delivery',
    name: 'Delivered',
    desc: 'Trucks have arrived and delivery has been confirmed.',
  },
  {
    key: 'payment',
    name: 'Payment',
    desc: 'Buyer is processing payment; receipts are under verification.',
  },
  {
    key: 'complete',
    name: 'Complete',
    desc: 'All deliveries and payments have been settled successfully.',
  },
];

const STATUS_TO_STAGE: Record<string, number> = {
  matched: 1,
  open: 3,
  closed: 6,
  cancelled: 0,
  disputed: 2,
};

interface Props {
  deal: DealForStages;
  mode: 'buyer' | 'seller';
}

const StagesTab: React.FC<Props> = ({ deal }) => {
  const currentStage = deal.current_stage ?? STATUS_TO_STAGE[deal.status] ?? 1;
  const isCancelled = deal.status === 'cancelled';

  return (
    <View style={s.container}>
      <View style={s.headerCard}>
        <Text style={s.headerTitle}>Deal Progress</Text>
        <Text style={s.headerSub}>
          {isCancelled
            ? 'This deal has been cancelled.'
            : `Stage ${currentStage} of ${STAGES.length}`}
        </Text>
      </View>

      <View style={s.timeline}>
        {STAGES.map((stage, idx) => {
          const stageNum = idx + 1;
          const isCompleted = !isCancelled && stageNum < currentStage;
          const isCurrent = !isCancelled && stageNum === currentStage;
          const isPending = isCancelled || stageNum > currentStage;

          const circleStyle = isCompleted
            ? s.circleCompleted
            : isCurrent
              ? s.circleCurrent
              : s.circlePending;

          const circleInner = isCompleted ? (
            <Text style={s.checkIcon}>✓</Text>
          ) : (
            <Text
              style={[
                s.stageNum,
                isCurrent ? s.stageNumCurrent : s.stageNumPending,
              ]}
            >
              {stageNum}
            </Text>
          );

          const isLast = idx === STAGES.length - 1;

          return (
            <View key={stage.key} style={s.stageRow}>
              {/* Left timeline column */}
              <View style={s.timelineCol}>
                <View style={[s.circle, circleStyle]}>{circleInner}</View>
                {!isLast && (
                  <View
                    style={[
                      s.connector,
                      isCompleted ? s.connectorDone : s.connectorPending,
                    ]}
                  />
                )}
              </View>

              {/* Right content */}
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
                      isCompleted && s.stageNameDone,
                      isCurrent && s.stageNameCurrent,
                      isPending && s.stageNamePending,
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
                <Text
                  style={[
                    s.stageDesc,
                    isPending && s.stageDescPending,
                  ]}
                >
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
    </View>
  );
};

const CIRCLE_SIZE = 28;

const s = StyleSheet.create({
  container: { paddingBottom: 8 },

  headerCard: {
    backgroundColor: '#145228',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 3,
  },

  timeline: { paddingLeft: 4 },

  stageRow: {
    flexDirection: 'row',
    gap: 14,
    minHeight: 60,
  },

  // Left column
  timelineCol: {
    width: CIRCLE_SIZE,
    alignItems: 'center',
    flexShrink: 0,
  },
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
  connector: {
    flex: 1,
    width: 2,
    marginVertical: 3,
    borderRadius: 1,
  },
  connectorDone: { backgroundColor: '#217A3C' },
  connectorPending: { backgroundColor: '#E5E7EB' },

  // Right content
  stageContent: {
    flex: 1,
    paddingBottom: 20,
  },
  stageContentBordered: {
    borderBottomWidth: 0,
  },
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
