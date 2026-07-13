import React, { useCallback, useEffect, useState } from 'react';
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
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../../utils/api';

// Keep exporting the types so navigation / other screens can still import them
export interface Truck {
  id: string;
  truck_number: string;
  driver_name?: string | null;
  status: string;
  dispatched_at?: string | null;
  delivered_at?: string | null;
}

export interface DealSummaryData {
  deal_id: string;
  code: string | null;
  status: string;
  buyer_company_name?: string | null;
  total_amount: number;
  payable_to_seller?: number | null;
  has_rated?: boolean;
  created_at: string;
  commodity?: { id: string; name: string; image_url?: string | null } | null;
  offer?: {
    quantity?: number;
    price_per_unit?: number;
    payment_term_type?: string | null;
    delivery_days?: number | null;
    delivery_location?: string | null;
    mill_name?: string | null;
  };
}

interface Props {
  dealId: string;
  mode: 'buyer' | 'seller';
}

const STAGE_MSG: Record<string, { title: string; desc: string }> = {
  matched: { title: 'Deal Created', desc: 'Waiting for dispatch' },
  open: { title: 'In Progress', desc: 'Deal is being fulfilled' },
  closed: { title: 'Deal Complete', desc: 'All stages completed successfully' },
  cancelled: { title: 'Cancelled', desc: 'This deal was cancelled' },
  disputed: { title: 'Disputed', desc: 'Under review by admin' },
};

const formatPKR = (n: number) =>
  'PKR ' + Math.round(Number(n)).toLocaleString('en-PK');

const Row = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <View style={s.row}>
    <Text style={s.rowLabel}>{label}</Text>
    <Text style={[s.rowValue, highlight && s.rowValueGreen]}>{value}</Text>
  </View>
);

