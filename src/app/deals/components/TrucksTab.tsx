import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export interface Truck {
  id: string;
  truck_number: string;
  driver_name?: string | null;
  status: string;
  dispatched_at?: string | null;
  delivered_at?: string | null;
}

const TRUCK_STATUS: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  registered: { label: 'Registered', bg: '#F3F4F6', text: '#6B7280' },
  dispatched: { label: 'Dispatched', bg: '#EEF6FF', text: '#3B82F6' },
  delivered: { label: 'Delivered', bg: '#F2FBF5', text: '#1A6B34' },
};

const formatPKR = (n: number) =>
  'PKR ' + Math.round(Number(n)).toLocaleString('en-PK');

interface Props {
  trucks: Truck[];
  deal: {
    total_amount: number;
    offer?: { payment_term_type?: string | null };
  };
  mode: 'buyer' | 'seller';
  onAddTruck: () => void;
}

const TrucksTab: React.FC<Props> = ({ trucks, deal, mode, onAddTruck }) => {
  const total = trucks.length;
  const dispatched = trucks.filter(
    t => t.status === 'dispatched' || t.status === 'delivered',
  ).length;
  const delivered = trucks.filter(t => t.status === 'delivered').length;
  const totalAmount = Number(deal.total_amount ?? 0);
  const perTruck = total > 0 ? Math.round(totalAmount / total) : null;
  const paymentLabel =
    deal.offer?.payment_term_type
      ? deal.offer.payment_term_type.charAt(0).toUpperCase() +
        deal.offer.payment_term_type.slice(1).toLowerCase()
      : '—';

  return (
    <View>
      <View style={s.header}>
        <View style={s.headerTopRow}>
          <Text style={s.headerTotal}>
            {total} Truck{total !== 1 ? 's' : ''} · {formatPKR(totalAmount)}
          </Text>
          <View style={s.perTruckBadge}>
            <Text style={s.perTruckText}>
              {perTruck ? formatPKR(perTruck) : 'PKR ∞'} / truck
            </Text>
          </View>
        </View>
        <View style={s.statsRow}>
          <View>
            <Text style={s.statLabel}>DISPATCHED</Text>
            <Text style={s.statValue}>
              {dispatched}/{total}
            </Text>
          </View>
          <View style={s.statDivider} />
          <View>
            <Text style={s.statLabel}>DELIVERED</Text>
            <Text style={s.statValue}>
              {delivered}/{total}
            </Text>
          </View>
          <View style={s.statDivider} />
          <View>
            <Text style={s.statLabel}>PAYMENT</Text>
            <Text style={s.statValue}>{paymentLabel}</Text>
          </View>
        </View>
      </View>

      {trucks.length === 0 ? (
        <Text style={s.empty}>No trucks added yet.</Text>
      ) : (
        trucks.map(truck => {
          const ts = TRUCK_STATUS[truck.status] ?? TRUCK_STATUS.registered;
          return (
            <View key={truck.id} style={s.truckRow}>
              <View style={s.truckIconBox}>
                <Text style={s.truckEmoji}>🚛</Text>
              </View>
              <View style={s.truckInfo}>
                <Text style={s.truckNumber}>{truck.truck_number}</Text>
                {truck.driver_name ? (
                  <Text style={s.truckDriver}>Driver: {truck.driver_name}</Text>
                ) : null}
              </View>
              <View style={[s.truckBadge, { backgroundColor: ts.bg }]}>
                <Text style={[s.truckBadgeText, { color: ts.text }]}>
                  {ts.label}
                </Text>
              </View>
            </View>
          );
        })
      )}

      {mode === 'seller' && (
        <TouchableOpacity
          style={s.addBtn}
          onPress={onAddTruck}
          activeOpacity={0.85}
        >
          <Text style={s.addBtnText}>+ Add Another Truck</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  header: {
    backgroundColor: '#145228',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTotal: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
  perTruckBadge: {
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  perTruckText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.53)',
  },
  statsRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.13)',
  },
  statLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.33)',
    marginBottom: 2,
  },
  statValue: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  empty: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 24,
  },
  truckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    gap: 12,
  },
  truckIconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#F2FBF5',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  truckEmoji: { fontSize: 18 },
  truckInfo: { flex: 1 },
  truckNumber: { fontSize: 13, fontWeight: '700', color: '#111827' },
  truckDriver: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  truckBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  truckBadgeText: { fontSize: 11, fontWeight: '700' },
  addBtn: {
    borderWidth: 1.5,
    borderColor: '#45B86A',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
  },
  addBtnText: { fontSize: 13, fontWeight: '700', color: '#1A6B34' },
});

export default TrucksTab;
