import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
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

type Props = NativeStackScreenProps<RootStackParamList, 'OfferDetail'>;
type AppMode = 'buyer' | 'seller';

type OfferHistoryEvent = {
  actor: string;
  badge?: string;
  title: string;
  time: string;
  price: string;
};

type OfferDetail = {
  id: string;
  code: string;
  title: string;
  image: string;
  fallback: string;
  myOffer: string;
  qty: string;
  mill: string;
  payment: string;
  alert: string;
  statusColor: string;
  isYourTurn: boolean;
  canCounter: boolean;
  canAccept: boolean;
  canReject: boolean;
  history: OfferHistoryEvent[];
};

const firstValue = (...values: any[]) =>
  values.find(value => value !== undefined && value !== null && value !== '');

const stringify = (value: any, fallback = '') => {
  const resolved = firstValue(value);
  if (resolved === undefined) {
    return fallback;
  }
  return String(resolved);
};

const titleCaseStatus = (status?: string) => {
  const raw = stringify(status, 'Pending').replace(/_/g, ' ').trim();
  if (!raw) {
    return 'Pending';
  }
  return raw
    .split(' ')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

const formatDateLabel = (value?: string) => {
  if (!value) {
    return 'Recently';
  }
  if (value.includes('ago')) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const priceDisplay = (item: any) => {
  const explicit = firstValue(
    item.price_display,
    item.offer_price_display,
    item.counter_price_display,
    item.latest_price_display,
    item.budget_display,
  );
  if (explicit) {
    return String(explicit);
  }

  const price = firstValue(
    item.offered_price_per_unit,
    item.counter_price_per_unit,
    item.price,
  );
  if (price) {
    return `PKR ${price}`;
  }
  return 'Ask';
};

const findArray = (body: any, keys: string[]) => {
  if (Array.isArray(body)) {
    return body;
  }

  for (const key of keys) {
    if (Array.isArray(body?.[key])) {
      return body[key];
    }
  }

  if (body?.data && typeof body.data === 'object') {
    for (const key of keys) {
      if (Array.isArray(body.data?.[key])) {
        return body.data[key];
      }
    }
  }

  return [];
};

const normalizeHistory = (payload: any, mode: AppMode): OfferHistoryEvent[] => {
  const events = findArray(payload, [
    'history',
    'offer_history',
    'timeline',
    'events',
    'negotiations',
  ]);

  if (!events.length) {
    return [
      {
        actor: mode === 'buyer' ? 'Buyer' : 'Seller',
        badge: 'YOU',
        title: titleCaseStatus(
          firstValue(payload.status_label, payload.status),
        ),
        time: formatDateLabel(firstValue(payload.created_at, payload.sent_at)),
        price: priceDisplay(payload),
      },
    ];
  }

  return events.map((event: any, index: number) => ({
    actor: stringify(
      firstValue(
        event.label,
        event.actor_label,
        event.actor,
        event.user?.fullName,
      ),
      index === 0 ? (mode === 'buyer' ? 'Buyer' : 'Seller') : 'Counterparty',
    ),
    badge:
      event.is_mine || event.is_current_user || event.badge === 'YOU'
        ? 'YOU'
        : event.badge,
    title: stringify(
      firstValue(event.title, event.type_label, event.action, event.status_label),
      event.round_number === 1 ? 'Initial Offer' : `Counter Offer${event.round_number ? ` · Round ${event.round_number}` : ''}`,
    ),
    time: formatDateLabel(
      firstValue(event.time_label, event.created_at, event.time),
    ),
    price: stringify(firstValue(event.price_display), priceDisplay(event)),
  }));
};

const normalizeOfferDetail = (
  response: any,
  id: string,
  mode: AppMode,
): OfferDetail | null => {
  const root =
    response?.status && response?.data ? response.data : response ?? {};
  const payload = root?.id ? root : root?.data ?? root;

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const title = stringify(
    firstValue(
      payload.title,
      payload.post?.title,
      payload.demand?.title,
      payload.supply?.title,
      payload.commodity?.name,
      payload.commodity_name,
    ),
    'Offer',
  );
  const status = titleCaseStatus(
    firstValue(payload.status_label, payload.status),
  );
  const initial = payload.initial_offer ?? {};
  const millName = stringify(
    firstValue(initial.mill?.name, payload.mill?.name),
    mode === 'buyer' ? 'Seller' : 'Buyer',
  );
  const millCity = initial.mill?.city ? `, ${initial.mill.city}` : '';

  return {
    id: stringify(firstValue(payload.id, payload.offer_id, payload.uuid), id),
    code: stringify(firstValue(payload.code, payload.offer_code), id),
    title,
    image:
      firstValue(
        payload.commodity?.image_url,
        payload.hero_image_url,
        payload.image_url,
        payload.image,
        payload.post?.hero_image_url,
        payload.demand?.hero_image_url,
      ) ?? `https://placehold.co/600x400?text=${encodeURIComponent(title)}`,
    fallback: '#8A9A5B',
    myOffer: stringify(
      firstValue(
        initial.price_display,
        payload.offer_price_display,
        payload.price_display,
      ),
      priceDisplay(payload),
    ),
    qty: stringify(
      firstValue(
        initial.quantity_label,
        payload.quantity_label,
        payload.supply_quantity_label,
        payload.quantity,
      ),
      'Quantity not set',
    ),
    mill: `${millName}${millCity}`,
    payment: stringify(
      firstValue(
        initial.payment_terms,
        payload.payment_terms_label,
        payload.payment_terms?.label,
        payload.payment_days ? `${payload.payment_days} days` : undefined,
      ),
      'Payment not set',
    ),
    alert: stringify(
      firstValue(payload.status_subtext, payload.alert_label, payload.action_label),
      status,
    ),
    statusColor: stringify(payload.status_color, ''),
    isYourTurn: payload.is_your_turn === true,
    canCounter: payload.actions?.can_counter === true,
    canAccept: payload.actions?.can_accept === true,
    canReject: payload.actions?.can_reject === true,
    history: normalizeHistory(payload, mode),
  };
};

const OfferDetailScreen = ({ navigation, route }: Props) => {
  const currentMode = useAppSelector(s => s.app.mode) as AppMode;
  const mode = route.params.mode ?? currentMode;
  const isBuyer = mode === 'buyer';
  const { offerId } = route.params;
  const [offerDetail, setOfferDetail] = useState<OfferDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'MainTabs',
            params: { screen: 'Post', params: { initialTab: 'offers' } },
          },
        ],
      }),
    );
  };

  const reloadDetail = async () => {
    try {
      const response = isBuyer
        ? await api.buyer.myDemandOfferDetails(offerId)
        : await api.seller.myPostOffersDetails(offerId);
      const normalized = normalizeOfferDetail(response, offerId, mode);
      if (normalized) setOfferDetail(normalized);
    } catch {}
  };

  const handleAccept = () => {
    showConfirm('info', 'Accept Offer', 'This will create a Deal instantly. Continue?', async () => {
      setActionLoading(true);
      try {
        isBuyer
          ? await api.buyer.acceptOffer(offerId)
          : await api.seller.acceptOffer(offerId);
        await reloadDetail();
      } catch (e: any) {
        showAlert('error', 'Error', e?.response?.data?.message ?? e?.message ?? 'Accept failed');
      } finally {
        setActionLoading(false);
      }
    });
  };

  const handleReject = (isSender: boolean) => {
    const label = isSender ? 'Cancel Offer' : 'Reject Offer';
    const msg = isSender
      ? 'Withdraw your offer? This cannot be undone.'
      : 'Reject this offer? This cannot be undone.';
    showConfirm('warning', label, msg, async () => {
      setActionLoading(true);
      try {
        isBuyer
          ? await api.buyer.rejectOffer(offerId)
          : await api.seller.rejectOffer(offerId);
        await reloadDetail();
      } catch (e: any) {
        showAlert('error', 'Error', e?.response?.data?.message ?? e?.message ?? 'Action failed');
      } finally {
        setActionLoading(false);
      }
    });
  };

  useEffect(() => {
    let active = true;
    const loadDetail = async () => {
      setLoading(true);
      setError('');

      try {
        const response = isBuyer
          ? await api.buyer.myDemandOfferDetails(offerId)
          : await api.seller.myPostOffersDetails(offerId);
        const normalized = normalizeOfferDetail(response, offerId, mode);

        console.log('offer details screen:', response);
        if (active) {
          setOfferDetail(normalized);
        }
      } catch (err) {
        console.log('Offer detail load error', err);
        if (active && (err as { code?: string })?.code !== 'AUTH_REQUIRED') {
          setError('Unable to load offer details.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDetail();
    return () => {
      active = false;
    };
  }, [isBuyer, mode, offerId]);

  if (loading && !offerDetail) {
    return (
      <View style={styles.stateScreen}>
        <MockStatusBar backgroundColor="#F9FAFB" textColor="#111827" />
        <ActivityIndicator color="#217A3C" size="large" />
        <Text style={styles.stateText}>Loading offer details...</Text>
      </View>
    );
  }

  if (!offerDetail) {
    return (
      <View style={styles.stateScreen}>
        <MockStatusBar backgroundColor="#F9FAFB" textColor="#111827" />
        <AppIcon name="notificationWarning" size={34} color="#D97706" />
        <Text style={styles.stateText}>
          {error || 'Offer details not found.'}
        </Text>
        <TouchableOpacity
          style={styles.stateButton}
          onPress={goBack}
          activeOpacity={0.85}
        >
          <Text style={styles.stateButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MockStatusBar backgroundColor="#FFFFFF" textColor="#111827" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goBack}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <AppIcon name="back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offer Detail</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <ImageBackground
            source={{ uri: offerDetail.image }}
            resizeMode="cover"
            style={styles.heroImage}
            imageStyle={{ backgroundColor: offerDetail.fallback }}
          >
            <View style={styles.heroOverlay} />
            <View style={styles.heroBottom}>
              <Text style={styles.heroId}>{offerDetail.code}</Text>
              <Text style={styles.heroTitle}>{offerDetail.title}</Text>
            </View>
            <View style={styles.anonymousPill}>
              <AppIcon name="shield" size={10} color="rgba(255,255,255,0.8)" />
              <Text style={styles.anonymousText}>Protected</Text>
            </View>
          </ImageBackground>

          <View style={styles.summaryBar}>
            {[
              ['YOUR OFFER', offerDetail.myOffer],
              ['QTY', offerDetail.qty],
              ['MILL', offerDetail.mill],
              ['PAYMENT', offerDetail.payment],
            ].map(([label, value], index) => (
              <View
                key={label}
                style={[
                  styles.summaryItem,
                  index > 0 && styles.summaryItemBorder,
                ]}
              >
                <Text style={styles.summaryLabel}>{label}</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    index === 0 && styles.summaryPrice,
                  ]}
                  numberOfLines={1}
                >
                  {value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[
          styles.alertBanner,
          offerDetail.statusColor === 'blue' && styles.alertBannerBlue,
        ]}>
          <View style={[
            styles.alertDot,
            offerDetail.statusColor === 'blue' && styles.alertDotBlue,
          ]} />
          <Text style={[
            styles.alertText,
            offerDetail.statusColor === 'blue' && styles.alertTextBlue,
          ]}>{offerDetail.alert}</Text>
        </View>

        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>Offer History</Text>
          {offerDetail.history.map((event, index) => (
            <View
              key={`${event.title}-${index}`}
              style={[
                styles.historyRow,
                index < offerDetail.history.length - 1 && styles.historyBorder,
              ]}
            >
              <View style={styles.historyLeft}>
                <Text style={styles.historyActor}>
                  {event.actor}{' '}
                  {event.badge ? (
                    <Text style={styles.historyBadge}>{event.badge}</Text>
                  ) : null}
                </Text>
                <Text style={styles.historyEvent}>{event.title}</Text>
                <Text style={styles.historyTime}>{event.time}</Text>
              </View>
              <Text style={styles.historyPrice}>{event.price}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.negotiateBtn}
            activeOpacity={0.86}
            onPress={() => navigation.navigate('Negotiation', { offerId, mode })}
          >
            <AppIcon name="notificationWarning" size={17} color="#0D3B1F" />
            <Text style={styles.negotiateBtnText}>Open Negotiation</Text>
          </TouchableOpacity>

          {/* Receiver: can accept the last offer made by the other party */}
          {offerDetail.canAccept ? (
            <TouchableOpacity
              style={[styles.acceptBtn, actionLoading && styles.btnDisabled]}
              activeOpacity={0.86}
              disabled={actionLoading}
              onPress={handleAccept}
            >
              {actionLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <AppIcon name="approved" size={16} color="#FFFFFF" />
                  <Text style={styles.acceptBtnText}>Accept Deal</Text>
                </>
              )}
            </TouchableOpacity>
          ) : null}

          {/* Receiver: reject the incoming offer */}
          {offerDetail.canAccept && offerDetail.canReject ? (
            <TouchableOpacity
              style={[styles.cancelBtn, actionLoading && styles.btnDisabled]}
              activeOpacity={0.84}
              disabled={actionLoading}
              onPress={() => handleReject(false)}
            >
              <Text style={styles.cancelBtnText}>Reject Offer</Text>
            </TouchableOpacity>
          ) : null}

          {/* Sender: withdraw their own pending offer (not your turn, still active) */}
          {!offerDetail.canAccept && offerDetail.canReject ? (
            <TouchableOpacity
              style={[styles.cancelBtn, actionLoading && styles.btnDisabled]}
              activeOpacity={0.84}
              disabled={actionLoading}
              onPress={() => handleReject(true)}
            >
              <Text style={styles.cancelBtnText}>Cancel Offer</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  stateScreen: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 12,
  },
  stateText: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    fontWeight: '600',
  },
  stateButton: {
    marginTop: 4,
    backgroundColor: '#217A3C',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  stateButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  scroll: { flex: 1 },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  headerSpacer: { width: 30 },
  content: { padding: 14, paddingBottom: 100 },
  heroCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  heroImage: { height: 90, width: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  heroBottom: { position: 'absolute', bottom: 10, left: 14, zIndex: 2 },
  heroId: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'monospace',
    marginBottom: 1,
  },
  heroTitle: { fontSize: 16, fontWeight: '900', color: '#FFFFFF' },
  anonymousPill: {
    position: 'absolute',
    top: 10,
    right: 12,
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  anonymousText: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
  },
  summaryBar: {
    backgroundColor: '#145228',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
  },
  summaryItem: { flex: 1 },
  summaryItemBorder: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.13)',
    paddingLeft: 8,
  },
  summaryLabel: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.33)',
    marginBottom: 2,
  },
  summaryValue: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  summaryPrice: { color: '#F7DB4A' },
  alertBanner: {
    backgroundColor: '#FFFDE6',
    borderWidth: 1,
    borderColor: 'rgba(243,205,3,0.27)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 16,
  },
  alertBannerBlue: {
    backgroundColor: '#EFF6FF',
    borderColor: 'rgba(59,130,246,0.3)',
  },
  alertDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#F3CD03',
  },
  alertDotBlue: { backgroundColor: '#3B82F6' },
  alertText: { flex: 1, fontSize: 12, fontWeight: '700', color: '#92400E' },
  alertTextBlue: { color: '#1D4ED8' },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  historyBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  historyLeft: { flex: 1 },
  historyActor: { fontSize: 11, color: '#6B7280', marginBottom: 2 },
  historyBadge: {
    backgroundColor: '#F2FBF5',
    color: '#1A6B34',
    fontSize: 9,
    fontWeight: '700',
  },
  historyEvent: { fontSize: 12, fontWeight: '600', color: '#374151' },
  historyTime: { fontSize: 10, color: '#9CA3AF', marginTop: 1 },
  historyPrice: { fontSize: 16, fontWeight: '900', color: '#1A6B34' },
  actions: { gap: 10 },
  negotiateBtn: {
    backgroundColor: '#F3CD03',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#F3CD03',
    shadowOpacity: 0.33,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  negotiateBtnText: { fontSize: 15, fontWeight: '600', color: '#0D3B1F' },
  acceptBtn: {
    backgroundColor: '#217A3C',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#2E9E52',
    shadowOpacity: 0.27,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  acceptBtnText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  cancelBtn: {
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 13, fontWeight: '700', color: '#EF4444' },
  btnDisabled: { opacity: 0.5 },
});

export default OfferDetailScreen;
