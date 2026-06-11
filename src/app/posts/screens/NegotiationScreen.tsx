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
  TextInput,
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
  offNegotiationEvents,
  onCounterOffer,
  onOfferAccepted,
  onOfferRejected,
} from '../../../utils/sockets/negotiations';

type Props = NativeStackScreenProps<RootStackParamList, 'Negotiation'>;

type ChatBubble = {
  round_number: number;
  price_display: string;
  label: string;
  is_mine: boolean;
  note: string | null;
  time_label: string;
  payment_terms?: string;
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
};

const firstValue = (...vals: any[]) =>
  vals.find(v => v !== undefined && v !== null && v !== '');

const normalizeOffer = (payload: any, mode: 'buyer' | 'seller'): OfferState => {
  const initial = payload.initial_offer ?? {};
  const mill = initial.mill ?? {};
  const millName = [mill.name, mill.city].filter(Boolean).join(', ') || '—';

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
    history: (payload.history ?? []).map((r: any) => ({
      round_number: r.round_number,
      price_display: firstValue(r.price_display, `PKR ${r.price}`) ?? '',
      label: r.label ?? '',
      is_mine: r.is_mine ?? false,
      note: r.note ?? null,
      time_label: firstValue(r.time_label, '') ?? '',
      payment_terms: initial.payment_terms ?? null,
    })),
  };
};

