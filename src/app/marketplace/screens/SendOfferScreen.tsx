import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppIcon } from '../../../assets/icons';
import { RootStackParamList } from '../../../navigation/types';
import MockStatusBar from '../../components/MockStatusBar';
import AppLoader from '../../components/AppLoader';
import api from '../../../utils/api';
import { useOfferTerms } from '../hooks/useOfferTerms';
import { OfferPreviewCard } from '../components/OfferPreviewCard';
import { OfferMillSelector } from '../components/OfferMillSelector';
import { OfferTermsChips } from '../components/OfferTermsChips';
import { OfferConditionDropdown } from '../components/OfferConditionDropdown';
import { offerStyles as s } from '../components/offerStyles';

type Props = NativeStackScreenProps<RootStackParamList, 'SendOffer'>;
type PriceOption = 'USE_BUYER_BUDGET' | 'MAKE_COUNTER';

const OFFER_CONDITIONS = [
  'Fresh season stock',
  'Dry packaging included',
  'Transport arranged by seller',
  'Available for pre-dispatch inspection',
  'Immediate dispatch available',
  'Grade A quality guaranteed',
  'Price negotiable in bulk',
];
const PRICE_OPTIONS = [
  { label: 'Use Original Price', subLabel: 'Use the buyer listed price', value: 'USE_BUYER_BUDGET' as PriceOption },
  { label: 'Make an Offer', subLabel: 'Enter a different price', value: 'MAKE_COUNTER' as PriceOption },
];

const normalizeDemand = (r: any) => {
  const p = r?.id ? r : r?.listing_id ? { ...r, id: r.listing_id } : r?.data ?? r;
  return p?.id ? p : null;
};
const stripNonDigit = (v?: string | null) => Number(String(v ?? '').replace(/[^\d.]/g, ''));
const enforceInt = (v: string) => v.replace(/[^0-9]/g, '');
const enforceDecimal = (v: string) => v.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');

