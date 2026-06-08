import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppIcon } from '../../../assets/icons';
import { RootStackParamList } from '../../../navigation/types';
import MockStatusBar from '../../components/MockStatusBar';
import api from '../../../utils/api';

type Props = NativeStackScreenProps<RootStackParamList, 'SendOffer'>;

type DemandMill = {
  id: string;
  mill?: { id?: string; name?: string; location_label?: string };
  price_display?: string;
  price_unit_label?: string;
  requested_quantity_label?: string;
};

type DemandDetail = {
  id: string;
  code?: string;
  title?: string;
  hero_image_url?: string;
  header_stats?: Array<{ key: string; label: string; value: string }>;
  quantity_label?: string;
  delivery_location?: { label?: string };
  mills_specified_section?: {
    mills?: DemandMill[];
    has_mills?: boolean;
  };
};

const normalizeDemand = (response: any): DemandDetail | null => {
  const payload = response?.id ? response : response?.data ?? response;
  return payload?.id ? payload : null;
};

const PAYMENT_OPTS = ['7 Days', '15 Days', '30 Days', '45 Days', '60 Days'];
const DELIVERY_OPTS = [
  '1 Day',
  '2 Days',
  '3 Days',
  '5 Days',
  '7 Days',
  '10 Days',
  '14 Days',
];
const OFFER_CONDITIONS = [
  'Fresh season stock',
  'Dry packaging included',
  'Transport arranged by seller',
  'Available for pre-dispatch inspection',
  'Immediate dispatch available',
  'Grade A quality guaranteed',
  'Price negotiable in bulk',
];

