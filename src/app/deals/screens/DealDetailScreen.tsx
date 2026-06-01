import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'DealDetail'>;

const DEALS: Record<string, any> = {
  'DEL-001': {
    id: 'DEL-001',
    commodity: 'Basmati Rice',
    qty: '200 bags',
    rate: 'PKR 4,200 / 40kg',
    totalValue: 'PKR 840,000',
    trucks: '1 trucks · PKR — each',
    paymentTerms: 'Fixed full payment',
    deliveryOption: 'Delivered',
    deliveryTo: 'Lahore',
    mill: 'Gujranwala Mill A',
    bilti: '—',
    date: 'Mar 30',
    statusLabel: 'Deal Created',
    summary: '200 bags · PKR 840,000 · 1 trucks',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&q=80',
    fallback: '#8A9A5B',
    stages: [
      { label: 'Deal Created', status: 'current' },
      { label: 'Dispatch Prep', status: 'pending' },
      { label: 'In Transit', status: 'pending' },
      { label: 'Delivery', status: 'pending' },
      { label: 'Payment', status: 'pending' },
      { label: 'Complete', status: 'pending' },
    ],
    trucks_detail: [
      { id: 'TRK-001', number: 'LHR-1234', driver: 'Ahmed Khan', status: 'Pending', bags: '200' },
    ],
    payments: [
      { label: 'Advance (30%)', amount: 'PKR 252,000', status: 'Pending' },
      { label: 'On Dispatch (40%)', amount: 'PKR 336,000', status: 'Pending' },
      { label: 'On Delivery (30%)', amount: 'PKR 252,000', status: 'Pending' },
    ],
  },
  'DEL-002': {
    id: 'DEL-002',
    commodity: 'IRRI-6 Rice',
    qty: '200 bags',
    rate: 'PKR 4,200 / 40kg',
    totalValue: 'PKR 84,000',
    trucks: '1 trucks · PKR — each',
    paymentTerms: 'Fixed full payment',
    deliveryOption: 'Delivered',
    deliveryTo: 'Lahore',
    mill: 'Sheikhupura Mill A',
    bilti: '—',
    date: 'Apr 2',
    statusLabel: 'In Transit',
    summary: '200 bags · PKR 84,000 · 1 trucks',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&q=80',
    fallback: '#8A9A5B',
    stages: [
      { label: 'Deal Created', status: 'done' },
      { label: 'Dispatch Prep', status: 'done' },
      { label: 'In Transit', status: 'current' },
      { label: 'Delivery', status: 'pending' },
      { label: 'Payment', status: 'pending' },
      { label: 'Complete', status: 'pending' },
    ],
    trucks_detail: [
      { id: 'TRK-002', number: 'FSD-5678', driver: 'Khalid Butt', status: 'In Transit', bags: '200' },
    ],
    payments: [
      { label: 'Advance (30%)', amount: 'PKR 25,200', status: 'Paid' },
      { label: 'On Dispatch (40%)', amount: 'PKR 33,600', status: 'Pending' },
      { label: 'On Delivery (30%)', amount: 'PKR 25,200', status: 'Pending' },
    ],
  },
  'DEL-003': {
    id: 'DEL-003',
    commodity: 'Desi Cotton',
    qty: '125 bags',
    rate: 'PKR 850 / 40kg',
    totalValue: 'PKR 106,250',
    trucks: '1 trucks',
    paymentTerms: 'Fixed full payment',
    deliveryOption: 'Delivered',
    deliveryTo: 'Faisalabad',
    mill: 'Multan Mill A',
    bilti: '—',
    date: 'Apr 5',
    statusLabel: 'Dispatch Preparation',
    summary: '125 bags · PKR 106,250 · 1 trucks',
    image: 'https://images.unsplash.com/photo-1594179047519-f347310d3322?w=900&q=80',
    fallback: '#D8D6C7',
    stages: [
      { label: 'Deal Created', status: 'done' },
      { label: 'Dispatch Prep', status: 'current' },
      { label: 'In Transit', status: 'pending' },
      { label: 'Delivery', status: 'pending' },
      { label: 'Payment', status: 'pending' },
      { label: 'Complete', status: 'pending' },
    ],
    trucks_detail: [
      { id: 'TRK-003', number: 'MTN-9012', driver: 'Usman Ali', status: 'Preparing', bags: '125' },
    ],
    payments: [
      { label: 'Advance (30%)', amount: 'PKR 31,875', status: 'Paid' },
      { label: 'On Dispatch (40%)', amount: 'PKR 42,500', status: 'Pending' },
      { label: 'On Delivery (30%)', amount: 'PKR 31,875', status: 'Pending' },
    ],
  },
  'DEL-004': {
    id: 'DEL-004',
    commodity: 'Yellow Maize',
    qty: '750 bags',
    rate: 'PKR 260 / 40kg',
    totalValue: 'PKR 195,000',
    trucks: '3 trucks',
    paymentTerms: 'Fixed full payment',
    deliveryOption: 'Delivered',
    deliveryTo: 'Karachi',
    mill: 'Okara Mill A',
    bilti: '—',
    date: 'Apr 8',
    statusLabel: 'Completed',
    summary: '750 bags · PKR 195,000 · 3 trucks',
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=900&q=80',
    fallback: '#DCA640',
    stages: [
      { label: 'Deal Created', status: 'done' },
      { label: 'Dispatch Prep', status: 'done' },
      { label: 'In Transit', status: 'done' },
      { label: 'Delivery', status: 'done' },
      { label: 'Payment', status: 'done' },
      { label: 'Complete', status: 'done' },
    ],
    trucks_detail: [
      { id: 'TRK-004', number: 'OKR-3456', driver: 'Imran Raza', status: 'Delivered', bags: '250' },
      { id: 'TRK-005', number: 'OKR-3457', driver: 'Naveed Gill', status: 'Delivered', bags: '250' },
      { id: 'TRK-006', number: 'OKR-3458', driver: 'Tariq Shah', status: 'Delivered', bags: '250' },
    ],
    payments: [
      { label: 'Advance (30%)', amount: 'PKR 58,500', status: 'Paid' },
      { label: 'On Dispatch (40%)', amount: 'PKR 78,000', status: 'Paid' },
      { label: 'On Delivery (30%)', amount: 'PKR 58,500', status: 'Paid' },
    ],
  },
};

