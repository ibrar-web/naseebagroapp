import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { Colors as C, Spacing, Radius, Shadow } from '../../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'DealDetail'>;

const DEALS: Record<string, any> = {
  'DEL-001': {
    id: 'DEL-001', commodity: 'Premium Wheat', emoji: '🌾',
    qty: '200 Tons', rate: '₨3,850/40kg', amount: '₨19.25L',
    buyer: 'Rafiq Traders', seller: 'Asad Traders',
    location: 'Lahore → Karachi', stage: 8,
    payments: [
      { label: 'Advance (30%)',   val: '₨5.77L', status: 'Paid'    },
      { label: 'On Dispatch',     val: '₨7.7L',  status: 'Pending' },
      { label: 'On Delivery',     val: '₨5.78L', status: 'Pending' },
    ],
  },
  'DEL-002': {
    id: 'DEL-002', commodity: 'IRRI-6 Rice', emoji: '🍚',
    qty: '80 Tons', rate: '₨4,200/40kg', amount: '₨8.4L',
    buyer: 'City Grocers', seller: 'Punjab Agri Co',
    location: 'Sheikhupura → Lahore', stage: 6,
    payments: [
      { label: 'Advance (30%)', val: '₨2.52L', status: 'Paid'    },
      { label: 'On Dispatch',   val: '₨3.36L', status: 'Pending' },
      { label: 'On Delivery',   val: '₨2.52L', status: 'Pending' },
    ],
  },
};

const STAGE_LABELS = [
  'Demand Placed', 'Admin Review', 'Offer Sent', 'Negotiation',
  'Deal Agreed', 'Payment Init.', 'Payment Done',
  'Goods Ready', 'In Transit', 'Delivered', 'Inspection',
  'Payment Released', 'Completed',
];

