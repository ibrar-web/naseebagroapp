import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { AppIcon } from '../../../assets/icons';
import MockStatusBar from '../../components/MockStatusBar';
import { useAppSelector } from '../../../store';
import api from '../../../utils/api';
import {
  joinOfferRoom,
  onCounterOffer,
  onOfferAccepted,
  onOfferRejected,
} from '../../../utils/sockets/negotiations';

type Props = NativeStackScreenProps<RootStackParamList, 'Negotiation'>;

type ChatBubble = {
  round_number: number;
  price: number;
  price_display: string;
  label: string;
  is_mine: boolean;
  note: string | null;
  time_label: string;
  payment_terms?: string;
  is_awaiting?: boolean;
};

type OfferState = {
  id: string;
  code: string;
  commodityName: string;
  millName: string;
  statusLabel: string;
  statusColor: string;
  isYourTurn: boolean;
  canCounter: boolean;
  canAccept: boolean;
  canReject: boolean;
  history: ChatBubble[];
  lastPrice: number;
};

const PAYMENT_FIXED_OPTIONS = [3, 7, 15, 30];
const PAYMENT_WEEKLY_OPTIONS = [10, 20, 25, 50];
const DELIVERY_OPTIONS = [1, 2, 3, 5, 7, 10, 14];

// ─── Normalizer ────────────────────────────────────────────────────────────────

const firstValue = (...vals: any[]) =>
  vals.find(v => v !== undefined && v !== null && v !== '');

const normalizeOffer = (payload: any): OfferState => {
  const initial = payload.initial_offer ?? {};
  const mill = initial.mill ?? {};
  const millName = [mill.name, mill.city].filter(Boolean).join(', ') || '—';

  const history: ChatBubble[] = (payload.history ?? []).map((r: any, i: number, arr: any[]) => {
    const rawPrice = firstValue(r.price, r.offered_price) ?? 0;
    const isAwaiting = !r.is_mine && i === arr.length - 1 &&
      ['pending', 'counter_received'].includes(payload.status ?? '');
    return {
      round_number: r.round_number,
      price: Number(rawPrice),
      price_display: firstValue(r.price_display, `PKR ${rawPrice}`) ?? '',
      label: r.label ?? '',
      is_mine: r.is_mine ?? false,
      note: r.note ?? null,
      time_label: firstValue(r.time_label, '') ?? '',
      payment_terms: r.round_number === 1 ? (initial.payment_terms ?? null) : null,
      is_awaiting: isAwaiting,
    };
  });

  const lastItem = history[history.length - 1];
  const lastPrice = lastItem?.price || Number(initial.price ?? 0) || 2500;

  return {
    id: payload.id ?? '',
    code: payload.code ?? '',
    commodityName: payload.commodity?.name ?? '',
    millName,
    statusLabel: payload.status_label ?? payload.status ?? '',
    statusColor: payload.status_color ?? 'gray',
    isYourTurn: payload.is_your_turn ?? false,
    canCounter: payload.actions?.can_counter ?? false,
    canAccept: payload.actions?.can_accept ?? false,
    canReject: payload.actions?.can_reject ?? false,
    history,
    lastPrice,
  };
};

// ─── Chat bubble ───────────────────────────────────────────────────────────────

