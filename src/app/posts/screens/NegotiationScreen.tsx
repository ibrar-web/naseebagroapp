import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { showAlert, showConfirm } from '../../components/toastConfig';
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
  originalPrice: number;
  unitName: string;
  lastPaymentType: 'fixed' | 'weekly' | null;
  lastPaymentDays: number | null;
  lastDeliveryDays: number | null;
  listedPrice: number;
  priceJump: number | null;
  minBelowPct: number | null;
  maxAbovePct: number | null;
};

type DropdownOption = { label: string; value: number };

// ─── Helpers ───────────────────────────────────────────────────────────────────

const firstValue = (...vals: any[]) =>
  vals.find(v => v !== undefined && v !== null && v !== '');

const normalizeOffer = (payload: any): OfferState => {
  const initial = payload.initial_offer ?? {};
  const mill = initial.mill ?? {};
  const millName = [mill.name, mill.city].filter(Boolean).join(', ') || '—';

  const rawRounds: any[] = payload.history ?? [];

  const history: ChatBubble[] = rawRounds.map((r: any, i: number, arr: any[]) => {
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

  // Walk back through rounds to find last set payment/delivery values
  const lastWithPayment = [...rawRounds].reverse().find(r => r.payment_type);
  const lastWithDelivery = [...rawRounds].reverse().find(r => r.delivery_days != null);

  const round1 = history.find(h => h.round_number === 1);
  const originalPrice = round1?.price || Number(initial.price ?? 0) || 0;
  const lastItem = history[history.length - 1];
  const lastPrice = lastItem?.price || originalPrice || 2500;

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
    originalPrice,
    unitName: payload.unit_name ?? '40kg',
    lastPaymentType: (lastWithPayment?.payment_type as 'fixed' | 'weekly') ?? null,
    lastPaymentDays: lastWithPayment?.payment_days ?? null,
    lastDeliveryDays: lastWithDelivery?.delivery_days ?? null,
    listedPrice: Number(payload.price_limits?.listed_price ?? 0),
    priceJump: payload.price_limits?.price_jump ?? null,
    minBelowPct: payload.price_limits?.min_below_pct ?? null,
    maxAbovePct: payload.price_limits?.max_above_pct ?? null,
  };
};

// ─── Inline dropdown ───────────────────────────────────────────────────────────

type DropdownProps = {
  placeholder: string;
  options: DropdownOption[];
  value: number | null;
  onChange: (v: number | null) => void;
  loading?: boolean;
};

const DropdownPicker = ({ placeholder, options, value, onChange, loading }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <View style={styles.dropdownWrap}>
      <TouchableOpacity
        style={[styles.dropdownBtn, open && styles.dropdownBtnOpen]}
        onPress={() => setOpen(v => !v)}
        activeOpacity={0.8}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#2E9E52" style={{ marginRight: 8 }} />
        ) : null}
        <Text style={[styles.dropdownBtnText, !selected && styles.dropdownPlaceholder]}>
          {selected ? selected.label : placeholder}
        </Text>
        <Text style={styles.dropdownCaret}>{open ? '▴' : '▾'}</Text>
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdownList}>
          {options.map(item => (
            <TouchableOpacity
              key={item.value}
              style={[styles.dropdownItem, item.value === value && styles.dropdownItemActive]}
              onPress={() => { onChange(item.value === value ? null : item.value); setOpen(false); }}
              activeOpacity={0.75}
            >
              <Text style={[styles.dropdownItemText, item.value === value && styles.dropdownItemTextActive]}>
                {item.label}
              </Text>
              {item.value === value && <Text style={styles.dropdownCheck}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
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

  const [mode, setMode] = useState<'buyer' | 'seller'>(
    routeMode ?? (user?.role as 'buyer' | 'seller') ?? 'buyer',
  );
  const [offer, setOffer] = useState<OfferState | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Trade config options from DB
  const [fixedDayOptions, setFixedDayOptions] = useState<DropdownOption[]>([]);
  const [weeklyPctOptions, setWeeklyPctOptions] = useState<DropdownOption[]>([]);
  const [configLoading, setConfigLoading] = useState(true);

  // Counter offer sheet
  const [counterVisible, setCounterVisible] = useState(false);
  const [counterTab, setCounterTab] = useState<'price' | 'terms'>('price');
  const [counterPrice, setCounterPrice] = useState(0);
  const [paymentType, setPaymentType] = useState<'fixed' | 'weekly'>('fixed');
  const [paymentDays, setPaymentDays] = useState<number | null>(null);
  const [deliveryDays, setDeliveryDays] = useState<number | null>(null);

  const scrollRef = useRef<ScrollView>(null);

  // Fetch trade configs (payment terms) from DB
  useEffect(() => {
    const load = async () => {
      try {
        const [fixedRes, weeklyRes] = await Promise.all([
          api.marketplace.public.getTradeConfigs({ type: 'fixed_days' }),
          api.marketplace.public.getTradeConfigs({ type: 'weekly_percent' }),
        ]);
        const fixed: DropdownOption[] = (fixedRes?.data ?? []).map((r: any) => ({
          value: Number(r.name),
          label: `Full payment in ${r.name} days`,
        }));
        const weekly: DropdownOption[] = (weeklyRes?.data ?? []).map((r: any) => ({
          value: Number(r.name),
          label: `${r.name}% per week`,
        }));
        setFixedDayOptions(fixed);
        setWeeklyPctOptions(weekly);
      } catch {
        // fallback to empty — user can still negotiate price
      } finally {
        setConfigLoading(false);
      }
    };
    load();
  }, []);

  const fetchOffer = useCallback(async (overrideMode?: 'buyer' | 'seller') => {
    const m = overrideMode ?? mode;
    try {
      setFetchError('');
      const res: any = m === 'buyer'
        ? await api.buyer.myDemandOfferDetails(offerId)
        : await api.seller.myPostOffersDetails(offerId);
      const payload = res?.data ?? res;
      setOffer(normalizeOffer(payload));
    } catch (e: any) {
      const status = e?.response?.status ?? e?.status;
      if (status === 403 && !overrideMode) {
        const alt: 'buyer' | 'seller' = m === 'buyer' ? 'seller' : 'buyer';
        setMode(alt);
        fetchOffer(alt);
        return;
      }
      const msg = e?.response?.data?.message ?? e?.message ?? 'Failed to load offer';
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

  // Counter offer price bounds derived from snapshotted commodity limits on the offer.
  // Falls back to sensible defaults when limits are not configured.
  const originalPrice = offer?.originalPrice ?? 0;
  const listedPrice = offer?.listedPrice && offer.listedPrice > 0 ? offer.listedPrice : originalPrice;
  const step = offer?.priceJump ?? STEP;
  const minCounterPrice = listedPrice > 0 && offer?.minBelowPct != null
    ? Math.floor(listedPrice * (1 - offer.minBelowPct / 100))
    : originalPrice > 0 ? Math.floor(originalPrice * 0.7) : step;
  const maxCounterPrice = listedPrice > 0 && offer?.maxAbovePct != null
    ? Math.ceil(listedPrice * (1 + offer.maxAbovePct / 100))
    : originalPrice > 0 ? Math.ceil(originalPrice * 2.0) : Infinity;

  const openCounterSheet = () => {
    setCounterPrice(offer?.lastPrice ?? 2500);
    setCounterTab('price');
    setPaymentType(offer?.lastPaymentType ?? 'fixed');
    setPaymentDays(offer?.lastPaymentDays ?? null);
    setDeliveryDays(offer?.lastDeliveryDays ?? null);
    setCounterVisible(true);
  };

  const adjustPrice = (delta: number) => {
    setCounterPrice(prev => {
      const next = prev + delta;
      return Math.max(minCounterPrice, Math.min(maxCounterPrice === Infinity ? prev + delta : maxCounterPrice, next));
    });
  };

  const handleCounter = async () => {
    if (!counterPrice || counterPrice <= 0) {
      showAlert('error', 'Enter a valid price');
      return;
    }
    if (counterPrice < minCounterPrice) {
      showAlert('error', 'Price too low', `Minimum counter price is PKR ${minCounterPrice.toLocaleString('en-PK')}`);
      return;
    }
    if (counterPrice > maxCounterPrice) {
      showAlert('error', 'Price too high', `Maximum counter price is PKR ${maxCounterPrice.toLocaleString('en-PK')}`);
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
      showAlert('error', 'Error', e?.response?.data?.message ?? e?.message ?? 'Counter offer failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = () => {
    showConfirm('info', 'Accept Offer', 'This will create a Deal instantly. Continue?', async () => {
      setActionLoading(true);
      try {
        mode === 'buyer' ? await api.buyer.acceptOffer(offerId) : await api.seller.acceptOffer(offerId);
        fetchOffer();
      } catch (e: any) {
        showAlert('error', 'Error', e?.response?.data?.message ?? e?.message ?? 'Accept failed');
      } finally { setActionLoading(false); }
    });
  };

  const handleReject = () => {
    showConfirm('warning', 'Reject Offer', 'Are you sure you want to reject?', async () => {
      setActionLoading(true);
      try {
        mode === 'buyer' ? await api.buyer.rejectOffer(offerId) : await api.seller.rejectOffer(offerId);
        fetchOffer();
      } catch (e: any) {
        showAlert('error', 'Error', e?.response?.data?.message ?? e?.message ?? 'Reject failed');
      } finally { setActionLoading(false); }
    });
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
  const unitName = offer?.unitName ?? '40kg';

  const minReached = counterPrice <= minCounterPrice;
  const maxReached = counterPrice >= maxCounterPrice;

  const DELIVERY_OPTIONS: DropdownOption[] = [
    { label: 'Delivery within 1 day', value: 1 },
    { label: 'Delivery within 2 days', value: 2 },
    { label: 'Delivery within 3 days', value: 3 },
    { label: 'Delivery within 5 days', value: 5 },
    { label: 'Delivery within 7 days', value: 7 },
    { label: 'Delivery within 10 days', value: 10 },
    { label: 'Delivery within 14 days', value: 14 },
  ];

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
          <TouchableOpacity onPress={() => fetchOffer()} style={styles.retryBtn}>
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
                  : <><Text style={styles.acceptBtnText}>Accept Deal ✓</Text><AppIcon name="arrowRight" size={15} color="#fff" /></>}
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

            <ScrollView
              style={styles.sheetScroll}
              contentContainerStyle={styles.sheetScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {counterTab === 'price' ? (
                /* Price tab */
                <View style={styles.priceTab}>
                  <Text style={styles.priceDisplay}>{formattedCounter}</Text>
                  <Text style={styles.priceUnit}>per {unitName}</Text>

                  {/* Min / max range bar */}
                  {originalPrice > 0 && (
                    <View style={styles.rangeRow}>
                      <View style={styles.rangePill}>
                        <Text style={styles.rangePillLabel}>Min</Text>
                        <Text style={styles.rangePillValue}>PKR {minCounterPrice.toLocaleString('en-PK')}</Text>
                      </View>
                      <View style={styles.rangeDivider} />
                      <View style={styles.rangePill}>
                        <Text style={styles.rangePillLabel}>Max</Text>
                        <Text style={styles.rangePillValue}>PKR {maxCounterPrice.toLocaleString('en-PK')}</Text>
                      </View>
                    </View>
                  )}

                  <View style={styles.stepper}>
                    <TouchableOpacity
                      style={[styles.stepBtn, minReached && styles.stepBtnDisabled]}
                      onPress={() => adjustPrice(-step)}
                      activeOpacity={0.75}
                      disabled={minReached}
                    >
                      <Text style={[styles.stepBtnText, minReached && styles.stepBtnTextDisabled]}>−</Text>
                    </TouchableOpacity>
                    <View style={styles.stepCenter}>
                      <Text style={styles.stepValue}>{formattedCounter}</Text>
                      <Text style={styles.stepHint}>tap ± PKR {step}</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.stepBtn, maxReached && styles.stepBtnDisabled]}
                      onPress={() => adjustPrice(step)}
                      activeOpacity={0.75}
                      disabled={maxReached}
                    >
                      <Text style={[styles.stepBtnText, maxReached && styles.stepBtnTextDisabled]}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                /* Payment & Delivery tab */
                <View style={styles.termsTab}>
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

                  <DropdownPicker
                    placeholder={paymentType === 'fixed' ? 'Pay within how many days?' : 'Pay what % per week?'}
                    options={paymentType === 'fixed' ? fixedDayOptions : weeklyPctOptions}
                    value={paymentDays}
                    onChange={setPaymentDays}
                    loading={configLoading}
                  />

                  <Text style={[styles.termsLabel, { marginTop: 16 }]}>Delivery Term</Text>
                  <DropdownPicker
                    placeholder="Deliver within how many days?"
                    options={DELIVERY_OPTIONS}
                    value={deliveryDays}
                    onChange={setDeliveryDays}
                  />
                </View>
              )}
            </ScrollView>

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
  acceptBtn: { flex: 2, paddingVertical: 12, backgroundColor: '#1A6B34', borderRadius: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, shadowColor: '#1A6B34', shadowOpacity: 0.33, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
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
  priceUnit: { fontSize: 11, color: '#9CA3AF', marginTop: 2, marginBottom: 12 },
  rangeRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 16, width: '100%' },
  rangePill: { flex: 1, alignItems: 'center' },
  rangePillLabel: { fontSize: 9, fontWeight: '700', color: '#6B7280', letterSpacing: 0.5, textTransform: 'uppercase' },
  rangePillValue: { fontSize: 12, fontWeight: '800', color: '#1A6B34', marginTop: 2 },
  rangeDivider: { width: 1, height: 28, backgroundColor: '#D1FAE5', marginHorizontal: 8 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%' },
  stepBtn: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  stepBtnDisabled: { backgroundColor: '#F9FAFB', opacity: 0.4 },
  stepBtnText: { fontSize: 24, fontWeight: '700', color: '#111827', lineHeight: 28 },
  stepBtnTextDisabled: { color: '#9CA3AF' },
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
  // Dropdown
  dropdownWrap: { marginBottom: 0 },
  dropdownBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderColor: '#2E9E52', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#FFFFFF' },
  dropdownBtnOpen: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottomColor: '#E5E7EB' },
  dropdownBtnText: { fontSize: 13, color: '#111827', flex: 1 },
  dropdownPlaceholder: { color: '#9CA3AF' },
  dropdownCaret: { fontSize: 14, color: '#2E9E52', marginLeft: 8 },
  dropdownList: { borderWidth: 1.5, borderTopWidth: 0, borderColor: '#2E9E52', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, backgroundColor: '#FFFFFF', overflow: 'hidden' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dropdownItemActive: { backgroundColor: '#F0FDF4' },
  dropdownItemText: { fontSize: 13, color: '#374151', flex: 1 },
  dropdownItemTextActive: { color: '#1A6B34', fontWeight: '700' },
  dropdownCheck: { fontSize: 13, color: '#1A6B34', fontWeight: '700', marginLeft: 8 },
  // Sheet scroll
  sheetScroll: { flexGrow: 0 },
  sheetScrollContent: { paddingBottom: 8 },
  // Submit
  submitBtn: { backgroundColor: '#1A6B34', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
});

export default NegotiationScreen;