const parseNumber = (value?: string | null) => {
  const parsed = Number(String(value ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseDays = (value?: string | null) => {
  const parsed = Number(String(value ?? '').replace(/[^\d]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const SendOfferScreen = ({ navigation, route }: Props) => {
  const { listingId } = route.params;
  const [detail, setDetail] = useState<DemandDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [selectedMill, setSelectedMill] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('');
  const [priceMode, setPriceMode] = useState<'listed' | 'counter'>('listed');
  const [counterPrice, setCounterPrice] = useState('');
  const [paymentDays, setPaymentDays] = useState<string | null>(null);
  const [deliveryDays, setDeliveryDays] = useState<string | null>(null);
  const [offerCondition, setOfferCondition] = useState('');
  const [conditionOpen, setConditionOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.marketplace.public.DetailMarketDemandsListing(
          listingId,
        );
        const normalized = normalizeDemand(res);
        if (active) {
          setDetail(normalized);
          const firstMill = normalized?.mills_specified_section?.mills?.[0];
          if (firstMill) {
            setSelectedMill(firstMill.id);
          }
        }
      } catch (err) {
        console.log('SendOffer load error', err);
        if (active) setError('Unable to load listing.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [listingId]);

  if (loading && !detail) {
    return (
      <View style={styles.stateScreen}>
        <MockStatusBar backgroundColor="#F9FAFB" textColor="#111827" />
        <ActivityIndicator color="#217A3C" size="large" />
        <Text style={styles.stateText}>Loading listing...</Text>
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={styles.stateScreen}>
        <MockStatusBar backgroundColor="#F9FAFB" textColor="#111827" />
        <AppIcon name="notificationWarning" size={34} color="#D97706" />
        <Text style={styles.stateText}>{error || 'Listing not found.'}</Text>
        <TouchableOpacity
          style={styles.stateButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Text style={styles.stateButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const mills = detail.mills_specified_section?.mills ?? [];
  const heroImage =
    detail.hero_image_url ??
    `https://placehold.co/600x400?text=${encodeURIComponent(
      detail.title ?? 'Demand',
    )}`;
  const stats = (
    detail.header_stats ?? [
      { key: 'qty', label: 'QUANTITY', value: detail.quantity_label ?? '' },
      {
        key: 'loc',
        label: 'LOCATION',
        value: detail.delivery_location?.label ?? '',
      },
    ]
  ).filter(s => s.value);
  const selectedMillData = mills.find(m => m.id === selectedMill);
  const selectedMillName = selectedMillData?.mill?.name ?? 'Selected mill';
  const submittedPrice =
    priceMode === 'counter'
      ? parseNumber(counterPrice)
      : parseNumber(selectedMillData?.price_display);
  const canSubmit = Boolean(
    selectedMill &&
      quantity &&
      paymentDays &&
      deliveryDays &&
      submittedPrice &&
      (priceMode === 'listed' || counterPrice),
  );

  const handleSubmit = async () => {
    if (!canSubmit || !selectedMill) {
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    const payload = {
      demand_id: listingId,
      mill_id: selectedMillData?.mill?.id ?? selectedMill,
      supply_quantity: parseNumber(quantity),
      price_option:
        priceMode === 'listed' ? 'USE_BUYER_BUDGET' : 'COUNTER_PRICE',
      counter_price_per_unit: submittedPrice,
      counter_payment_terms: {
        type: 'FIXED',
        fixed_days: parseDays(paymentDays),
        weekly_percent: null,
      },
      counter_delivery_terms: {
        days: parseDays(deliveryDays),
      },
      offer_condition: offerCondition || null,
    };

    try {
      await api.seller.sendDemandOffer(listingId, payload);
      navigation.replace('OfferSent', {
        mode: 'seller',
        listingId,
        title: detail.title,
        code: detail.code,
        image: heroImage,
        primaryLabel: 'Offer Sent Successfully!',
        subtitle: 'Buyer will respond with acceptance, rejection or counter.',
        summary: [
          { label: 'Demand ID', value: detail.code ?? listingId },
          { label: 'Mill', value: selectedMillName },
          { label: 'Supply Quantity', value: `${payload.supply_quantity}` },
          {
            label: 'Price Option',
            value:
              priceMode === 'counter'
                ? `Counter PKR ${submittedPrice}`
                : 'Buyer budget',
          },
          {
            label: 'Payment Terms',
            value: `${payload.counter_payment_terms.fixed_days} days`,
          },
          {
            label: 'Delivery Terms',
            value: `${payload.counter_delivery_terms.days} days`,
          },
        ],
      });
    } catch (err) {
      console.log('Submit demand offer error', err);
      setSubmitError('Unable to send offer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <MockStatusBar backgroundColor="#FFFFFF" textColor="#111827" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <AppIcon name="back" size={19} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Offer</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Preview card */}
        <View style={styles.previewCard}>
          <ImageBackground
            source={{ uri: heroImage }}
            style={styles.previewImage}
            resizeMode="cover"
          >
            <View style={styles.previewOverlay} />
            <View style={styles.previewBottom}>
              <Text style={styles.previewCode}>{detail.code ?? detail.id}</Text>
              <Text style={styles.previewTitle} numberOfLines={1}>
                {detail.title ?? 'Demand Request'}
              </Text>
            </View>
          </ImageBackground>
          {stats.length ? (
            <View style={styles.statsBar}>
              {stats.map((stat, i) => (
                <View
                  key={stat.key}
                  style={[styles.statItem, i > 0 && styles.statItemBorder]}
                >
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statValue} numberOfLines={1}>
                    {stat.value}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* 1. Select Mill */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            1. Select Your Mill <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.sectionSubtitle}>
            Choose which of your mills will fulfil this order
          </Text>
          {mills.length ? (
            mills.map(mill => {
              const isSelected = selectedMill === mill.id;
              return (
                <TouchableOpacity
                  key={mill.id}
                  onPress={() => setSelectedMill(mill.id)}
                  style={[styles.millRow, isSelected && styles.millRowSelected]}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.radioOuter,
                      isSelected && styles.radioOuterSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.millName}>
                      {mill.mill?.name ?? 'Mill'}
                    </Text>
                    <Text style={styles.millLocation}>
                      {mill.mill?.location_label ?? ''}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.millPrice}>
                      {mill.price_display ?? 'Ask'}
                      {mill.price_unit_label ? (
                        <Text style={styles.millUnit}>
                          {mill.price_unit_label}
                        </Text>
                      ) : null}
                    </Text>
                    {mill.requested_quantity_label ? (
                      <Text style={styles.millAvail}>
                        {mill.requested_quantity_label}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No mills specified by buyer.</Text>
          )}
        </View>

        {/* 2. Quantity */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            2. Quantity You Can Supply (bags){' '}
            <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 150"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* 3. Price */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            3. Your Price <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.priceToggleRow}>
            <TouchableOpacity
              style={[
                styles.priceToggleBtn,
                priceMode === 'listed' && styles.priceToggleBtnActive,
              ]}
              onPress={() => setPriceMode('listed')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.priceToggleLabel,
                  priceMode === 'listed' && styles.priceToggleLabelActive,
                ]}
              >
                Use Listed Price
              </Text>
              <Text
                style={[
                  styles.priceToggleSub,
                  priceMode === 'listed' && styles.priceToggleSubActive,
                ]}
              >
                {selectedMillData?.price_display ?? 'Select mill first'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.priceToggleBtn,
                priceMode === 'counter' && styles.priceToggleBtnActive,
              ]}
              onPress={() => setPriceMode('counter')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.priceToggleLabel,
                  priceMode === 'counter' && styles.priceToggleLabelActive,
                ]}
              >
                Make a Counter
              </Text>
              <Text
                style={[
                  styles.priceToggleSub,
                  priceMode === 'counter' && styles.priceToggleSubActive,
                ]}
              >
                Enter a different price
              </Text>
            </TouchableOpacity>
          </View>
          {priceMode === 'counter' ? (
            <TextInput
              style={[styles.input, { marginTop: 10 }]}
              placeholder="e.g. 4000"
              value={counterPrice}
              onChangeText={setCounterPrice}
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          ) : null}
        </View>

        {/* 4. Payment & Delivery Terms */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>4. Payment & Delivery Terms</Text>
          <Text style={styles.sectionSubtitle}>
            Payment within how many days?
          </Text>
          <View style={styles.chipRow}>
            {PAYMENT_OPTS.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.chip,
                  paymentDays === opt && styles.chipSelected,
                ]}
                onPress={() => setPaymentDays(paymentDays === opt ? null : opt)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.chipText,
                    paymentDays === opt && styles.chipTextSelected,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.sectionSubtitle, { marginTop: 12 }]}>
            Delivery within how many days?
          </Text>
          <View style={styles.chipRow}>
            {DELIVERY_OPTS.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.chip,
                  deliveryDays === opt && styles.chipSelected,
                ]}
                onPress={() =>
                  setDeliveryDays(deliveryDays === opt ? null : opt)
                }
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.chipText,
                    deliveryDays === opt && styles.chipTextSelected,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 5. Offer Condition */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            5. Offer Condition <Text style={styles.optional}>(optional)</Text>
          </Text>
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => setConditionOpen(current => !current)}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.dropdownText,
                !offerCondition && styles.dropdownPlaceholder,
              ]}
              numberOfLines={1}
            >
              {offerCondition || 'Select offer condition'}
            </Text>
            <AppIcon
              name={conditionOpen ? 'chevronDown' : 'chevronRight'}
              size={15}
              color="#6B7280"
            />
          </TouchableOpacity>
          {conditionOpen ? (
            <View style={styles.dropdownMenu}>
              {OFFER_CONDITIONS.map(cond => (
                <TouchableOpacity
                  key={cond}
                  style={[
                    styles.conditionRow,
                    offerCondition === cond && styles.conditionRowSelected,
                  ]}
                  onPress={() => {
                    setOfferCondition(offerCondition === cond ? '' : cond);
                    setConditionOpen(false);
                  }}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.checkOuter,
                      offerCondition === cond && styles.checkOuterSelected,
                    ]}
                  >
                    {offerCondition === cond ? (
                      <AppIcon name="approved" size={10} color="#217A3C" />
                    ) : null}
                  </View>
                  <Text style={styles.conditionText}>{cond}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>

        {/* Info note */}
        <View style={styles.infoNote}>
          <AppIcon name="shield" size={13} color="#217A3C" />
          <Text style={styles.infoNoteText}>
            Your offer goes directly to the buyer. They can accept, reject, or
            send a counter offer.{' '}
            <Text style={{ fontWeight: '700' }}>1.5% platform fee</Text> on
            final payment.
          </Text>
        </View>

        {submitError ? (
          <View style={styles.errorBox}>
            <AppIcon name="notificationWarning" size={13} color="#B45309" />
            <Text style={styles.errorText}>{submitError}</Text>
          </View>
        ) : null}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          activeOpacity={0.88}
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#0D3B1F" />
          ) : (
            <Text style={styles.submitBtnText}>
              {canSubmit
                ? 'Send Offer'
                : 'Select mill, qty, terms and price to continue'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 24,
  },
  stateText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  stateButton: {
    marginTop: 18,
    backgroundColor: '#217A3C',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  stateButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: { padding: 4, borderRadius: 8 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  scrollContent: { padding: 14, paddingBottom: 20 },
  previewCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  previewImage: { height: 100 },
  previewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.52)',
  },
  previewBottom: {
    position: 'absolute',
    bottom: 10,
    left: 14,
    right: 14,
    zIndex: 2,
  },
  previewCode: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  previewTitle: { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },
  statsBar: {
    backgroundColor: '#145228',
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: 'row',
  },
  statItem: { flex: 1 },
  statItemBorder: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.15)',
    paddingLeft: 12,
  },
  statLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '800',
    marginBottom: 1,
  },
  statValue: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  required: { color: '#EF4444' },
  optional: { fontSize: 11, color: '#9CA3AF', fontWeight: '400' },
  sectionSubtitle: { fontSize: 11, color: '#6B7280', marginBottom: 10 },
  millRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  millRowSelected: { borderColor: '#1A6B34', backgroundColor: '#F2FBF5' },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioOuterSelected: { borderColor: '#1A6B34' },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#1A6B34',
  },
  millName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  millLocation: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  millPrice: { fontSize: 14, fontWeight: '900', color: '#1A6B34' },
  millUnit: { fontSize: 10, fontWeight: '500', color: '#9CA3AF' },
  millAvail: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  emptyText: { fontSize: 12, color: '#9CA3AF' },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FAFAFA',
  },
  priceToggleRow: { flexDirection: 'row', gap: 8 },
  priceToggleBtn: {
    flex: 1,
    padding: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  priceToggleBtnActive: {
    borderColor: '#2E9E52',
    backgroundColor: '#F2FBF5',
  },
  priceToggleLabel: { fontSize: 12, fontWeight: '700', color: '#374151' },
  priceToggleLabelActive: { color: '#1A6B34' },
  priceToggleSub: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  priceToggleSubActive: { color: '#217A3C' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  chipSelected: { borderColor: '#1A6B34', backgroundColor: '#F2FBF5' },
  chipText: { fontSize: 12, fontWeight: '500', color: '#374151' },
  chipTextSelected: { color: '#1A6B34', fontWeight: '700' },
  dropdownBtn: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownText: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
    fontWeight: '700',
  },
  dropdownPlaceholder: { color: '#9CA3AF', fontWeight: '500' },
  dropdownMenu: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  conditionRowSelected: { backgroundColor: 'transparent' },
  checkOuter: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkOuterSelected: { borderColor: '#217A3C', backgroundColor: '#E8F7EE' },
  conditionText: { fontSize: 13, color: '#374151', flex: 1 },
  infoNote: {
    backgroundColor: '#F2FBF5',
    borderWidth: 1.5,
    borderColor: '#7FD4A0',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  infoNoteText: { fontSize: 11, color: '#1A6B34', lineHeight: 17, flex: 1 },
  errorBox: {
    marginTop: 12,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: { flex: 1, fontSize: 12, color: '#92400E', fontWeight: '700' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  submitBtn: {
    backgroundColor: '#F3CD03',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitBtnDisabled: { backgroundColor: '#9CA3AF' },
  submitBtnText: { fontSize: 14, fontWeight: '800', color: '#0D3B1F' },
});

export default SendOfferScreen;