const TABS = ['Summary', 'Trucks', 'Payment', 'Stages'] as const;
type TabType = (typeof TABS)[number];

const stageStyle = (status: string) => {
  if (status === 'done') return { bg: '#45B86A', border: '#7FD4A0', text: '#FFFFFF' };
  if (status === 'current') return { bg: '#F3CD03', border: '#F7DB4A', text: '#0D3B1F' };
  return { bg: 'rgba(0,0,0,0.08)', border: 'rgba(0,0,0,0.08)', text: '#9CA3AF' };
};

const SummaryRow = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <View style={styles.summaryRow}>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={[styles.summaryValue, highlight && styles.summaryValueHighlight]}>{value}</Text>
  </View>
);

const DealDetailScreen = ({ navigation, route }: Props) => {
  const { dealId } = route.params;
  const deal = DEALS[dealId] ?? DEALS['DEL-001'];
  const [activeTab, setActiveTab] = useState<TabType>('Summary');

  const renderSummary = () => (
    <View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Deal Summary</Text>
        <SummaryRow label="Deal ID" value={deal.id} />
        <SummaryRow label="Commodity" value={deal.commodity} />
        <SummaryRow label="Quantity" value={deal.qty} />
        <SummaryRow label="Rate" value={deal.rate} />
        <SummaryRow label="Total Value" value={deal.totalValue} highlight />
        <SummaryRow label="Trucks" value={deal.trucks} />
        <SummaryRow label="Payment Terms" value={deal.paymentTerms} />
        <SummaryRow label="Delivery Option" value={deal.deliveryOption} />
        <SummaryRow label="Delivery To" value={deal.deliveryTo} />
        <SummaryRow label="Mill" value={deal.mill} />
        <SummaryRow label="Company / Bilti" value={deal.bilti} />
        <SummaryRow label="Date" value={deal.date} />
      </View>

      <View style={styles.infoNote}>
        <View style={styles.infoNoteIcon}>
          <Text style={{ fontSize: 18 }}>✓</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.infoNoteTitle}>Naseeb Verified Deal</Text>
          <Text style={styles.infoNoteText}>
            This deal has been reviewed and verified by the Naseeb team. All parties are registered and KYC-cleared.
          </Text>
        </View>
      </View>
    </View>
  );

  const renderTrucks = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Trucks ({deal.trucks_detail.length})</Text>
      {deal.trucks_detail.map((truck: any, idx: number) => (
        <View
          key={truck.id}
          style={[styles.truckRow, idx < deal.trucks_detail.length - 1 && styles.truckRowBorder]}
        >
          <View style={styles.truckIconBox}>
            <Text style={{ fontSize: 18 }}>🚛</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.truckId}>{truck.id}</Text>
            <Text style={styles.truckNumber}>Reg: {truck.number}</Text>
            <Text style={styles.truckDriver}>Driver: {truck.driver}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View
              style={[
                styles.truckStatusBadge,
                truck.status === 'Delivered' ? styles.statusDone :
                truck.status === 'In Transit' ? styles.statusTransit :
                styles.statusPending,
              ]}
            >
              <Text
                style={[
                  styles.truckStatusText,
                  truck.status === 'Delivered' ? styles.statusDoneText :
                  truck.status === 'In Transit' ? styles.statusTransitText :
                  styles.statusPendingText,
                ]}
              >
                {truck.status}
              </Text>
            </View>
            <Text style={styles.truckBags}>{truck.bags} bags</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderPayment = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Payment Schedule</Text>
      {deal.payments.map((p: any, idx: number) => (
        <View
          key={idx}
          style={[styles.payRow, idx < deal.payments.length - 1 && styles.payRowBorder]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.payLabel}>{p.label}</Text>
            <Text style={styles.payAmount}>{p.amount}</Text>
          </View>
          <View
            style={[
              styles.payStatusBadge,
              p.status === 'Paid' ? styles.statusDone : styles.statusPending,
            ]}
          >
            <Text
              style={[
                styles.payStatusText,
                p.status === 'Paid' ? styles.statusDoneText : styles.statusPendingText,
              ]}
            >
              {p.status}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderStages = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Deal Stages</Text>
      {deal.stages.map((stage: any, idx: number) => {
        const s = stageStyle(stage.status);
        const isLast = idx === deal.stages.length - 1;
        return (
          <View key={stage.label} style={styles.stageItem}>
            <View style={styles.stageLeft}>
              <View style={[styles.stageDot, { backgroundColor: s.bg, borderColor: s.border }]}>
                {stage.status === 'done' && <Text style={styles.stageCheck}>✓</Text>}
                {stage.status === 'current' && <View style={styles.stagePulse} />}
              </View>
              {!isLast && <View style={[styles.stageLine, { backgroundColor: stage.status === 'done' ? '#45B86A' : '#E5E7EB' }]} />}
            </View>
            <View style={[styles.stageContent, !isLast && { paddingBottom: 20 }]}>
              <Text
                style={[
                  styles.stageLabel,
                  stage.status === 'current' && styles.stageLabelCurrent,
                  stage.status === 'done' && styles.stageLabelDone,
                ]}
              >
                {stage.label}
              </Text>
              {stage.status === 'current' && (
                <Text style={styles.stageActive}>In progress</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        <ImageBackground
          source={{ uri: deal.image }}
          style={styles.heroImage}
          resizeMode="cover"
          imageStyle={{ backgroundColor: deal.fallback }}
        >
          <View style={styles.heroOverlay} />

          {/* Back button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          {/* Status badge */}
          <View style={styles.statusTopBadge}>
            <Text style={styles.statusTopLabel}>STATUS</Text>
            <Text style={styles.statusTopValue}>{deal.statusLabel}</Text>
          </View>

          {/* Product info */}
          <View style={styles.heroBottom}>
            <Text style={styles.heroId}>{deal.id}</Text>
            <Text style={styles.heroName}>{deal.commodity}</Text>
            <Text style={styles.heroSummary}>{deal.summary}</Text>
          </View>
        </ImageBackground>
      </View>

      {/* Tab bar */}
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
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab === 'Trucks' ? `Trucks (${deal.trucks_detail.length})` : tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'Summary' && renderSummary()}
        {activeTab === 'Trucks' && renderTrucks()}
        {activeTab === 'Payment' && renderPayment()}
        {activeTab === 'Stages' && renderStages()}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Bottom action bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.negotiateBtn} activeOpacity={0.85}>
          <Text style={styles.negotiateBtnText}>Negotiate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.disputeBtn} activeOpacity={0.85}>
          <Text style={styles.disputeBtnText}>Raise Dispute</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  hero: { height: 140, flexShrink: 0, overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.52)',
  },
  backBtn: {
    position: 'absolute',
    top: 44,
    left: 14,
    zIndex: 3,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    padding: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: 18, color: '#FFFFFF', lineHeight: 20 },
  statusTopBadge: {
    position: 'absolute',
    top: 44,
    right: 14,
    zIndex: 3,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusTopLabel: { fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.5 },
  statusTopValue: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  heroBottom: { position: 'absolute', bottom: 12, left: 16, right: 80, zIndex: 3 },
  heroId: { fontSize: 9, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', marginBottom: 2 },
  heroName: { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },
  heroSummary: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexShrink: 0,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: '#217A3C' },
  tabLabel: { fontSize: 11, fontWeight: '500', color: '#6B7280' },
  tabLabelActive: { fontWeight: '700', color: '#1A6B34' },
  scrollContent: { padding: 14, paddingBottom: 20 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 10 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  summaryLabel: { fontSize: 12, color: '#6B7280' },
  summaryValue: { fontSize: 12, fontWeight: '600', color: '#111827' },
  summaryValueHighlight: { fontSize: 14, fontWeight: '800', color: '#1A6B34' },
  infoNote: {
    backgroundColor: '#F2FBF5',
    borderWidth: 1.5,
    borderColor: '#7FD4A0',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    gap: 11,
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  infoNoteIcon: {
    width: 38,
    height: 38,
    backgroundColor: '#217A3C',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoNoteTitle: { fontSize: 13, fontWeight: '700', color: '#1A6B34', marginBottom: 4 },
  infoNoteText: { fontSize: 12, color: '#374151', lineHeight: 18 },
  truckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  truckRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  truckIconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#F2FBF5',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  truckId: { fontSize: 12, fontWeight: '700', color: '#111827' },
  truckNumber: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  truckDriver: { fontSize: 11, color: '#6B7280' },
  truckStatusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 4 },
  truckStatusText: { fontSize: 11, fontWeight: '700' },
  truckBags: { fontSize: 11, color: '#6B7280' },
  statusDone: { backgroundColor: '#F2FBF5' },
  statusDoneText: { color: '#1A6B34' },
  statusTransit: { backgroundColor: '#EEF6FF' },
  statusTransitText: { color: '#3B82F6' },
  statusPending: { backgroundColor: '#F3F4F6' },
  statusPendingText: { color: '#6B7280' },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  payRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  payLabel: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  payAmount: { fontSize: 13, fontWeight: '700', color: '#111827' },
  payStatusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  payStatusText: { fontSize: 11, fontWeight: '700' },
  stageItem: { flexDirection: 'row' },
  stageLeft: { width: 28, alignItems: 'center' },
  stageDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stageCheck: { fontSize: 11, color: '#FFFFFF', fontWeight: '700' },
  stagePulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0D3B1F' },
  stageLine: { flex: 1, width: 2, marginTop: 2 },
  stageContent: { flex: 1, paddingLeft: 10, paddingBottom: 4 },
  stageLabel: { fontSize: 13, color: '#374151', fontWeight: '500' },
  stageLabelCurrent: { fontWeight: '700', color: '#1A6B34' },
  stageLabelDone: { color: '#9CA3AF' },
  stageActive: { fontSize: 11, color: '#F3CD03', fontWeight: '600', marginTop: 2 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  negotiateBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1A6B3499',
  },
  negotiateBtnText: { fontSize: 13, fontWeight: '700', color: '#1A6B34' },
  disputeBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EF444499',
  },
  disputeBtnText: { fontSize: 13, fontWeight: '700', color: '#EF4444' },
});

export default DealDetailScreen;
