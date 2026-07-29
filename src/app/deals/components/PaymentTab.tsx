import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  launchImageLibrary,
  type ImagePickerResponse,
} from 'react-native-image-picker';
import api from '../../../utils/api';
import DocumentViewerModal from './DocumentViewerModal';

interface ReceiptFile {
  uri: string;
  type: string;
  name: string;
}

export interface Payment {
  id: string;
  public_id?: string;
  amount: number;
  amount_type: string;
  status: string;
  s3_key?: string | null;
  signed_url?: string | null;
  created_at: string;
}

export interface PaymentSummaryData {
  deal_status?: string | null;
  // buyer fields
  total_amount?: number;
  buyer_commission_amount?: number;
  total_owed?: number;
  total_paid?: number;
  // seller fields
  seller_commission_amount?: number;
  payable_to_seller?: number;
  total_freight?: number;
  effective_payable?: number;
  total_received?: number;
  // shared
  remaining?: number;
  payments?: Payment[];
}

interface Props {
  dealId: string;
  mode: 'buyer' | 'seller';
}

const formatPKR = (n: number) =>
  'PKR ' + Math.round(Number(n)).toLocaleString('en-PK');

const getReceiptStatus = (
  p: Payment,
): {
  label: string;
  rowBg: string;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
  icon: string;
  borderColor?: string;
} => {
  if (p.status === 'verified')
    return {
      label: 'Verified',
      rowBg: '#F2FBF5',
      iconBg: '#217A3C',
      iconColor: '#FFFFFF',
      badgeBg: '#E8F7EE',
      badgeText: '#1A6B34',
      icon: '✓',
    };
  if (p.status === 'rejected')
    return {
      label: 'Rejected',
      rowBg: '#FFF1F2',
      iconBg: '#EF4444',
      iconColor: '#FFFFFF',
      badgeBg: '#FEE2E2',
      badgeText: '#991B1B',
      icon: '✕',
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

const PaymentTab: React.FC<Props> = ({ dealId, mode }) => {
  const [paymentSummary, setPaymentSummary] =
    useState<PaymentSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [receipt, setReceipt] = useState<ReceiptFile | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [docViewer, setDocViewer] = useState<{ url: string; name: string } | null>(null);

  const loadPayments = useCallback(async () => {
    try {
      const res: any =
        mode === 'buyer'
          ? await api.buyer.getPayments(dealId)
          : await api.seller.getDealPayments(dealId);
      console.log('Payment api reponse added :', res);
      if (res) setPaymentSummary(res);
    } catch {
      // keep existing
    } finally {
      setLoading(false);
    }
  }, [dealId, mode]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  }, [loadPayments]);

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

  const handleSubmit = async () => {
    if (Number(amount) <= 0 || submitting) return;
    if (!receipt) {
      Alert.alert('Receipt Required', 'Please upload a payment receipt before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('amount', String(amount));
      form.append('file', {
        uri: receipt.uri,
        type: receipt.type,
        name: receipt.name,
      } as any);
      await api.buyer.addPayment(dealId, form);
      setAmount('');
      setReceipt(null);
      setShowModal(false);
      await loadPayments();
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? 'Failed to submit payment.';
      Alert.alert('Payment Failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setAmount('');
    setReceipt(null);
    setShowModal(false);
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#217A3C" />
      </View>
    );
  }

  if (!paymentSummary) {
    return (
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#217A3C"
            colors={['#217A3C']}
          />
        }
      >
        <Text style={s.empty}>No payment data.</Text>
      </ScrollView>
    );
  }

  const dealAmount = Number(paymentSummary.total_amount ?? 0);
  const total =
    mode === 'buyer'
      ? Number(paymentSummary.total_owed ?? dealAmount)
      : Number(paymentSummary.effective_payable ?? paymentSummary.payable_to_seller ?? 0);
  const received = Number(
    paymentSummary.total_paid ?? paymentSummary.total_received ?? 0,
  );
  const remaining = Number(
    paymentSummary.remaining ?? Math.max(0, total - received),
  );
  const pct =
    total > 0 ? Math.min(Math.round((received / total) * 100), 100) : 0;

  // Buyer breakdown
  const buyerCommission = Number(paymentSummary.buyer_commission_amount ?? 0);
  // Seller breakdown
  const sellerCommission = Number(paymentSummary.seller_commission_amount ?? 0);
  const payableToSeller = Number(paymentSummary.payable_to_seller ?? 0);
  const totalFreight = Number(paymentSummary.total_freight ?? 0);
  const payments = paymentSummary.payments ?? [];
  const isCompleted = paymentSummary.deal_status === 'closed';
  const canSubmit = Number(amount) > 0 && !!receipt;

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

      {/* Amount breakdown card */}
      <View style={s.breakdownCard}>
        <Text style={s.breakdownTitle}>Amount Breakdown</Text>

        {mode === 'buyer' ? (
          <>
            <View style={s.breakdownRow}>
              <Text style={s.breakdownLabel}>Deal Amount</Text>
              <Text style={s.breakdownValue}>{formatPKR(dealAmount)}</Text>
            </View>
            <View style={s.breakdownRow}>
              <Text style={s.breakdownLabel}>Commission</Text>
              <Text style={s.breakdownValue}>+ {formatPKR(buyerCommission)}</Text>
            </View>
            <View style={s.breakdownDivider} />
            <View style={s.breakdownRow}>
              <Text style={s.breakdownTotalLabel}>Total Owed</Text>
              <Text style={s.breakdownTotalValue}>{formatPKR(total)}</Text>
            </View>
          </>
        ) : (
          <>
            <View style={s.breakdownRow}>
              <Text style={s.breakdownLabel}>Deal Amount</Text>
              <Text style={s.breakdownValue}>{formatPKR(dealAmount)}</Text>
            </View>
            <View style={s.breakdownRow}>
              <Text style={s.breakdownLabel}>Commission</Text>
              <Text style={[s.breakdownValue, s.breakdownRed]}>- {formatPKR(sellerCommission)}</Text>
            </View>
            <View style={s.breakdownDivider} />
            <View style={s.breakdownRow}>
              <Text style={s.breakdownLabel}>Payable to You</Text>
              <Text style={s.breakdownValue}>{formatPKR(payableToSeller)}</Text>
            </View>
            {totalFreight > 0 && (
              <View style={s.breakdownRow}>
                <Text style={s.breakdownLabel}>Freight (deducted)</Text>
                <Text style={[s.breakdownValue, s.breakdownRed]}>- {formatPKR(totalFreight)}</Text>
              </View>
            )}
            {totalFreight > 0 && (
              <>
                <View style={s.breakdownDivider} />
                <View style={s.breakdownRow}>
                  <Text style={s.breakdownTotalLabel}>Net Payable</Text>
                  <Text style={s.breakdownTotalValue}>{formatPKR(total)}</Text>
                </View>
              </>
            )}
          </>
        )}
      </View>

      {/* Truck payment allocation info */}
      <View style={s.allocationCard}>
        <Text style={s.allocationTitle}>🚛 Truck Payment Allocation</Text>
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
                  {p.signed_url && (
                    <TouchableOpacity
                      onPress={() => {
                        const ext = p.s3_key ? p.s3_key.split('.').pop() ?? '' : '';
                        const label = mode === 'buyer' ? 'Payment Receipt' : 'Payment Proof';
                        setDocViewer({
                          url: p.signed_url!,
                          name: ext ? `${label}.${ext}` : label,
                        });
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={s.viewReceiptBtn}>
                        📎 {mode === 'buyer' ? 'View Receipt' : 'View Proof'}
                      </Text>
                    </TouchableOpacity>
                  )}
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

      {mode === 'seller' && (
        <View style={s.releasesCard}>
          <Text style={s.releasesTitle}>💰 Payment Releases</Text>
          <Text style={s.releasesText}>
            Payments are released to you after each truck delivery is verified.
            Contact admin if a release is overdue.
          </Text>
        </View>
      )}

      {mode === 'buyer' && !isCompleted && (
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

      {isCompleted && (
        <View style={s.completedNotice}>
          <Text style={s.completedNoticeIcon}>✓</Text>
          <Text style={s.completedNoticeText}>Deal completed — no more payments accepted.</Text>
        </View>
      )}

      <View style={s.bottomSpacer} />

      <DocumentViewerModal
        visible={!!docViewer}
        url={docViewer?.url ?? null}
        fileName={docViewer?.name ?? ''}
        onClose={() => setDocViewer(null)}
      />

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
            behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          >
            <View style={s.paySheet}>
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

              <View style={s.paySheetBody}>
                <Text style={s.payFieldLabel}>
                  Payment Amount (PKR) <Text style={s.required}>*</Text>
                </Text>
                <View style={s.amountWrap}>
                  <Text style={s.rupeeSymbol}>₨</Text>
                  <TextInput
                    style={s.amountInput}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    value={amount}
                    onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ''))}
                    autoFocus
                  />
                </View>

                <Text style={[s.payFieldLabel, { marginTop: 14 }]}>
                  Payment Receipt <Text style={s.required}>*</Text>
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
    </ScrollView>
  );
};

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: { padding: 14 },
  bottomSpacer: { height: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  progressTotal: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
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
  barFill: { height: '100%', backgroundColor: '#F7DB4A', borderRadius: 6 },
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
  releasesText: {
    fontSize: 11,
    color: '#1A6B34',
    opacity: 0.8,
    lineHeight: 16,
  },

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

  overlay: { flex: 1, justifyContent: 'flex-end' },
  overlayBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

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
  payHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
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
  paySheetBody: { padding: 20, paddingBottom: 32 },
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
  payFooter: { flexDirection: 'row', gap: 10, marginTop: 16 },
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

  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  breakdownTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  breakdownLabel: { fontSize: 12, color: '#6B7280' },
  breakdownValue: { fontSize: 12, fontWeight: '600', color: '#111827' },
  breakdownDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 6,
  },
  breakdownTotalLabel: { fontSize: 13, fontWeight: '700', color: '#111827' },
  breakdownTotalValue: { fontSize: 13, fontWeight: '800', color: '#217A3C' },
  breakdownRed: { color: '#EF4444' },

  completedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F2FBF5',
    borderWidth: 1.5,
    borderColor: '#7FD4A0',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  completedNoticeIcon: { fontSize: 18, color: '#217A3C', fontWeight: '900' },
  completedNoticeText: { fontSize: 13, fontWeight: '600', color: '#1A6B34' },
  viewReceiptBtn: { fontSize: 11, fontWeight: '600', color: '#2563EB', marginTop: 4 },
});

export default PaymentTab;