const Bubble = ({ item }: { item: ChatBubble }) => {
  const alignRight = item.is_mine;

  return (
    <View style={[styles.row, alignRight ? styles.rowRight : styles.rowLeft]}>
      <View style={styles.bubbleWrap}>
        <Text style={[styles.timeLabel, { textAlign: alignRight ? 'right' : 'left' }]}>
          {alignRight ? 'You' : 'Counterparty'}{item.time_label ? ` · ${item.time_label}` : ''}
        </Text>
        <View style={[
          styles.bubble,
          alignRight ? styles.bubbleMine : styles.bubbleTheirs,
          item.is_awaiting && styles.bubbleAwaiting,
        ]}>
          {item.is_awaiting ? (
            <Text style={styles.awaitingLabel}>⏳ AWAITING YOUR RESPONSE</Text>
          ) : (
            <Text style={styles.bubbleLabel}>{item.label.toUpperCase()}</Text>
          )}
          <Text style={styles.bubblePrice}>{item.price_display}</Text>
          {!!item.note && <Text style={styles.bubbleNote}>{item.note}</Text>}
          {!!item.payment_terms && (
            <View style={styles.chip}>
              <Text style={styles.chipText}>{item.payment_terms}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

// ─── Main screen ───────────────────────────────────────────────────────────────

const STEP = 50;

const NegotiationScreen = ({ navigation, route }: Props) => {
  const { offerId, mode: routeMode } = route.params;
  const user = useAppSelector(s => s.auth.user);
  const mode = routeMode ?? (user?.role as 'buyer' | 'seller') ?? 'buyer';

  const [offer, setOffer] = useState<OfferState | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Counter offer sheet
  const [counterVisible, setCounterVisible] = useState(false);
  const [counterTab, setCounterTab] = useState<'price' | 'terms'>('price');
  const [counterPrice, setCounterPrice] = useState(0);
  const [paymentType, setPaymentType] = useState<'fixed' | 'weekly'>('fixed');
  const [paymentDays, setPaymentDays] = useState<number | null>(null);
  const [deliveryDays, setDeliveryDays] = useState<number | null>(null);

  const scrollRef = useRef<ScrollView>(null);

  const fetchOffer = useCallback(async () => {
    try {
      setFetchError('');
      const res: any = mode === 'buyer'
        ? await api.buyer.myDemandOfferDetails(offerId)
        : await api.seller.myPostOffersDetails(offerId);
      const payload = res?.data ?? res;
      console.log('[Negotiation] payload', JSON.stringify(payload, null, 2));
      setOffer(normalizeOffer(payload));
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? 'Failed to load offer';
      console.log('[Negotiation] fetch error', msg);
      setFetchError(msg);
    } finally {
      setLoading(false);
    }
  }, [offerId, mode]);

  useEffect(() => { fetchOffer(); }, [fetchOffer]);

  useEffect(() => {
    joinOfferRoom(offerId);
    const unsubCounter = onCounterOffer(() => fetchOffer());
    const unsubAccepted = onOfferAccepted(() => fetchOffer());
    const unsubRejected = onOfferRejected(() => fetchOffer());
    return () => { unsubCounter(); unsubAccepted(); unsubRejected(); };
  }, [offerId, fetchOffer]);

  useEffect(() => {
    if (offer?.history.length) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
    }
  }, [offer?.history.length]);

  const openCounterSheet = () => {
    setCounterPrice(offer?.lastPrice ?? 2500);
    setCounterTab('price');
    setPaymentType('fixed');
    setPaymentDays(null);
    setDeliveryDays(null);
    setCounterVisible(true);
  };

  const adjustPrice = (delta: number) => {
    setCounterPrice(prev => Math.max(STEP, prev + delta));
  };

  const handleCounter = async () => {
    if (!counterPrice || counterPrice <= 0) {
      Alert.alert('Enter a valid price');
      return;
    }
    setActionLoading(true);
    try {
      const payload = { offered_price: counterPrice } as any;
      if (paymentDays) { payload.payment_days = paymentDays; payload.payment_type = paymentType; }
      if (deliveryDays) payload.delivery_days = deliveryDays;
      mode === 'buyer'
        ? await api.buyer.counterOffer(offerId, payload)
        : await api.seller.counterOffer(offerId, payload);
      setCounterVisible(false);
      fetchOffer();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? e?.message ?? 'Counter offer failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = () => {
    Alert.alert('Accept Offer', 'This will create a Deal instantly. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept', onPress: async () => {
          setActionLoading(true);
          try {
            mode === 'buyer' ? await api.buyer.acceptOffer(offerId) : await api.seller.acceptOffer(offerId);
            fetchOffer();
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message ?? e?.message ?? 'Accept failed');
          } finally { setActionLoading(false); }
        },
      },
    ]);
  };

  const handleReject = () => {
    Alert.alert('Reject Offer', 'Are you sure you want to reject?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject', style: 'destructive', onPress: async () => {
          setActionLoading(true);
          try {
            mode === 'buyer' ? await api.buyer.rejectOffer(offerId) : await api.seller.rejectOffer(offerId);
            fetchOffer();
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message ?? e?.message ?? 'Reject failed');
          } finally { setActionLoading(false); }
        },
      },
    ]);
  };

  const goBack = () => {
    if (navigation.canGoBack()) { navigation.goBack(); return; }
    navigation.dispatch(CommonActions.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Post', params: { initialTab: 'offers' } } }],
    }));
  };

  const headerSub = offer ? [offer.millName, offer.commodityName].filter(Boolean).join(' · ') : '';
  const formattedCounter = `PKR ${counterPrice.toLocaleString('en-PK')}`;

  return (
    <View style={styles.container}>
      <MockStatusBar backgroundColor="#0D3B1F" textColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn} activeOpacity={0.8}>
            <AppIcon name="back" size={17} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Negotiation</Text>
            <Text style={styles.headerSub} numberOfLines={1}>{headerSub}</Text>
          </View>
          <View style={styles.anonymousBadge}>
            <Text style={styles.anonymousText}>🔒 Anonymous</Text>
          </View>
        </View>
      </View>

      {/* Chat area */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#1A6B34" />
        </View>
      ) : fetchError && !offer ? (
        <View style={styles.loadingWrap}>
          <Text style={styles.emptyText}>{fetchError}</Text>
          <TouchableOpacity onPress={fetchOffer} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={styles.chat}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {!offer?.history.length && (
            <Text style={styles.emptyText}>No messages yet.</Text>
          )}
          {offer?.history.map((item, i) => <Bubble key={i} item={item} />)}
        </ScrollView>
      )}

      {/* Bottom action bar */}
      {!loading && offer && (
        <View style={styles.bottomBar}>
          <Text style={styles.disclaimer}>
            {offer.isYourTurn ? 'Your turn — respond now' : 'Waiting for counterparty…'}
          </Text>
          <View style={styles.actionRow}>
            {offer.canReject && (
              <TouchableOpacity style={styles.rejectBtn} onPress={handleReject} disabled={actionLoading} activeOpacity={0.85}>
                <Text style={styles.rejectBtnText}>Reject</Text>
              </TouchableOpacity>
            )}
            {offer.canCounter && (
              <TouchableOpacity style={styles.counterBtn} onPress={openCounterSheet} disabled={actionLoading} activeOpacity={0.85}>
                <Text style={styles.counterBtnText}>Counter</Text>
              </TouchableOpacity>
            )}
            {offer.canAccept && (
              <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept} disabled={actionLoading} activeOpacity={0.85}>
                {actionLoading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.acceptBtnText}>Accept → Deal ✓</Text>}
              </TouchableOpacity>
            )}
            {!offer.canCounter && !offer.canAccept && !offer.canReject && (
              <View style={styles.terminalBadge}>
                <Text style={styles.terminalText}>{offer.statusLabel}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Counter offer bottom sheet */}
      <Modal visible={counterVisible} transparent animationType="slide" onRequestClose={() => setCounterVisible(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.sheet}>

            {/* Sheet header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Send Counter</Text>
              <TouchableOpacity style={styles.sheetCancel} onPress={() => setCounterVisible(false)}>
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {/* Tab selector */}
            <View style={styles.tabBar}>
              <TouchableOpacity
                style={[styles.tab, counterTab === 'price' && styles.tabActive]}
                onPress={() => setCounterTab('price')}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, counterTab === 'price' && styles.tabTextActive]}>Price</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, counterTab === 'terms' && styles.tabActive]}
                onPress={() => setCounterTab('terms')}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, counterTab === 'terms' && styles.tabTextActive]}>Payment & Delivery</Text>
              </TouchableOpacity>
            </View>

            {counterTab === 'price' ? (
              /* Price tab */
              <View style={styles.priceTab}>
                <Text style={styles.priceDisplay}>{formattedCounter}</Text>
                <Text style={styles.priceUnit}>per 40kg bag</Text>
                <View style={styles.stepper}>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => adjustPrice(-STEP)} activeOpacity={0.75}>
                    <Text style={styles.stepBtnText}>−</Text>
                  </TouchableOpacity>
                  <View style={styles.stepCenter}>
                    <Text style={styles.stepValue}>{formattedCounter}</Text>
                    <Text style={styles.stepHint}>tap ± PKR {STEP}</Text>
                  </View>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => adjustPrice(STEP)} activeOpacity={0.75}>
                    <Text style={styles.stepBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* Payment & Delivery tab */
              <View style={styles.termsTab}>
                {/* Payment Term */}
                <Text style={styles.termsLabel}>Payment Term</Text>
                <View style={styles.subTabBar}>
                  {(['fixed', 'weekly'] as const).map(t => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.subTab, paymentType === t && styles.subTabActive]}
                      onPress={() => { setPaymentType(t); setPaymentDays(null); }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.subTabText, paymentType === t && styles.subTabTextActive]}>
                        {t === 'fixed' ? 'Fixed Days' : 'Weekly %'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.optionRow}>
                  {(paymentType === 'fixed' ? PAYMENT_FIXED_OPTIONS : PAYMENT_WEEKLY_OPTIONS).map(v => (
                    <TouchableOpacity
                      key={v}
                      style={[styles.optionChip, paymentDays === v && styles.optionChipActive]}
                      onPress={() => setPaymentDays(paymentDays === v ? null : v)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.optionChipText, paymentDays === v && styles.optionChipTextActive]}>
                        {paymentType === 'fixed' ? `${v}d` : `${v}%`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Delivery Term */}
                <Text style={[styles.termsLabel, { marginTop: 14 }]}>Delivery (days)</Text>
                <View style={styles.optionRow}>
                  {DELIVERY_OPTIONS.map(v => (
                    <TouchableOpacity
                      key={v}
                      style={[styles.optionChip, deliveryDays === v && styles.optionChipActive]}
                      onPress={() => setDeliveryDays(deliveryDays === v ? null : v)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.optionChipText, deliveryDays === v && styles.optionChipTextActive]}>
                        {v}d
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Submit button */}
            <TouchableOpacity
              style={[styles.submitBtn, actionLoading && styles.submitBtnDisabled]}
              onPress={handleCounter}
              disabled={actionLoading}
              activeOpacity={0.85}
            >
              {actionLoading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.submitBtnText}>
                    {`Submit Counter — ${formattedCounter}${deliveryDays ? ` · ${deliveryDays}d delivery` : ''}`}
                  </Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEF2EE' },
  header: { paddingHorizontal: 14, paddingBottom: 14, backgroundColor: '#0D3B1F' },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.13)', borderRadius: 10, padding: 8 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  headerSub: { fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 1 },
  anonymousBadge: { backgroundColor: 'rgba(255,255,255,0.094)', borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  anonymousText: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.53)' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 40, fontSize: 13 },
  retryBtn: { backgroundColor: '#1A6B34', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  chat: { flex: 1 },
  chatContent: { padding: 14, paddingBottom: 24, gap: 16 },
  row: { flexDirection: 'row' },
  rowRight: { justifyContent: 'flex-end' },
  rowLeft: { justifyContent: 'flex-start' },
  bubbleWrap: { maxWidth: '82%' },
  timeLabel: { fontSize: 9, color: '#9CA3AF', marginBottom: 3 },
  bubble: { borderRadius: 16, padding: 12, minWidth: 180, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  bubbleMine: { backgroundColor: '#1A6B34', borderTopRightRadius: 4 },
  bubbleTheirs: { backgroundColor: '#145228', borderTopLeftRadius: 4 },
  bubbleAwaiting: { borderWidth: 2, borderColor: '#F7DB4A' },
  awaitingLabel: { fontSize: 9, fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.3, marginBottom: 6 },
  bubbleLabel: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: 0.3, marginBottom: 6 },
  bubblePrice: { fontSize: 22, fontWeight: '900', color: '#FFFFFF', marginBottom: 4, letterSpacing: -0.5 },
  bubbleNote: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  chip: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 7, paddingHorizontal: 9, paddingVertical: 4, alignSelf: 'flex-start', marginTop: 4 },
  chipText: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },
  bottomBar: { backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingTop: 12, paddingBottom: 28, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: -4 }, elevation: 12 },
  disclaimer: { fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginBottom: 8 },
  actionRow: { flexDirection: 'row', gap: 8 },
  rejectBtn: { flex: 1, paddingVertical: 12, backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FCA5A5', borderRadius: 11, alignItems: 'center' },
  rejectBtnText: { fontSize: 12, fontWeight: '700', color: '#EF4444' },
  counterBtn: { flex: 1, paddingVertical: 12, backgroundColor: '#FFFDE6', borderWidth: 1, borderColor: 'rgba(243,205,3,0.33)', borderRadius: 11, alignItems: 'center' },
  counterBtnText: { fontSize: 12, fontWeight: '700', color: '#92400E' },
  acceptBtn: { flex: 2, paddingVertical: 12, backgroundColor: '#1A6B34', borderRadius: 11, alignItems: 'center', shadowColor: '#1A6B34', shadowOpacity: 0.33, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  acceptBtnText: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
  terminalBadge: { flex: 1, paddingVertical: 12, backgroundColor: '#F3F4F6', borderRadius: 11, alignItems: 'center' },
  terminalText: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  // Modal / sheet
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 36, borderWidth: 2, borderColor: '#7FD4A0' },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sheetTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  sheetCancel: { backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  sheetCancelText: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  // Tabs
  tabBar: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 10, padding: 3, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  tabText: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
  tabTextActive: { fontWeight: '700', color: '#111827' },
  // Price tab
  priceTab: { alignItems: 'center', marginBottom: 16 },
  priceDisplay: { fontSize: 36, fontWeight: '900', color: '#1A6B34', letterSpacing: -1 },
  priceUnit: { fontSize: 11, color: '#9CA3AF', marginTop: 2, marginBottom: 20 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%' },
  stepBtn: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 24, fontWeight: '700', color: '#111827', lineHeight: 28 },
  stepCenter: { flex: 1, alignItems: 'center' },
  stepValue: { fontSize: 18, fontWeight: '800', color: '#111827' },
  stepHint: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  // Payment & Delivery tab
  termsTab: { marginBottom: 16 },
  termsLabel: { fontSize: 11, fontWeight: '700', color: '#4B5563', marginBottom: 8 },
  subTabBar: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 9, padding: 3, marginBottom: 10 },
  subTab: { flex: 1, paddingVertical: 7, borderRadius: 7, alignItems: 'center' },
  subTabActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  subTabText: { fontSize: 11, fontWeight: '500', color: '#6B7280' },
  subTabTextActive: { fontWeight: '700', color: '#111827' },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: 'transparent' },
  optionChipActive: { backgroundColor: '#F0FDF4', borderColor: '#1A6B34' },
  optionChipText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  optionChipTextActive: { color: '#1A6B34' },
  // Submit
  submitBtn: { backgroundColor: '#1A6B34', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
});

export default NegotiationScreen;