const DealDetailScreen = ({ navigation, route }: Props) => {
  const { dealId } = route.params;
  const deal = DEALS[dealId] ?? DEALS['DEL-001'];
  const pct  = Math.round((deal.stage / 12) * 100);
  const stageColor = deal.stage < 5 ? '#F59E0B' : deal.stage < 8 ? '#3B82F6' : deal.stage < 11 ? '#8B5CF6' : '#10B981';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.green900} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.orb} />
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 18, color: C.white }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.dealId}>{deal.id}</Text>
        <Text style={styles.dealName}>{deal.commodity}</Text>
        <Text style={styles.dealAmount}>{deal.amount}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryEmojiWrap}>
              <Text style={{ fontSize: 32 }}>{deal.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              {[
                { label: 'Quantity',   val: deal.qty      },
                { label: 'Rate',       val: deal.rate     },
                { label: 'Location',   val: deal.location },
              ].map(r => (
                <View key={r.label} style={styles.summaryFieldRow}>
                  <Text style={styles.summaryFieldLabel}>{r.label}</Text>
                  <Text style={styles.summaryFieldVal}>{r.val}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.partiesRow}>
            <View style={styles.partyBox}>
              <Text style={styles.partyRole}>🛒 Buyer</Text>
              <Text style={styles.partyName}>{deal.buyer}</Text>
            </View>
            <Text style={{ fontSize: 20, color: C.gray300 }}>⇄</Text>
            <View style={[styles.partyBox, { alignItems: 'flex-end' }]}>
              <Text style={styles.partyRole}>📦 Seller</Text>
              <Text style={styles.partyName}>{deal.seller}</Text>
            </View>
          </View>
        </View>

        {/* Pipeline */}
        <View style={styles.pipelineCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={styles.cardTitle}>Deal Progress</Text>
            <Text style={[styles.stageLabel, { color: stageColor }]}>Stage {deal.stage}/12</Text>
          </View>

          <View style={styles.pipelineBar}>
            <View style={[styles.pipelineFill, { width: `${pct}%` as any, backgroundColor: stageColor }]} />
          </View>
          <Text style={[styles.pipelinePct, { color: stageColor }]}>{pct}% complete</Text>

          <View style={styles.stageList}>
            {STAGE_LABELS.map((s, idx) => (
              <View key={s} style={styles.stageItem}>
                <View style={[styles.stageDot, { backgroundColor: idx < deal.stage ? stageColor : idx === deal.stage ? stageColor : C.gray200 }]}>
                  {idx < deal.stage && <Text style={{ fontSize: 10, color: C.white }}>✓</Text>}
                  {idx === deal.stage && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.white }} />}
                </View>
                <Text style={[styles.stageName, idx === deal.stage && { color: stageColor, fontWeight: '700' }, idx < deal.stage && { color: C.gray400 }]}>
                  {s}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Payments */}
        <View style={styles.paymentCard}>
          <Text style={styles.cardTitle}>Payment Schedule</Text>
          {deal.payments.map((p: any) => (
            <View key={p.label} style={styles.paymentRow}>
              <View>
                <Text style={styles.paymentLabel}>{p.label}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.paymentVal}>{p.val}</Text>
                <View style={[styles.paymentStatus, p.status === 'Paid' ? styles.paidBadge : styles.pendingBadge]}>
                  <Text style={[styles.paymentStatusText, p.status === 'Paid' ? { color: C.green700 } : { color: '#D97706' }]}>
                    {p.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Actions</Text>
          <View style={styles.actionsRow}>
            {[
              { label: '💬 Negotiate', color: C.green700, border: true },
              { label: '📋 Dispute',   color: C.red500,   border: true },
            ].map(a => (
              <TouchableOpacity
                key={a.label}
                style={[styles.actionBtn, { borderColor: a.color + '60' }]}
                activeOpacity={0.85}
              >
                <Text style={[styles.actionBtnText, { color: a.color }]}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

export default DealDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.gray50 },

  header: {
    backgroundColor: C.green900,
    paddingTop: 54, paddingBottom: 24,
    paddingHorizontal: Spacing.base,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute', top: -40, right: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: C.green700, opacity: 0.25,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  dealId:     { fontSize: 11, fontWeight: '700', color: C.gold, letterSpacing: 1 },
  dealName:   { fontSize: 22, fontWeight: '800', color: C.white, marginTop: 4 },
  dealAmount: { fontSize: 16, fontWeight: '700', color: C.orange400, marginTop: 4 },

  body: { padding: Spacing.base, gap: 14 },

  summaryCard: { backgroundColor: C.white, borderRadius: Radius.xl, padding: Spacing.base, ...Shadow.sm },
  summaryRow:  { flexDirection: 'row', gap: 14, marginBottom: 14 },
  summaryEmojiWrap: {
    width: 64, height: 64, borderRadius: Radius.lg,
    backgroundColor: C.green50, alignItems: 'center', justifyContent: 'center',
  },
  summaryFieldRow:  { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  summaryFieldLabel:{ fontSize: 11, color: C.gray400 },
  summaryFieldVal:  { fontSize: 12, fontWeight: '700', color: C.gray800 },
  partiesRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: C.gray100 },
  partyBox:   { gap: 2 },
  partyRole:  { fontSize: 11, color: C.gray400 },
  partyName:  { fontSize: 13, fontWeight: '700', color: C.gray900 },

  pipelineCard: { backgroundColor: C.white, borderRadius: Radius.xl, padding: Spacing.base, ...Shadow.sm },
  cardTitle:    { fontSize: 14, fontWeight: '800', color: C.gray900 },
  stageLabel:   { fontSize: 12, fontWeight: '700' },
  pipelineBar:  { height: 8, backgroundColor: C.gray100, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  pipelineFill: { height: '100%', borderRadius: 4 },
  pipelinePct:  { fontSize: 11, fontWeight: '700', marginBottom: 14 },
  stageList:    { gap: 8 },
  stageItem:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stageDot:     { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stageName:    { fontSize: 12, color: C.gray700 },

  paymentCard: { backgroundColor: C.white, borderRadius: Radius.xl, padding: Spacing.base, ...Shadow.sm },
  paymentRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.gray100 },
  paymentLabel:{ fontSize: 13, color: C.gray700, fontWeight: '600' },
  paymentVal:  { fontSize: 14, fontWeight: '800', color: C.gray900 },
  paymentStatus:      { marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  paidBadge:          { backgroundColor: C.green50 },
  pendingBadge:       { backgroundColor: '#FEF3C7' },
  paymentStatusText:  { fontSize: 10, fontWeight: '700' },

  actionsCard: { backgroundColor: C.white, borderRadius: Radius.xl, padding: Spacing.base, ...Shadow.sm },
  actionsRow:  { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionBtn: {
    flex: 1, paddingVertical: 12, borderRadius: Radius.lg,
    alignItems: 'center', borderWidth: 1.5,
  },
  actionBtnText: { fontSize: 13, fontWeight: '700' },
});
