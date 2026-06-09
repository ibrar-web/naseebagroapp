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

type Props = NativeStackScreenProps<RootStackParamList, 'RequestToPurchase'>;

type SupplyMill = {
  id: string;
  mill?: { id?: string; name?: string; location_label?: string };
  price_display?: string;
  available_quantity_label?: string;
  is_cheapest?: boolean;
  is_default_selected?: boolean;
};

type SupplyDetail = {
  id: string;
  code?: string;
  title?: string;
  badge_label?: string | null;
  badge?: string | null;
  hero_image_url?: string;
  available_mills_section?: { mills?: SupplyMill[] };
  post_details?: {
    rows?: Array<{ key: string; label: string; value: string }>;
  };
};

const normalizeSupply = (response: any): SupplyDetail | null => {
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
const ADDITIONAL_REQS = [
  'Grade A (Premium) required',
  'Dry packaging essential',
  'Certified organic needed',
  'Flexible on delivery date',
  'Export quality only',
];

const parseNumber = (value?: string | null) => {
  const parsed = Number(String(value ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseDays = (value?: string | null) => {
  const parsed = Number(String(value ?? '').replace(/[^\d]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const RequestToPurchaseScreen = ({ navigation, route }: Props) => {
  const { listingId } = route.params;
  const [detail, setDetail] = useState<SupplyDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [selectedMill, setSelectedMill] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('');
  const [priceMode, setPriceMode] = useState<'original' | 'offer'>('original');
  const [offerPrice, setOfferPrice] = useState('');
  const [paymentDays, setPaymentDays] = useState<string | null>(null);
  const [deliveryDays, setDeliveryDays] = useState<string | null>(null);
  const [additionalReq, setAdditionalReq] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.marketplace.public.DetailMarketSuppliesListing(
          listingId,
        );
        const normalized = normalizeSupply(res);
        if (active) {
          setDetail(normalized);
          const defaultMill = normalized?.available_mills_section?.mills?.find(
            m => m.is_default_selected || m.is_cheapest,
          );
          if (defaultMill) setSelectedMill(defaultMill.id);
        }
      } catch (err) {
        console.log('RequestToPurchase load error', err);
        if (active) setError('Unable to load listing details.');
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

  const mills = detail.available_mills_section?.mills ?? [];
  const badge = detail.badge_label ?? detail.badge;
  const heroImage =
    detail.hero_image_url ??
    `https://placehold.co/600x400?text=${encodeURIComponent(
      detail.title ?? 'Listing',
    )}`;
  const selectedMillData = mills.find(m => m.id === selectedMill);
  const selectedMillName = selectedMillData?.mill?.name ?? 'Selected mill';
  const submittedPrice =
    priceMode === 'offer'
      ? parseNumber(offerPrice)
      : parseNumber(selectedMillData?.price_display);
  const canSubmit = Boolean(
    selectedMill &&
      quantity &&
      paymentDays &&
      deliveryDays &&
      submittedPrice &&
      (priceMode === 'original' || offerPrice),
  );

  const handleSubmit = async () => {
    if (!canSubmit || !selectedMill) {
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    const payload = {
      listing_id: listingId,
      mill_id: selectedMillData?.mill?.id ?? selectedMill,
      quantity: parseNumber(quantity),
      price_option: priceMode === 'offer' ? 'MAKE_OFFER' : 'USE_LISTING_PRICE',
      offered_price_per_unit: submittedPrice,
      payment_terms: {
        type: 'FIXED',
        fixed_days: parseDays(paymentDays),
        weekly_percent: null,
      },
      delivery_terms: {
        days: parseDays(deliveryDays),
      },
      additional_requirement: additionalReq || null,
    };

    try {
      await api.buyer.sendBuyrequest(listingId, payload);
      navigation.replace('OfferSent', {
        mode: 'buyer',
        listingId,
        title: detail.title,
        code: detail.code,
        image: heroImage,
        primaryLabel: 'Purchase Request Sent Successfully!',
        subtitle: 'Seller will respond with acceptance, rejection or counter.',
        summary: [
          { label: 'Listing ID', value: detail.code ?? listingId },
          { label: 'Mill', value: selectedMillName },
          { label: 'Quantity', value: `${payload.quantity}` },
          {
            label: 'Price Option',
            value:
              priceMode === 'offer'
                ? `Offer PKR ${submittedPrice}`
                : 'Original price',
          },
          {
            label: 'Payment Terms',
            value: `${payload.payment_terms.fixed_days} days`,
          },
          {
            label: 'Delivery Terms',
            value: `${payload.delivery_terms.days} days`,
          },
        ],
      });
    } catch (err) {
      console.log('Submit purchase request error', err);
      if ((err as { code?: string })?.code !== 'AUTH_REQUIRED') {
        setSubmitError('Unable to submit request. Please try again.');
      }
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
        <Text style={styles.headerTitle}>Request to Purchase</Text>
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
              <View style={styles.previewNameRow}>
                <Text style={styles.previewName} numberOfLines={1}>
                  {detail.title ?? 'Listing'}
                </Text>
                {badge ? (
                  <View style={styles.previewBadge}>
                    <Text style={styles.previewBadgeText}>{badge}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* 1. Select Mill */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            1. Select Mill <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.sectionSubtitle}>
            Your request will be tied to one mill
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
                      <Text style={styles.millUnit}>/40kg</Text>
                    </Text>
                    {mill.available_quantity_label ? (
                      <Text style={styles.millAvail}>
                        {mill.available_quantity_label} available
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.emptyText}>
              No mills available for this listing.
            </Text>
          )}
        </View>

        {/* 2. Quantity */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            2. Quantity Required (bags) <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 100"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
            placeholderTextColor="#9CA3AF"
          />
          {quantity && selectedMillData ? (
            <View style={styles.calcBox}>
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>Unit Price</Text>
                <Text style={styles.calcValue}>
                  {selectedMillData.price_display ?? 'Ask'} / 40kg
                </Text>
              </View>
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>Quantity</Text>
                <Text style={styles.calcValue}>{quantity} bags</Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* 3. Price Option */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            3. Price Option <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.priceToggleRow}>
            <TouchableOpacity
              style={[
                styles.priceToggleBtn,
                priceMode === 'original' && styles.priceToggleBtnActive,
              ]}
              onPress={() => setPriceMode('original')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.priceToggleLabel,
                  priceMode === 'original' && styles.priceToggleLabelActive,
                ]}
              >
                Use Original Price
              </Text>
              <Text
                style={[
                  styles.priceToggleSub,
                  priceMode === 'original' && styles.priceToggleSubActive,
                ]}
              >
                {selectedMillData?.price_display ?? 'Select mill first'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.priceToggleBtn,
                priceMode === 'offer' && styles.priceToggleBtnActive,
              ]}
              onPress={() => setPriceMode('offer')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.priceToggleLabel,
                  priceMode === 'offer' && styles.priceToggleLabelActive,
                ]}
              >
                Make an Offer
              </Text>
              <Text
                style={[
                  styles.priceToggleSub,
                  priceMode === 'offer' && styles.priceToggleSubActive,
                ]}
              >
                Enter your target price
              </Text>
            </TouchableOpacity>
          </View>
          {priceMode === 'offer' ? (
            <TextInput
              style={[styles.input, { marginTop: 10 }]}
              placeholder="e.g. 4000"
              value={offerPrice}
              onChangeText={setOfferPrice}
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          ) : null}
        </View>

        {/* 4. Payment Terms */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            4. Payment Terms <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.sectionSubtitle}>
            Pay full amount within how many days?
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
        </View>

        {/* 5. Delivery Terms */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            5. Delivery Terms <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.sectionSubtitle}>
            Require delivery within how many days?
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

        {/* Additional Requirement */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Additional Requirement{' '}
            <Text style={styles.optional}>(optional)</Text>
          </Text>
          {ADDITIONAL_REQS.map(req => (
            <TouchableOpacity
              key={req}
              style={[
                styles.conditionRow,
                additionalReq === req && styles.conditionRowSelected,
              ]}
              onPress={() => setAdditionalReq(additionalReq === req ? '' : req)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.checkOuter,
                  additionalReq === req && styles.checkOuterSelected,
                ]}
              >
                {additionalReq === req ? (
                  <AppIcon name="approved" size={10} color="#217A3C" />
                ) : null}
              </View>
              <Text style={styles.conditionText}>{req}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info note */}
        <View style={styles.infoNote}>
          <AppIcon name="approved" size={13} color="#1A6B34" />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoNoteTitle}>How it works</Text>
            <Text style={styles.infoNoteText}>
              1.5% Naseeb platform fee is charged at the last payment. The
              seller will receive your request and can accept or reject it
              directly.
            </Text>
          </View>
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
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>
              {canSubmit ? 'Submit Request' : 'Fill all required fields'}
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
  previewImage: { height: 90 },
  previewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  previewBottom: { position: 'absolute', bottom: 10, left: 14, zIndex: 2 },
  previewCode: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  previewNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  previewName: { fontSize: 17, fontWeight: '900', color: '#FFFFFF' },
  previewBadge: {
    backgroundColor: '#F3CD03',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  previewBadgeText: { fontSize: 10, fontWeight: '800', color: '#0D3B1F' },
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
  calcBox: {
    marginTop: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4,
  },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between' },
  calcLabel: { fontSize: 12, color: '#6B7280' },
  calcValue: { fontSize: 12, fontWeight: '600', color: '#111827' },
  priceToggleRow: { flexDirection: 'row', gap: 8 },
  priceToggleBtn: {
    flex: 1,
    padding: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  priceToggleBtnActive: { borderColor: '#2E9E52', backgroundColor: '#F2FBF5' },
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
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    gap: 11,
    alignItems: 'flex-start',
  },
  infoNoteTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A6B34',
    marginBottom: 4,
  },
  infoNoteText: { fontSize: 12, color: '#374151', lineHeight: 18 },
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
    backgroundColor: '#1A6B34',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitBtnDisabled: { backgroundColor: '#9CA3AF' },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});

export default RequestToPurchaseScreen;
