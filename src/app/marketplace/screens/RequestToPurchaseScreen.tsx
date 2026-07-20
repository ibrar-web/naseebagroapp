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

type Props = NativeStackScreenProps<RootStackParamList, 'RequestToPurchase'>;
type PriceOption = 'USE_ORIGINAL' | 'MAKE_OFFER';

const ADDITIONAL_REQS = [
  'Grade A (Premium) required',
  'Dry packaging essential',
  'Certified organic needed',
  'Flexible on delivery date',
  'Export quality only',
];
const PRICE_OPTIONS = [
  { label: 'Use Original Price', subLabel: 'Use the listed mill price', value: 'USE_ORIGINAL' as PriceOption },
  { label: 'Make an Offer', subLabel: 'Enter your target price', value: 'MAKE_OFFER' as PriceOption },
];

const normalizeSupply = (r: any) => {
  const p = r?.id ? r : r?.listing_id ? { ...r, id: r.listing_id } : r?.data ?? r;
  return p?.id ? p : null;
};
const stripNonDigit = (v?: string | null) => Number(String(v ?? '').replace(/[^\d.]/g, ''));
const enforceInt = (v: string) => v.replace(/[^0-9]/g, '');
const enforceDecimal = (v: string) => v.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');

export const RequestToPurchaseScreen = ({ navigation, route }: Props) => {
  const { listingId } = route.params;
  const { paymentOpts, deliveryOpts } = useOfferTerms();
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [selectedMill, setSelectedMill] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('');
  const [priceMode, setPriceMode] = useState<PriceOption>('USE_ORIGINAL');
  const [offerPrice, setOfferPrice] = useState('');
  const [paymentDays, setPaymentDays] = useState<number | null>(null);
  const [deliveryDays, setDeliveryDays] = useState<number | null>(null);
  const [additionalReq, setAdditionalReq] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.marketplace.public.DetailMarketSuppliesListing(listingId)
      .then((res: any) => {
        const norm = normalizeSupply(res);
        if (!active) return;
        setDetail(norm);
        const first = norm?.mills?.available_mills?.[0] ?? norm?.available_mills_section?.mills?.[0];
        if (first) setSelectedMill(first.id);
      })
      .catch(() => { if (active) setError('Unable to load listing details.'); })
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
      <Text style={s.stateText}>{error || 'Listing not found.'}</Text>
      <TouchableOpacity style={s.stateButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
        <Text style={s.stateButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );

  const hasMills = (detail.mills?.is_mill_based ?? false) && (detail.mills?.available_mills?.length ?? 0) > 0;
  const mills = hasMills ? (detail.mills?.available_mills ?? detail.available_mills_section?.mills ?? []) : (detail.available_mills_section?.mills ?? []);
  const heroImage = detail.category?.image ?? detail.commodity?.image ?? detail.hero_image_url ?? `https://placehold.co/600x400?text=${encodeURIComponent(detail.title ?? 'Listing')}`;
  const badge = detail.badge_label ?? detail.badge;
  const selectedMillData = mills.find((m: any) => m.id === selectedMill);
  const submittedPrice = priceMode === 'MAKE_OFFER' ? stripNonDigit(offerPrice) : hasMills ? stripNonDigit(selectedMillData?.price_per_unit) : stripNonDigit(detail.pricing?.starting_price);
  const canSubmit = Boolean((!hasMills || selectedMill) && quantity && paymentDays && deliveryDays && (priceMode === 'USE_ORIGINAL' || offerPrice));

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await api.buyer.sendBuyrequest(listingId, {
        listing_id: listingId,
        ...(hasMills && selectedMill ? { mill_id: selectedMill } : {}),
        quantity: stripNonDigit(quantity),
        price_option: priceMode,
        offered_price_per_unit: submittedPrice,
        payment_terms: { type: 'FIXED', fixed_days: paymentDays, weekly_percent: null },
        delivery_terms: { days: deliveryDays },
        additional_requirement: additionalReq || null,
      });
      navigation.replace('OfferSent', {
        mode: 'buyer', listingId, title: detail.title, code: detail.code, image: heroImage,
        primaryLabel: 'Purchase Request Sent Successfully!',
        subtitle: 'Seller will respond with acceptance, rejection or counter.',
        summary: [
          { label: 'Listing ID', value: detail.code ?? listingId },
          ...(hasMills ? [{ label: 'Mill', value: selectedMillData?.name ?? 'Mill' }] : []),
          { label: 'Quantity', value: `${stripNonDigit(quantity)}` },
          { label: 'Price Option', value: priceMode === 'MAKE_OFFER' ? `Offer PKR ${submittedPrice}` : 'Original price' },
          { label: 'Payment Terms', value: `${paymentDays} days` },
          { label: 'Delivery Terms', value: `${deliveryDays} days` },
        ],
      });
    } catch (err: any) {
      if (err?.code !== 'AUTH_REQUIRED') {
        setSubmitError(err?.response?.data?.message ?? err?.message ?? 'Unable to submit request. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={s.container}>
      <MockStatusBar backgroundColor="#FFFFFF" textColor="#111827" />
      <AppLoader visible={submitting} overlay message="Sending request..." />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.8}>
          <AppIcon name="back" size={19} color="#111827" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Request to Purchase</Text>
        <View style={{ width: 34 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <OfferPreviewCard imageUri={heroImage} code={detail.code ?? detail.id} title={detail.title} badge={badge} />

        {hasMills ? (
          <View style={s.card}>
            <Text style={s.sectionTitle}>1. Select Mill <Text style={s.required}>*</Text></Text>
            <Text style={s.sectionSubtitle}>Your request will be tied to one mill</Text>
            <OfferMillSelector mills={mills} selectedId={selectedMill} onSelect={setSelectedMill} />
          </View>
        ) : (
          <View style={s.card}>
            <Text style={s.sectionTitle}>1. Listing Price</Text>
            <View style={styles.priceInfoBox}>
              <Text style={styles.priceInfoLabel}>Starting Price</Text>
              <Text style={styles.priceInfoValue}>{detail.pricing?.starting_price_label ?? detail.pricing?.price_range_label ?? 'Contact seller'}</Text>
            </View>
          </View>
        )}

        <View style={s.card}>
          <Text style={s.sectionTitle}>2. Quantity Required (bags) <Text style={s.required}>*</Text></Text>
          <TextInput style={s.input} placeholder="e.g. 100" keyboardType="numeric" value={quantity} onChangeText={v => setQuantity(enforceInt(v))} placeholderTextColor="#9CA3AF" />
        </View>

        <View style={s.card}>
          <Text style={s.sectionTitle}>3. Price Option <Text style={s.required}>*</Text></Text>
          <View style={s.priceToggleRow}>
            {PRICE_OPTIONS.map(opt => {
              const sel = priceMode === opt.value;
              return (
                <TouchableOpacity key={opt.value} style={[s.priceToggleBtn, sel && s.priceToggleBtnActive]} onPress={() => setPriceMode(opt.value)} activeOpacity={0.8}>
                  <Text style={[s.priceToggleLabel, sel && s.priceToggleLabelActive]}>{opt.label}</Text>
                  <Text style={[s.priceToggleSub, sel && s.priceToggleSubActive]}>{opt.value === 'USE_ORIGINAL' ? (selectedMillData?.price_per_unit ?? 'Select mill first') : opt.subLabel}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {priceMode === 'MAKE_OFFER' ? <TextInput style={[s.input, styles.offerInput]} placeholder="e.g. 4000" value={offerPrice} onChangeText={v => setOfferPrice(enforceDecimal(v))} placeholderTextColor="#9CA3AF" keyboardType="numeric" /> : null}
        </View>

        <View style={s.card}>
          <Text style={s.sectionTitle}>4. Payment Terms <Text style={s.required}>*</Text></Text>
          <Text style={s.sectionSubtitle}>Pay full amount within how many days?</Text>
          <OfferTermsChips options={paymentOpts} selected={paymentDays} onSelect={setPaymentDays} />
        </View>

        <View style={s.card}>
          <Text style={s.sectionTitle}>5. Delivery Terms <Text style={s.required}>*</Text></Text>
          <Text style={s.sectionSubtitle}>Require delivery within how many days?</Text>
          <OfferTermsChips options={deliveryOpts} selected={deliveryDays} onSelect={setDeliveryDays} />
        </View>

        <View style={s.card}>
          <Text style={s.sectionTitle}>Additional Requirement <Text style={s.optional}>(optional)</Text></Text>
          <OfferConditionDropdown options={ADDITIONAL_REQS} selected={additionalReq} onSelect={setAdditionalReq} placeholder="Select additional requirement" />
        </View>

        <View style={s.infoNote}>
          <AppIcon name="approved" size={13} color="#1A6B34" />
          <View style={{ flex: 1 }}>
            <Text style={s.infoNoteTitle}>How it works</Text>
            <Text style={s.infoNoteText}>1.5% Naseeb platform fee is charged at the last payment. The seller will receive your request and can accept or reject it directly.</Text>
          </View>
        </View>
        {submitError ? <View style={s.errorBox}><AppIcon name="notificationWarning" size={13} color="#B45309" /><Text style={s.errorText}>{submitError}</Text></View> : null}
        <View style={{ height: 100 }} />
      </ScrollView>
      <View style={s.bottomBar}>
        <TouchableOpacity style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]} activeOpacity={0.88} onPress={handleSubmit} disabled={!canSubmit || submitting}>
          <Text style={styles.submitBtnText}>{canSubmit ? 'Submit Request' : 'Fill all required fields'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  offerInput: { marginTop: 10 },
  priceInfoBox: { backgroundColor: '#F2FBF5', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#7FD4A0' },
  priceInfoLabel: { fontSize: 11, color: '#6B7280', marginBottom: 4 },
  priceInfoValue: { fontSize: 20, fontWeight: '900', color: '#1A6B34' },
  submitBtn: { backgroundColor: '#1A6B34', borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#9CA3AF' },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});

export default RequestToPurchaseScreen;
