import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar,
} from 'react-native';
import { Colors as C, Spacing, Radius, Shadow } from '../../../constants/theme';
import { useAppSelector } from '../../../store';

const FILTERS = ['All', 'Active', 'Payment', 'Transit', 'Completed'];

const DEALS = [
  {
    id: 'DEL-001', commodity: 'Premium Wheat', emoji: '🌾',
    qty: '200 Tons', rate: '₨3,850/40kg', amount: '₨19.25L',
    counterparty: 'Asad Traders', location: 'Lahore → Karachi',
    stage: 8, status: 'Active', date: '2 days ago',
  },
  {
    id: 'DEL-002', commodity: 'IRRI-6 Rice', emoji: '🍚',
    qty: '80 Tons', rate: '₨4,200/40kg', amount: '₨8.4L',
    counterparty: 'Punjab Agri Co', location: 'Sheikhupura → Lahore',
    stage: 6, status: 'Payment', date: '5 days ago',
  },
  {
    id: 'DEL-003', commodity: 'Desi Cotton', emoji: '☁️',
    qty: '50 Tons', rate: '₨8,500/40kg', amount: '₨10.6L',
    counterparty: 'Cotton King', location: 'Multan → Faisalabad',
    stage: 10, status: 'Transit', date: '1 week ago',
  },
  {
    id: 'DEL-004', commodity: 'Yellow Maize', emoji: '🌽',
    qty: '300 Tons', rate: '₨2,600/40kg', amount: '₨19.5L',
    counterparty: 'Farm Fresh Ltd', location: 'Faisalabad → Karachi',
    stage: 12, status: 'Completed', date: '2 weeks ago',
  },
];

const STAGE_COLORS = ['#F59E0B', '#3B82F6', '#8B5CF6', '#10B981'];

const DealCard = ({ item, onPress }: any) => {
  const pct = Math.round((item.stage / 12) * 100);
  const stageColor = item.stage < 5 ? STAGE_COLORS[0] : item.stage < 8 ? STAGE_COLORS[1] : item.stage < 11 ? STAGE_COLORS[2] : STAGE_COLORS[3];

  return (
    <TouchableOpacity style={styles.dealCard} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.dealRow}>
        <View style={styles.dealEmoji}>
          <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.dealId}>{item.id}</Text>
            <View style={[styles.statusPill, { backgroundColor: stageColor + '20' }]}>
              <Text style={[styles.statusPillText, { color: stageColor }]}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.dealName}>{item.commodity}</Text>
          <Text style={styles.dealMeta}>{item.qty} · {item.counterparty}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        <Text style={styles.dealLocation}>📍 {item.location}</Text>
        <Text style={styles.dealAmount}>{item.amount}</Text>
      </View>

      {/* Pipeline bar */}
      <View style={styles.pipelineWrap}>
        <View style={[styles.pipelineFill, { width: `${pct}%` as any, backgroundColor: stageColor }]} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
        <Text style={styles.pipelineLabel}>Stage {item.stage}/12</Text>
        <Text style={[styles.pipelineLabel, { color: stageColor, fontWeight: '700' }]}>{pct}% complete</Text>
      </View>
    </TouchableOpacity>
  );
};

const DealsScreen = ({ navigation }: any) => {
  const mode = useAppSelector(s => s.app.mode);
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All' ? DEALS : DEALS.filter(d => d.status === activeFilter);

  const summary = {
    active:    DEALS.filter(d => d.status === 'Active').length,
    completed: DEALS.filter(d => d.status === 'Completed').length,
    transit:   DEALS.filter(d => d.status === 'Transit').length,
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.green900} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.orb} />
        <Text style={styles.headerTitle}>{mode === 'buyer' ? 'My Deals' : 'My Orders'}</Text>
        <Text style={styles.headerSub}>{DEALS.length} total deals</Text>

        {/* Summary strip */}
        <View style={styles.summaryRow}>
          {[
            { label: 'Active',    val: summary.active,    color: C.green600,  bg: 'rgba(46,158,82,0.2)'  },
            { label: 'In Transit',val: summary.transit,   color: C.blue500,   bg: 'rgba(59,130,246,0.2)' },
            { label: 'Completed', val: summary.completed, color: C.orange400, bg: 'rgba(247,219,74,0.2)' },
          ].map(s => (
            <View key={s.label} style={[styles.summaryCard, { backgroundColor: s.bg }]}>
              <Text style={[styles.summaryVal, { color: s.color }]}>{s.val}</Text>
              <Text style={styles.summaryLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={f => f}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveFilter(item)}
              style={[styles.filterTab, activeFilter === item && styles.filterTabActive]}
            >
              <Text style={[styles.filterTabText, activeFilter === item && styles.filterTabTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Deal list */}
      <FlatList
        data={filtered}
        keyExtractor={d => d.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <DealCard item={item} onPress={() => navigation.navigate('DealDetail', { dealId: item.id })} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 40 }}>📭</Text>
            <Text style={styles.emptyTitle}>No deals found</Text>
            <Text style={styles.emptySub}>Try a different filter</Text>
          </View>
        }
      />
    </View>
  );
};

export default DealsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.gray50 },

  header: {
    backgroundColor: C.green900,
    paddingTop: 48, paddingBottom: 16,
    paddingHorizontal: Spacing.base,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute', top: -40, right: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: C.green700, opacity: 0.25,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.white },
  headerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2, marginBottom: 14 },

  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard:  { flex: 1, borderRadius: Radius.lg, padding: 10, alignItems: 'center' },
  summaryVal:   { fontSize: 20, fontWeight: '800' },
  summaryLabel: { fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 2, fontWeight: '500' },

  filterRow:  { backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.gray100 },
  filterList: { paddingHorizontal: Spacing.base, paddingVertical: 10, gap: 8 },
  filterTab:  { paddingHorizontal: 16, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: C.gray100 },
  filterTabActive:     { backgroundColor: C.green700 },
  filterTabText:       { fontSize: 12, fontWeight: '600', color: C.gray600 },
  filterTabTextActive: { color: C.white, fontWeight: '700' },

  list: { padding: Spacing.base, paddingBottom: 100 },

  dealCard: { backgroundColor: C.white, borderRadius: Radius.xl, padding: 14, marginBottom: 12, ...Shadow.sm },
  dealRow:  { flexDirection: 'row', gap: 12 },
  dealEmoji: {
    width: 56, height: 56, borderRadius: Radius.lg,
    backgroundColor: C.green50, alignItems: 'center', justifyContent: 'center',
  },
  dealId:    { fontSize: 10, color: C.gray400, fontFamily: 'monospace' },
  dealName:  { fontSize: 14, fontWeight: '700', color: C.gray900, marginTop: 2 },
  dealMeta:  { fontSize: 11, color: C.gray500, marginTop: 2 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  statusPillText: { fontSize: 11, fontWeight: '700' },
  dealLocation: { fontSize: 11, color: C.gray500 },
  dealAmount:   { fontSize: 14, fontWeight: '800', color: C.green700 },

  pipelineWrap: { height: 6, backgroundColor: C.gray100, borderRadius: 3, marginTop: 10, overflow: 'hidden' },
  pipelineFill: { height: '100%', borderRadius: 3 },
  pipelineLabel: { fontSize: 10, color: C.gray400 },

  empty:      { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.gray800 },
  emptySub:   { fontSize: 13, color: C.gray400 },
});