const Bubble = ({ item }: { item: ChatBubble }) => {
  const alignRight = item.is_mine;

  return (
    <View style={[styles.row, alignRight ? styles.rowRight : styles.rowLeft]}>
      <View style={styles.bubbleWrap}>
        <Text style={[styles.timeLabel, { textAlign: alignRight ? 'right' : 'left' }]}>
          {alignRight ? 'You' : 'Counterparty'} · {item.time_label}
        </Text>
        <View style={[styles.bubble, alignRight ? styles.bubbleMine : styles.bubbleTheirs]}>
          <Text style={styles.bubbleLabel}>{item.label.toUpperCase()}</Text>
          <Text style={styles.bubblePrice}>{item.price_display}</Text>
          {!!item.note && <Text style={styles.bubbleNote}>{item.note}</Text>}
          {!!item.payment_terms && item.round_number === 1 && (
            <View style={styles.chip}>
              <Text style={styles.chipText}>{item.payment_terms}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const NegotiationScreen = ({ navigation, route }: Props) => {
  const { offerId, mode: routeMode } = route.params;
  const user = useAppSelector(s => s.auth.user);
  const mode = routeMode ?? (user?.role as 'buyer' | 'seller') ?? 'buyer';

  const [offer, setOffer] = useState<OfferState | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [counterVisible, setCounterVisible] = useState(false);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterNote, setCounterNote] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const fetchOffer = useCallback(async () => {
    try {
      setFetchError('');
      const res: any = mode === 'buyer'
        ? await api.buyer.myDemandOfferDetails(offerId)
        : await api.seller.myPostOffersDetails(offerId);
      const payload = res?.data ?? res;
      console.log('[Negotiation] API response', JSON.stringify(payload, null, 2));
      setOffer(normalizeOffer(payload, mode));
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? 'Failed to load offer';
      console.log('[Negotiation] fetch error', msg, 'mode:', mode, 'offerId:', offerId);
      setFetchError(msg);
    } finally {
      setLoading(false);
    }
  }, [offerId, mode]);

  useEffect(() => {
    fetchOffer();
  }, [fetchOffer]);

  useEffect(() => {
    joinOfferRoom(offerId);

    onCounterOffer(() => fetchOffer());
    onOfferAccepted(() => fetchOffer());
    onOfferRejected(() => fetchOffer());

    return () => {
      offNegotiationEvents();
    };
  }, [offerId, fetchOffer]);

  useEffect(() => {
    if (offer) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [offer?.history.length]);

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainTabs', params: { screen: 'Post', params: { initialTab: 'offers' } } }],
      }),
    );
  };

  const handleCounter = async () => {
    const price = parseFloat(counterPrice.replace(/[^0-9.]/g, ''));
    if (!price || isNaN(price)) {
      Alert.alert('Enter a valid price');
      return;
    }
    setActionLoading(true);
    try {
      if (mode === 'buyer') {
        await api.buyer.counterOffer(offerId, { offered_price: price, note: counterNote || undefined });
      } else {
        await api.seller.counterOffer(offerId, { offered_price: price, note: counterNote || undefined });
      }
      setCounterVisible(false);
      setCounterPrice('');
      setCounterNote('');
      fetchOffer();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Counter offer failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = () => {
    Alert.alert('Accept Offer', 'This will create a Deal. Confirm?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept',
        style: 'default',
        onPress: async () => {
          setActionLoading(true);
          try {
            if (mode === 'buyer') {
              await api.buyer.acceptOffer(offerId);
            } else {
              await api.seller.acceptOffer(offerId);
            }
            fetchOffer();
          } catch (e: any) {
            Alert.alert('Error', e?.message ?? 'Accept failed');
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleReject = () => {
    Alert.alert('Reject Offer', 'Are you sure you want to reject?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            if (mode === 'buyer') {
              await api.buyer.rejectOffer(offerId);
            } else {
              await api.seller.rejectOffer(offerId);
            }
            fetchOffer();
          } catch (e: any) {
            Alert.alert('Error', e?.message ?? 'Reject failed');
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const headerSub = offer
    ? [offer.millName, offer.commodityName].filter(Boolean).join(' · ')
    : '';

  return (
    <View style={styles.container}>
      <MockStatusBar backgroundColor="#0D3B1F" textColor="#FFFFFF" />

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
          {offer?.history.length === 0 && (
            <Text style={styles.emptyText}>No messages yet.</Text>
          )}
          {offer?.history.map((item, i) => (
            <Bubble key={i} item={item} />
          ))}
        </ScrollView>
      )}

      {!loading && offer && (
        <View style={styles.bottomBar}>
          {offer.isYourTurn ? (
            <Text style={styles.disclaimer}>Your turn — respond now</Text>
          ) : (
            <Text style={styles.disclaimer}>Waiting for counterparty…</Text>
          )}
          <View style={styles.actionRow}>
            {offer.canReject && (
              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={handleReject}
                disabled={actionLoading}
                activeOpacity={0.85}
              >
                <Text style={styles.rejectBtnText}>Reject</Text>
              </TouchableOpacity>
            )}
            {offer.canCounter && (
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setCounterVisible(true)}
                disabled={actionLoading}
                activeOpacity={0.85}
              >
                <Text style={styles.counterBtnText}>Counter</Text>
              </TouchableOpacity>
            )}
            {offer.canAccept && (
              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={handleAccept}
                disabled={actionLoading}
                activeOpacity={0.85}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.acceptBtnText}>Accept → Deal ✓</Text>
                )}
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

      {/* Counter offer modal */}
      <Modal
        visible={counterVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCounterVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Counter Offer</Text>
            <Text style={styles.modalLabel}>Your Price (PKR per 40kg)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 2800"
              keyboardType="numeric"
              value={counterPrice}
              onChangeText={setCounterPrice}
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.modalLabel}>Note (optional)</Text>
            <TextInput
              style={[styles.modalInput, styles.modalNoteInput]}
              placeholder="Add a note…"
              value={counterNote}
              onChangeText={setCounterNote}
              multiline
              placeholderTextColor="#9CA3AF"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setCounterVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmit}
                onPress={handleCounter}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalSubmitText}>Send Counter</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEF2EE' },
  header: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    backgroundColor: '#0D3B1F',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 10,
    padding: 8,
  },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  headerSub: { fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 1 },
  anonymousBadge: {
    backgroundColor: 'rgba(255,255,255,0.094)',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  anonymousText: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.53)' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  chat: { flex: 1 },
  chatContent: { padding: 14, paddingBottom: 24, gap: 16 },
  emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 40, fontSize: 13 },
  retryBtn: {
    marginTop: 14,
    backgroundColor: '#1A6B34',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  row: { flexDirection: 'row' },
  rowRight: { justifyContent: 'flex-end' },
  rowLeft: { justifyContent: 'flex-start' },
  bubbleWrap: { maxWidth: '82%' },
  timeLabel: { fontSize: 9, color: '#9CA3AF', marginBottom: 3 },
  bubble: {
    borderRadius: 16,
    padding: 12,
    minWidth: 180,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  bubbleMine: { backgroundColor: '#1A6B34', borderTopRightRadius: 4 },
  bubbleTheirs: { backgroundColor: '#145228', borderTopLeftRadius: 4 },
  bubbleLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  bubblePrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  bubbleNote: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  chipText: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  disclaimer: { fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginBottom: 8 },
  actionRow: { flexDirection: 'row', gap: 8 },
  rejectBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 11,
    alignItems: 'center',
  },
  rejectBtnText: { fontSize: 12, fontWeight: '700', color: '#EF4444' },
  counterBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#FFFDE6',
    borderWidth: 1,
    borderColor: 'rgba(243,205,3,0.33)',
    borderRadius: 11,
    alignItems: 'center',
  },
  counterBtnText: { fontSize: 12, fontWeight: '700', color: '#92400E' },
  acceptBtn: {
    flex: 2,
    paddingVertical: 12,
    backgroundColor: '#1A6B34',
    borderRadius: 11,
    alignItems: 'center',
    shadowColor: '#1A6B34',
    shadowOpacity: 0.33,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  acceptBtnText: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
  terminalBadge: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 11,
    alignItems: 'center',
  },
  terminalText: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 16 },
  modalLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 6 },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    marginBottom: 12,
  },
  modalNoteInput: { height: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalCancel: {
    flex: 1,
    paddingVertical: 13,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelText: { fontSize: 14, fontWeight: '700', color: '#6B7280' },
  modalSubmit: {
    flex: 2,
    paddingVertical: 13,
    backgroundColor: '#1A6B34',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSubmitText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
});

export default NegotiationScreen;