const SummaryTab: React.FC<Props> = ({ dealId, mode }) => {
  const navigation = useNavigation();
  const [deal, setDeal] = useState<DealSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [saving, setSaving] = useState(false);

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

  const handleSave = async () => {
    if (!companyName.trim() || saving) return;
    setSaving(true);
    try {
      await api.buyer.updateDealCompany(dealId, {
        buyer_company_name: companyName.trim(),
      });
      setCompanyName('');
      setShowModal(false);
      await loadDeal();
    } catch {
      Alert.alert('Error', 'Failed to update company name.');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setCompanyName('');
    setShowModal(false);
  };

  const handleContactAdmin = () => {
    navigation.navigate('Support' as never);
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#217A3C" />
      </View>
    );
  }

  if (!deal) return null;

  const stageMsg = STAGE_MSG[deal.status] ?? STAGE_MSG.open;
  const qty = deal.offer?.quantity;
  const price = deal.offer?.price_per_unit;
  const totalAmount =
    mode === 'seller' && deal.payable_to_seller != null
      ? deal.payable_to_seller
      : deal.total_amount;

  const paymentTermLabel = () => {
    const t = deal.offer?.payment_term_type?.toLowerCase();
    if (t === 'fixed') return 'Fixed full payment';
    if (t === 'weekly') return 'Weekly payment';
    return deal.offer?.payment_term_type ?? '—';
  };

  const canSave = companyName.trim().length > 0;

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
      <View style={s.card}>
        {qty != null && <Row label="Quantity" value={`${qty} bags`} />}
        {price != null && (
          <Row
            label="Rate"
            value={`PKR ${Number(price).toLocaleString()} / 40kg`}
          />
        )}
        <Row
          label={mode === 'buyer' ? 'Total Value' : 'Payable to You'}
          value={formatPKR(Number(totalAmount))}
          highlight
        />
        {deal.offer?.payment_term_type ? (
          <Row label="Payment Terms" value={paymentTermLabel()} />
        ) : null}
        {deal.offer?.delivery_days != null ? (
          <Row
            label="Delivery Days"
            value={`${deal.offer.delivery_days} days`}
          />
        ) : null}
        {deal.offer?.delivery_location ? (
          <Row label="Delivery To" value={deal.offer.delivery_location} />
        ) : null}
        {deal.offer?.mill_name ? (
          <Row label="Mill" value={deal.offer.mill_name} />
        ) : null}
        <Row label="Company / Bilti" value={deal.buyer_company_name ?? '—'} />
        <Row
          label="Date"
          value={new Date(deal.created_at).toLocaleDateString('en-PK', {
            day: 'numeric',
            month: 'short',
          })}
        />
      </View>

      <View style={s.stageCard}>
        <View style={s.stageIconBox}>
          <Text style={s.stageCheck}>✓</Text>
        </View>
        <View style={s.stageBody}>
          <Text style={s.stageTitle}>{stageMsg.title}</Text>
          <Text style={s.stageDesc}>{stageMsg.desc}</Text>
        </View>
      </View>

      {mode === 'buyer' && !deal.buyer_company_name && (
        <View style={s.companyCard}>
          <View style={s.companyHeader}>
            <View style={s.companyIconBox}>
              <Text style={s.companyIconText}>📄</Text>
            </View>
            <Text style={s.companyTitle}>Company Name for Bilti</Text>
          </View>
          <Text style={s.companyDesc}>
            The seller needs this name to create the bill of lading (bilti) for
            your shipment.
          </Text>
          <TouchableOpacity
            style={s.companyBtn}
            onPress={() => setShowModal(true)}
            activeOpacity={0.85}
          >
            <Text style={s.companyBtnText}>+ Add Company Name →</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={s.contactBtn}
        onPress={handleContactAdmin}
        activeOpacity={0.85}
      >
        <Text style={s.contactBtnText}>📞  Contact Admin</Text>
      </TouchableOpacity>

      {mode === 'buyer' && deal.status === 'closed' && !deal.has_rated && (
        <TouchableOpacity
          style={s.ratingBtn}
          onPress={() =>
            (navigation as any).navigate('RateDeal', {
              dealId: deal.deal_id,
              dealCode: deal.code,
              commodityName: deal.commodity?.name ?? null,
              dealSummary: deal.offer
                ? `${deal.offer.quantity ?? '?'} bags · PKR ${Number(deal.offer.price_per_unit ?? 0).toLocaleString()}`
                : null,
            })
          }
          activeOpacity={0.85}
        >
          <Text style={s.ratingBtnText}>★  Submit Rating</Text>
        </TouchableOpacity>
      )}

      <View style={s.bottomSpacer} />

      {/* Company name bottom-sheet modal */}
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
            <View style={s.sheet}>
              <View style={s.dragHandle} />
              <Text style={s.sheetTitle}>Add Company Name for Bilti</Text>
              <Text style={s.sheetSubtitle}>
                This name will appear on the bill of lading. Usually your
                business name.
              </Text>
              <TextInput
                style={s.sheetInput}
                placeholder="e.g. Asad Agri Traders (Pvt Ltd)"
                placeholderTextColor="#9CA3AF"
                value={companyName}
                onChangeText={setCompanyName}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
              <TouchableOpacity
                style={[s.saveBtn, !canSave && s.saveBtnDisabled]}
                onPress={handleSave}
                disabled={!canSave || saving}
                activeOpacity={0.85}
              >
                {saving ? (
                  <ActivityIndicator color="#0D3B1F" size="small" />
                ) : (
                  <Text
                    style={[s.saveBtnText, !canSave && s.saveBtnTextDisabled]}
                  >
                    Save & Send to Seller →
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={s.cancelSheetBtn}
                onPress={handleCloseModal}
                activeOpacity={0.75}
              >
                <Text style={s.cancelSheetBtnText}>Cancel</Text>
              </TouchableOpacity>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rowLabel: { fontSize: 12, color: '#6B7280' },
  rowValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'right',
    flex: 1,
    marginLeft: 8,
  },
  rowValueGreen: { fontSize: 14, fontWeight: '800', color: '#1A6B34' },

  stageCard: {
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
  stageIconBox: {
    width: 38,
    height: 38,
    backgroundColor: '#217A3C',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stageCheck: { fontSize: 18, color: '#FFFFFF' },
  stageBody: { flex: 1 },
  stageTitle: { fontSize: 13, fontWeight: '800', color: '#145228' },
  stageDesc: {
    fontSize: 12,
    color: '#145228',
    opacity: 0.75,
    marginTop: 3,
    lineHeight: 18,
  },

  companyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(243,205,3,0.27)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  companyIconBox: {
    width: 32,
    height: 32,
    backgroundColor: '#FFFDE6',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyIconText: { fontSize: 16 },
  companyTitle: { fontSize: 14, fontWeight: '800', color: '#111827' },
  companyDesc: { fontSize: 12, color: '#6B7280', marginBottom: 12 },
  companyBtn: {
    backgroundColor: '#F3CD03',
    borderRadius: 11,
    paddingVertical: 11,
    alignItems: 'center',
  },
  companyBtnText: { fontSize: 13, fontWeight: '700', color: '#0D3B1F' },

  contactBtn: {
    borderWidth: 1.5,
    borderColor: '#7FD4A0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  contactBtnText: { fontSize: 13, fontWeight: '700', color: '#1A6B34' },

  ratingBtn: {
    backgroundColor: '#217A3C',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#2E9E52',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  ratingBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },

  overlay: { flex: 1, justifyContent: 'flex-end' },
  overlayBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 6 },
  sheetSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 16,
  },
  sheetInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#111827',
    marginBottom: 14,
  },
  saveBtn: {
    backgroundColor: '#F3CD03',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveBtnDisabled: { backgroundColor: '#E5E7EB' },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: '#0D3B1F' },
  saveBtnTextDisabled: { color: '#9CA3AF' },
  cancelSheetBtn: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelSheetBtnText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
});

export default SummaryTab;
