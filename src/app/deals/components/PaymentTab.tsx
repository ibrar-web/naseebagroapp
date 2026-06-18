import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  launchImageLibrary,
  type ImagePickerResponse,
} from 'react-native-image-picker';

interface ReceiptFile {
  uri: string;
  type: string;
  name: string;
}

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
): { label: string; rowBg: string; iconBg: string; iconColor: string; badgeBg: string; badgeText: string; icon: string; borderColor?: string } => {
  const receipts = p.receipts ?? [];
  if (receipts.length === 0)
    return {
      label: 'Pending',
      rowBg: '#FFFFFF',
      iconBg: '#F3F4F6',
      iconColor: '#6B7280',
      badgeBg: '#F3F4F6',
      badgeText: '#6B7280',
      icon: '?',
    };
  const verified = receipts.find(
    r => r.status === 'verified' || r.status === 'approved',
  );
  if (verified)
    return {
      label: 'Verified',
      rowBg: '#F2FBF5',
      iconBg: '#217A3C',
      iconColor: '#FFFFFF',
      badgeBg: '#E8F7EE',
      badgeText: '#1A6B34',
      icon: '✓',
    };
  return {
    label: 'In Verification',
    rowBg: '#FFFDE6',
    iconBg: '#F3CD03',
    iconColor: '#0D3B1F',
    badgeBg: '#FEF3C7',
    badgeText: '#92400E',
    icon: '⏱',
    borderColor: '#FCD34D',
  };
};

interface Props {
  paymentSummary: PaymentSummaryData | null;
  mode: 'buyer' | 'seller';
  onAddPayment: (amount: number, receipt?: ReceiptFile) => Promise<void>;
}