export const SendOfferScreen = ({ navigation, route }: Props) => {
  const { listingId } = route.params;
  const { paymentOpts, deliveryOpts } = useOfferTerms();
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [selectedMill, setSelectedMill] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('');
  const [priceMode, setPriceMode] = useState<PriceOption>('USE_BUYER_BUDGET');
  const [counterPrice, setCounterPrice] = useState('');
  const [paymentDays, setPaymentDays] = useState<number | null>(null);
  const [deliveryDays, setDeliveryDays] = useState<number | null>(null);
  const [offerCondition, setOfferCondition] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.marketplace.public.DetailMarketDemandsListing(listingId)
      .then((res: any) => {
        const norm = normalizeDemand(res);
        if (!active) return;
        setDetail(norm);
        const first = norm?.mills_specified_section?.mills?.[0];
        if (first) setSelectedMill(first.id);
      })
      .catch(() => { if (active) setError('Unable to load listing.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [listingId]);

  if (loading) return (
    <View style={s.stateScreen}>
      <MockStatusBar backgroundColor="#F9FAFB" textColor="#111827" />
      <ActivityIndicator color="#217A3C" size="large" />
      <Text style={s.stateText}>Loading listing...</Text>
    </View>
  );

  if (!detail) return (
    <View style={s.stateScreen}>
      <MockStatusBar backgroundColor="#F9FAFB" textColor="#111827" />
      <AppIcon name="notificationWarning" size={34} color="#D97706" />
      <Text style={s.stateText}>{error || 'Listing not found'}</Text>
      <TouchableOpacity style={s.stateButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
        <Text style={s.stateButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );

  const hasMills = (detail.mills?.is_mill_based ?? detail.mills_specified_section?.has_mills ?? false) &&
    ((detail.mills?.available_mills?.length ?? 0) > 0 || (detail.mills_specified_section?.mills?.length ?? 0) > 0);
  const mills =detail.mills?.available_mills ?? detail.mills_specified_section?.mills ?? [];
  const heroImage = detail.category?.image ?? detail.commodity?.image ?? detail.hero_image_url ?? `https://placehold.co/600x400?text=${encodeURIComponent(detail.title ?? 'Demand')}`;
  const stats = (detail.header_stats ?? [
    { key: 'qty', label: 'QUANTITY', value: detail.quantity_label ?? '' },
    { key: 'loc', label: 'LOCATION', value: detail.delivery_location?.label ?? '' },
  ]).filter((st: any) => st.value);
  const selectedMillData = mills.find((m: any) => m.id === selectedMill);
  const submittedPrice = priceMode === 'MAKE_COUNTER' ? stripNonDigit(counterPrice) : stripNonDigit(selectedMillData?.price_per_unit);
  const quantityNum = Number(quantity);
  const canSubmit = Boolean((!hasMills || selectedMill) && quantityNum > 0 && paymentDays && deliveryDays && (priceMode === 'USE_BUYER_BUDGET' || counterPrice));

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await api.seller.sendDemandOffer(listingId, {
        demand_id: listingId,
        ...(hasMills && selectedMill ? { mill_id: selectedMill } : {}),
        supply_quantity: quantityNum,
        price_option: priceMode,
        counter_price_per_unit: submittedPrice,
        counter_payment_terms: { type: 'FIXED', fixed_days: paymentDays, weekly_percent: null },
        counter_delivery_terms: { days: deliveryDays },
        offer_condition: offerCondition || null,
      });
      navigation.replace('OfferSent', {
        mode: 'seller', listingId, title: detail.title, code: detail.code, image: heroImage,
        primaryLabel: 'Offer Sent Successfully!',
        subtitle: 'Buyer will respond with acceptance, rejection or counter.',
        summary: [
          { label: 'Demand ID', value: detail.code ?? listingId },
          ...(hasMills ? [{ label: 'Mill', value: selectedMillData?.name ?? 'Mill' }] : []),
          { label: 'Supply Quantity', value: `${quantityNum} ${detail.unit_name ?? 'units'}` },
          { label: 'Price Option', value: priceMode === 'MAKE_COUNTER' ? `Offer PKR ${submittedPrice}` : 'Original price' },
          { label: 'Payment Terms', value: `${paymentDays} days` },
          { label: 'Delivery Terms', value: `${deliveryDays} days` },
        ],
      });
    } catch (err: any) {
      if (err?.code !== 'AUTH_REQUIRED') {
        setSubmitError(err?.response?.data?.message ?? err?.message ?? 'Unable to send offer. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={s.container}>
      <MockStatusBar backgroundColor="#FFFFFF" textColor="#111827" />
      <AppLoader visible={submitting} overlay message="Sending offer..." />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.8}>
          <AppIcon name="back" size={19} color="#111827" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Send Offer</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <OfferPreviewCard imageUri={heroImage} code={detail.code ?? detail.id} title={detail.title ?? 'Demand Request'} stats={stats} />

        {(detail.original_quantity?.label || detail.available_quantity?.label || detail.quantity_label) ? (
          <View style={styles.demandInfoBox}>
            <AppIcon name="shield" size={13} color="#1A6B34" />
            <View style={styles.demandInfoContent}>
              {(detail.original_quantity?.label || detail.quantity_label) ? (
                <Text style={styles.demandInfoLine}>
                  {'Buyer Requires: '}
                  <Text style={styles.demandInfoValue}>
                    {detail.original_quantity?.label ?? detail.quantity_label}
                  </Text>
                </Text>
              ) : null}
              {detail.available_quantity?.label ? (
                <Text style={styles.demandInfoLine}>
                  {'Still Available: '}
                  <Text style={styles.demandInfoValue}>{detail.available_quantity.label}</Text>
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}

        {hasMills ? (
          <View style={s.card}>
            <Text style={s.sectionTitle}>1. Select Your Mill <Text style={s.required}>*</Text></Text>
            <Text style={s.sectionSubtitle}>Choose which of your mills will fulfil this order</Text>
            <OfferMillSelector mills={mills} selectedId={selectedMill} onSelect={setSelectedMill} />
          </View>
        ) : null}

        <View style={s.card}>
          <Text style={s.sectionTitle}>2. Quantity You Can Supply ({detail.unit_name ?? 'units'}) <Text style={s.required}>*</Text></Text>
          <TextInput style={s.input} placeholder="e.g. 150" keyboardType="numeric" value={quantity} onChangeText={v => setQuantity(enforceInt(v))} placeholderTextColor="#9CA3AF" />
        </View>

        <View style={s.card}>
          <Text style={s.sectionTitle}>3. Your Price <Text style={s.required}>*</Text></Text>
          <View style={s.priceToggleRow}>
            {PRICE_OPTIONS.map(opt => {
              const sel = priceMode === opt.value;
              return (
                <TouchableOpacity key={opt.value} style={[s.priceToggleBtn, sel && s.priceToggleBtnActive]} onPress={() => setPriceMode(opt.value)} activeOpacity={0.8}>
                  <Text style={[s.priceToggleLabel, sel && s.priceToggleLabelActive]}>{opt.label}</Text>
                  <Text style={[s.priceToggleSub, sel && s.priceToggleSubActive]}>{opt.value === 'USE_BUYER_BUDGET' ? (selectedMillData?.price_per_unit ?? 'Select mill first') : opt.subLabel}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {priceMode === 'MAKE_COUNTER' ? <TextInput style={[s.input, styles.counterInput]} placeholder="e.g. 4000" value={counterPrice} onChangeText={v => setCounterPrice(enforceDecimal(v))} placeholderTextColor="#9CA3AF" keyboardType="numeric" /> : null}
        </View>

        <View style={s.card}>
          <Text style={s.sectionTitle}>4. Payment & Delivery Terms</Text>
          <Text style={s.sectionSubtitle}>Payment within how many days?</Text>
          <OfferTermsChips options={paymentOpts} selected={paymentDays} onSelect={setPaymentDays} />
          <Text style={[s.sectionSubtitle, styles.deliveryLabel]}>Delivery within how many days?</Text>
          <OfferTermsChips options={deliveryOpts} selected={deliveryDays} onSelect={setDeliveryDays} />
        </View>

        <View style={s.card}>
          <Text style={s.sectionTitle}>5. Offer Condition <Text style={s.optional}>(optional)</Text></Text>
          <OfferConditionDropdown options={OFFER_CONDITIONS} selected={offerCondition} onSelect={setOfferCondition} placeholder="Select offer condition" />
        </View>

        <View style={s.infoNote}>
          <AppIcon name="shield" size={13} color="#217A3C" />
          <Text style={styles.infoText}>Your offer goes directly to the buyer. They can accept, reject, or send a counter offer. <Text style={styles.infoBold}>1.5% platform fee</Text> on final payment.</Text>
        </View>
        {submitError ? <View style={s.errorBox}><AppIcon name="notificationWarning" size={13} color="#B45309" /><Text style={s.errorText}>{submitError}</Text></View> : null}
        <View style={styles.scrollPad} />
      </ScrollView>
      <View style={s.bottomBar}>
        <TouchableOpacity style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]} activeOpacity={0.88} onPress={handleSubmit} disabled={!canSubmit || submitting}>
          <Text style={styles.submitBtnText}>{canSubmit ? 'Send Offer' : 'Select mill, qty, terms and price to continue'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  headerSpacer: { width: 34 },
  counterInput: { marginTop: 10 },
  deliveryLabel: { marginTop: 12 },
  infoText: { fontSize: 11, color: '#1A6B34', lineHeight: 17, flex: 1 },
  infoBold: { fontWeight: '700' },
  scrollPad: { height: 100 },
  submitBtn: { backgroundColor: '#F3CD03', borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#9CA3AF' },
  submitBtnText: { fontSize: 14, fontWeight: '800', color: '#0D3B1F' },
  demandInfoBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F2FBF5', borderRadius: 10, padding: 12, marginBottom: 10, gap: 8, borderWidth: 1, borderColor: '#C6E8D1' },
  demandInfoContent: { flex: 1, gap: 2 },
  demandInfoLine: { fontSize: 12, color: '#374151' },
  demandInfoValue: { fontWeight: '700', color: '#1A6B34' },
});

export default SendOfferScreen;
