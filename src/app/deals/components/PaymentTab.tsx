import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface PaymentReceipt {
  id: string;
  amount: number;
  status: string;
  signed_url?: string | null;
}

export interface Payment {
  id: string;
  amount: number;
  amount_type: string;
  created_at: string;
  receipts?: PaymentReceipt[];
}

export interface PaymentSummaryData {
  total_amount?: number;
  total_payable?: number;
  total_paid?: number;
  total_received?: number;
  remaining?: number;
  payments?: Payment[];
}

const formatPKR = (n: number) =>
  'PKR ' + Math.round(Number(n)).toLocaleString('en-PK');

const getReceiptStatus = (
  p: Payment,
): { label: string; bg: string; text: string; icon: string } => {
  const receipts = p.receipts ?? [];
  if (receipts.length === 0)
    return { label: 'Pending', bg: '#F3F4F6', text: '#6B7280', icon: '?' };
  const verified = receipts.find(
    r => r.status === 'verified' || r.status === 'approved',
  );
  if (verified)
    return {
      label: 'Verified',
      bg: '#E8F7EE',
      text: '#1A6B34',
      icon: '✓',
    };
  return {
    label: 'In Verification',
    bg: '#FEF3C7',
    text: '#92400E',
    icon: '⏱',
  };
};

interface Props {
  paymentSummary: PaymentSummaryData | null;
  mode: 'buyer' | 'seller';
  onAddPayment: () => void;
}

const PaymentTab: React.FC<Props> = ({ paymentSummary, mode, onAddPayment }) => {
  if (!paymentSummary) {
    return <Text style={s.empty}>No payment data.</Text>;
  }

  const total =
    mode === 'buyer'
      ? Number(paymentSummary.total_amount ?? 0)
      : Number(paymentSummary.total_payable ?? 0);
  const received = Number(
    paymentSummary.total_paid ?? paymentSummary.total_received ?? 0,
  );
  const remaining = Number(
    paymentSummary.remaining ?? Math.max(0, total - received),
  );
  const pct = total > 0 ? Math.min(Math.round((received / total) * 100), 100) : 0;
  const payments = paymentSummary.payments ?? [];

  return (
    <View>
      <View style={s.progressCard}>
        <View style={s.progressTop}>
          <View>
            <Text style={s.progressLabel}>PAYMENT PROGRESS</Text>
            <Text style={s.progressAmount}>{formatPKR(received)}</Text>
            <Text style={s.progressTotal}>of {formatPKR(total)} total</Text>
          </View>
          <View style={s.pctBox}>
            <Text style={s.pctText}>{pct}%</Text>
            <Text style={s.pctLabel}>paid</Text>
          </View>
        </View>
        <View style={s.barBg}>
          <View style={[s.barFill, { width: `${pct}%` as any }]} />
        </View>
        <View style={s.progressFooter}>
          <Text style={s.progressFooterText}>
            {formatPKR(received)} received
          </Text>
          <Text style={s.progressFooterText}>
            {formatPKR(remaining)} remaining
          </Text>
        </View>
      </View>

      {mode === 'buyer' && (
        <View style={s.allocationCard}>
          <Text style={s.allocationTitle}>🚛  Truck Payment Allocation</Text>
          <Text style={s.allocationText}>
            Payments fill trucks sequentially — first truck gets paid fully
            before the next.
          </Text>
        </View>
      )}

      {payments.length > 0 && (
        <View style={s.historyCard}>
          <Text style={s.historyTitle}>Payment History</Text>
          {payments.map(p => {
            const rs = getReceiptStatus(p);
            return (
              <View key={p.id} style={s.payRow}>
                <View style={[s.payIconBox, { backgroundColor: rs.bg }]}>
                  <Text style={[s.payIconText, { color: rs.text }]}>
                    {rs.icon}
                  </Text>
                </View>
                <View style={s.payInfo}>
                  <Text style={s.payAmount}>{formatPKR(Number(p.amount))}</Text>
                  <Text style={s.payDate}>
                    {new Date(p.created_at).toLocaleDateString('en-PK', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Text>
                </View>
                <View style={[s.payBadge, { backgroundColor: rs.bg }]}>
                  <Text style={[s.payBadgeText, { color: rs.text }]}>
                    {rs.label}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {payments.length === 0 && (
        <Text style={s.emptyHistory}>No payments recorded yet.</Text>
      )}

      {mode === 'buyer' && (
        <TouchableOpacity
          style={s.addPayBtn}
          onPress={onAddPayment}
          activeOpacity={0.85}
        >
          <View style={s.addPayIconBox}>
            <Text style={s.addPayPlusIcon}>+</Text>
          </View>
          <Text style={s.addPayBtnText}>Add Payment</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  empty: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 24,
  },
  emptyHistory: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 16,
  },
  progressCard: {
    backgroundColor: '#145228',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 4,
  },
  progressAmount: { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
  progressTotal: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  pctBox: { alignItems: 'flex-end' },
  pctText: { fontSize: 28, fontWeight: '900', color: '#F7DB4A' },
  pctLabel: { fontSize: 10, color: 'rgba(255,255,255,0.4)' },
  barBg: {
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 6,
    height: 7,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#F7DB4A',
    borderRadius: 6,
  },
  progressFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  progressFooterText: { fontSize: 10, color: 'rgba(255,255,255,0.4)' },
  allocationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  allocationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  allocationText: { fontSize: 11, color: '#9CA3AF', lineHeight: 16 },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2FBF5',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    gap: 12,
  },
  payIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  payIconText: { fontSize: 16, fontWeight: '900' },
  payInfo: { flex: 1 },
  payAmount: { fontSize: 13, fontWeight: '700', color: '#111827' },
  payDate: { fontSize: 10, color: '#6B7280', marginTop: 2 },
  payBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  payBadgeText: { fontSize: 10, fontWeight: '700' },
  addPayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3CD03',
    borderRadius: 14,
    paddingVertical: 15,
    gap: 10,
    shadowColor: '#F3CD03',
    shadowOpacity: 0.33,
    shadowRadius: 14,
    elevation: 4,
  },
  addPayIconBox: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPayPlusIcon: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0D3B1F',
    lineHeight: 26,
  },
  addPayBtnText: { fontSize: 14, fontWeight: '700', color: '#0D3B1F' },
});

export default PaymentTab;