const PaymentTab: React.FC<Props> = ({ paymentSummary, mode, onAddPayment }) => {
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [receipt, setReceipt] = useState<ReceiptFile | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const pickReceipt = () => {
    launchImageLibrary(
      { mediaType: 'mixed', quality: 1, includeBase64: false },
      (res: ImagePickerResponse) => {
        if (res.didCancel || res.errorCode) return;
        const asset = res.assets?.[0];
        if (!asset?.uri) return;
        setReceipt({
          uri: asset.uri,
          type: asset.type ?? 'image/jpeg',
          name: asset.fileName ?? 'receipt.jpg',
        });
      },
    );
  };

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

  const canSubmit = Number(amount) > 0;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      await onAddPayment(Number(amount), receipt ?? undefined);
      setAmount('');
      setReceipt(null);
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setAmount('');
    setReceipt(null);
    setShowModal(false);
  };

  return (
    <View>
      {/* Progress card */}
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

      {/* Truck payment allocation info */}
      <View style={s.allocationCard}>
        <Text style={s.allocationTitle}>🚛  Truck Payment Allocation</Text>
        <Text style={s.allocationText}>
          Payments fill trucks sequentially — first truck gets paid fully before
          the next.
        </Text>
      </View>

      {/* Payment history */}
      {payments.length > 0 && (
        <View style={s.historyCard}>
          <Text style={s.historyTitle}>Payment History</Text>
          {payments.map(p => {
            const rs = getReceiptStatus(p);
            return (
              <View
                key={p.id}
                style={[
                  s.payRow,
                  { backgroundColor: rs.rowBg },
                  rs.borderColor
                    ? { borderWidth: 1, borderColor: rs.borderColor }
                    : undefined,
                ]}
              >
                <View style={[s.payIconBox, { backgroundColor: rs.iconBg }]}>
                  <Text style={[s.payIconText, { color: rs.iconColor }]}>
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
                <View style={[s.payBadge, { backgroundColor: rs.badgeBg }]}>
                  <Text style={[s.payBadgeText, { color: rs.badgeText }]}>
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

      {/* Seller: payment releases info card */}
      {mode === 'seller' && (
        <View style={s.releasesCard}>
          <Text style={s.releasesTitle}>💰  Payment Releases</Text>
          <Text style={s.releasesText}>
            Payments are released to you after each truck delivery is verified.
            Contact admin if a release is overdue.
          </Text>
        </View>
      )}

      {/* Buyer: add payment button */}
      {mode === 'buyer' && (
        <TouchableOpacity
          style={s.addPayBtn}
          onPress={() => setShowModal(true)}
          activeOpacity={0.85}
        >
          <View style={s.addPayIconBox}>
            <Text style={s.addPayPlusIcon}>+</Text>
          </View>
          <Text style={s.addPayBtnText}>Add Payment</Text>
        </TouchableOpacity>
      )}

      {/* Add Payment bottom-sheet modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={s.overlay}>
          <TouchableOpacity
            style={s.overlayBg}
            onPress={handleCloseModal}
            activeOpacity={1}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={s.paySheet}>
              {/* Dark green header */}
              <View style={s.paySheetHeader}>
                <View style={s.payDragHandle} />
                <View style={s.payHeaderRow}>
                  <View style={s.payHeaderIconBox}>
                    <Text style={s.payHeaderIcon}>💳</Text>
                  </View>
                  <View style={s.payHeaderText}>
                    <Text style={s.paySheetTitle}>Add Payment</Text>
                    <Text style={s.paySheetRemaining}>
                      Remaining: {formatPKR(remaining)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Content */}
              <View style={s.paySheetBody}>
                <Text style={s.payFieldLabel}>
                  Payment Amount (PKR){' '}
                  <Text style={s.required}>*</Text>
                </Text>
                <View style={s.amountWrap}>
                  <Text style={s.rupeeSymbol}>₨</Text>
                  <TextInput
                    style={s.amountInput}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                    autoFocus
                  />
                </View>

                <Text style={[s.payFieldLabel, { marginTop: 14 }]}>
                  Payment Receipt{' '}
                  <Text style={s.payFieldSubLabel}>(optional)</Text>
                </Text>
                <TouchableOpacity
                  style={[s.uploadArea, receipt && s.uploadAreaDone]}
                  onPress={pickReceipt}
                  activeOpacity={0.8}
                >
                  <Text style={s.uploadIcon}>{receipt ? '✓' : '☁'}</Text>
                  <Text style={[s.uploadTitle, receipt && s.uploadTitleDone]}>
                    {receipt ? receipt.name : 'Upload Receipt'}
                  </Text>
                  <Text style={s.uploadSub}>
                    {receipt
                      ? 'Tap to change'
                      : 'Screenshot, PDF or photo of the receipt'}
                  </Text>
                </TouchableOpacity>

                <View style={s.infoNote}>
                  <Text style={s.infoText}>
                    ℹ️ Payment will be reviewed by the Naseeb team within 2–4
                    hours after submission.
                  </Text>
                </View>

                <View style={s.payFooter}>
                  <TouchableOpacity
                    style={s.cancelPayBtn}
                    onPress={handleCloseModal}
                    activeOpacity={0.75}
                  >
                    <Text style={s.cancelPayBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      s.submitPayBtn,
                      !canSubmit && s.submitPayBtnDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={!canSubmit || submitting}
                    activeOpacity={0.85}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text
                        style={[
                          s.submitPayBtnText,
                          !canSubmit && s.submitPayBtnTextDisabled,
                        ]}
                      >
                        Submit Payment
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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

  // Progress card
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

  // Allocation card
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

  // Payment history
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

  // Releases card (seller)
  releasesCard: {
    backgroundColor: '#F2FBF5',
    borderWidth: 1.5,
    borderColor: '#7FD4A0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  releasesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#145228',
    marginBottom: 6,
  },
  releasesText: { fontSize: 11, color: '#1A6B34', opacity: 0.8, lineHeight: 16 },

  // Add payment button (buyer)
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

  // Modal overlay
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  // Payment bottom sheet
  paySheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  paySheetHeader: {
    backgroundColor: '#145228',
    paddingTop: 14,
    paddingBottom: 18,
    paddingHorizontal: 20,
  },
  payDragHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  payHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  payHeaderIconBox: {
    width: 44,
    height: 44,
    backgroundColor: '#F3CD03',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payHeaderIcon: { fontSize: 20 },
  payHeaderText: { flex: 1 },
  paySheetTitle: { fontSize: 17, fontWeight: '800', color: '#FFFFFF' },
  paySheetRemaining: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  paySheetBody: {
    padding: 20,
    paddingBottom: 32,
  },
  payFieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: { color: '#EF4444' },
  amountWrap: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  rupeeSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
    paddingLeft: 14,
    paddingRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    paddingVertical: 14,
    paddingRight: 14,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 4,
  },
  uploadAreaDone: {
    borderColor: '#7FD4A0',
    backgroundColor: '#F2FBF5',
    borderStyle: 'solid',
  },
  uploadIcon: { fontSize: 24, color: '#9CA3AF' },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginTop: 4,
  },
  uploadTitleDone: { color: '#1A6B34' },
  uploadSub: { fontSize: 11, color: '#9CA3AF' },
  payFieldSubLabel: { fontSize: 11, fontWeight: '400', color: '#9CA3AF' },
  infoNote: {
    backgroundColor: '#EEF6FF',
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    marginBottom: 4,
  },
  infoText: { fontSize: 11, color: '#3B82F6', lineHeight: 16 },
  payFooter: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  cancelPayBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  cancelPayBtnText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  submitPayBtn: {
    flex: 2,
    backgroundColor: '#217A3C',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  submitPayBtnDisabled: { backgroundColor: '#E5E7EB' },
  submitPayBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  submitPayBtnTextDisabled: { color: '#9CA3AF' },
});

export default PaymentTab;
