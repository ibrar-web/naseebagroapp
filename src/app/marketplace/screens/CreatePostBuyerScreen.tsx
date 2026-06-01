import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import MockStatusBar from '../../components/MockStatusBar';

type Props = NativeStackScreenProps<RootStackParamList, 'CreatePostBuyer'>;

const COMMODITIES: Record<string, string[]> = {
  Grains: ['Basmati Rice', 'Punjab Wheat', 'Yellow Maize', 'Corn', 'Barley'],
  Cotton: ['Desi Cotton', 'NIAB-78', 'MNH-786'],
  Vegetables: ['Tomato', 'Onion', 'Potato', 'Garlic', 'Ginger'],
  Oilseeds: ['Mustard Seed', 'Sunflower', 'Canola', 'Sesame'],
  Fruits: ['Mango', 'Orange', 'Kinnow', 'Guava', 'Date'],
  Spices: ['Cumin', 'Coriander', 'Turmeric', 'Red Chilli'],
  Sugarcane: ['Sugarcane', 'Jaggery', 'Molasses'],
  Pulses: ['Chickpea', 'Lentil', 'Mung Bean', 'Black-eyed Pea'],
};

const CITIES = ['Lahore', 'Karachi', 'Faisalabad', 'Multan', 'Gujranwala', 'Rawalpindi', 'Peshawar', 'Quetta', 'Okara', 'Sahiwal'];
const PAYMENT_OPTIONS = ['Full advance', '30% advance', '50% advance', 'On delivery', 'Net 15 days', 'Net 30 days'];

const CreatePostBuyerScreen = ({ navigation, route }: Props) => {
  const { category } = route.params;
  const commodityList = COMMODITIES[category] ?? COMMODITIES['Grains'];

  const [commodity, setCommodity] = useState('');
  const [showCommodityPicker, setShowCommodityPicker] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [paymentTerm, setPaymentTerm] = useState('');
  const [showPaymentPicker, setShowPaymentPicker] = useState(false);
  const [notes, setNotes] = useState('');

  const isValid = !!commodity && !!quantity && !!deliveryCity;

  const handleSubmit = () => {
    navigation.navigate('MainTabs');
  };

  return (
    <View style={styles.container}>
      <MockStatusBar backgroundColor="#FFFFFF" textColor="#111827" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Demand</Text>
        <View style={styles.categoryChip}>
          <Text style={styles.categoryChipText}>{category}</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Demand Details</Text>

          {/* Commodity */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Commodity <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity
              onPress={() => setShowCommodityPicker(!showCommodityPicker)}
              style={styles.picker}
              activeOpacity={0.8}
            >
              <Text style={[styles.pickerText, !commodity && styles.placeholder]}>
                {commodity || 'Select commodity'}
              </Text>
              <Text style={styles.chevron}>▾</Text>
            </TouchableOpacity>
            {showCommodityPicker && (
              <View style={styles.dropdownList}>
                {commodityList.map(c => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => { setCommodity(c); setShowCommodityPicker(false); }}
                    style={styles.dropdownItem}
                  >
                    <Text style={[styles.dropdownText, commodity === c && styles.dropdownTextActive]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Quantity */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Quantity (bags) <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 150"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Price range */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Price Range (PKR/40kg) <Text style={styles.optional}>(optional)</Text></Text>
            <View style={styles.priceRangeRow}>
              <View style={styles.priceRangeInput}>
                <Text style={styles.prefix}>Min ₨</Text>
                <TextInput
                  style={styles.priceInner}
                  placeholder="3,800"
                  keyboardType="numeric"
                  value={minPrice}
                  onChangeText={setMinPrice}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <Text style={styles.priceSep}>–</Text>
              <View style={styles.priceRangeInput}>
                <Text style={styles.prefix}>Max ₨</Text>
                <TextInput
                  style={styles.priceInner}
                  placeholder="4,200"
                  keyboardType="numeric"
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>

          {/* Delivery City */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Delivery City <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity
              onPress={() => setShowCityPicker(!showCityPicker)}
              style={styles.picker}
              activeOpacity={0.8}
            >
              <Text style={[styles.pickerText, !deliveryCity && styles.placeholder]}>
                {deliveryCity || 'Select delivery city'}
              </Text>
              <Text style={styles.chevron}>▾</Text>
            </TouchableOpacity>
            {showCityPicker && (
              <View style={styles.dropdownList}>
                {CITIES.map(c => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => { setDeliveryCity(c); setShowCityPicker(false); }}
                    style={styles.dropdownItem}
                  >
                    <Text style={[styles.dropdownText, deliveryCity === c && styles.dropdownTextActive]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Delivery date */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Required By <Text style={styles.optional}>(optional)</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Within 7 days, Before Apr 30"
              value={deliveryDate}
              onChangeText={setDeliveryDate}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Payment term */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Payment Terms <Text style={styles.optional}>(optional)</Text></Text>
            <TouchableOpacity
              onPress={() => setShowPaymentPicker(!showPaymentPicker)}
              style={styles.picker}
              activeOpacity={0.8}
            >
              <Text style={[styles.pickerText, !paymentTerm && styles.placeholder]}>
                {paymentTerm || 'Select payment term'}
              </Text>
              <Text style={styles.chevron}>▾</Text>
            </TouchableOpacity>
            {showPaymentPicker && (
              <View style={styles.dropdownList}>
                {PAYMENT_OPTIONS.map(p => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => { setPaymentTerm(p); setShowPaymentPicker(false); }}
                    style={styles.dropdownItem}
                  >
                    <Text style={[styles.dropdownText, paymentTerm === p && styles.dropdownTextActive]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Notes */}
          <View style={[styles.field, { marginBottom: 0 }]}>
            <Text style={styles.fieldLabel}>Additional Notes <Text style={styles.optional}>(optional)</Text></Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Specific requirements, quality notes, etc."
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Info box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>🔔</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>How it works</Text>
            <Text style={styles.infoText}>
              Your demand will be visible to verified mills. You'll receive offers within 24 hours and can accept the best one.
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky submit */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.submitBtn, !isValid && styles.submitBtnDisabled]}
          disabled={!isValid}
          activeOpacity={0.88}
          onPress={handleSubmit}
        >
          <Text style={styles.submitBtnText}>
            {isValid ? 'Post Demand →' : 'Fill required fields to continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  backBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  backArrow: { fontSize: 22, color: '#111827', lineHeight: 24 },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#111827' },
  categoryChip: {
    backgroundColor: '#EEF6FF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  categoryChipText: { fontSize: 12, fontWeight: '600', color: '#2563EB' },
  scrollContent: { padding: 16, paddingBottom: 20 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 16 },
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  required: { color: '#EF4444' },
  optional: { color: '#9CA3AF', fontWeight: '400' },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: '#FAFAFA',
  },
  pickerText: { fontSize: 13, color: '#111827' },
  placeholder: { color: '#9CA3AF' },
  chevron: { fontSize: 12, color: '#9CA3AF' },
  dropdownList: {
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dropdownText: { fontSize: 13, color: '#374151' },
  dropdownTextActive: { color: '#1A6B34', fontWeight: '700' },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 13,
    color: '#111827',
    backgroundColor: '#FAFAFA',
  },
  textArea: { minHeight: 70, textAlignVertical: 'top' },
  priceRangeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priceRangeInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
  },
  prefix: { paddingHorizontal: 10, fontSize: 12, color: '#6B7280', fontWeight: '600' },
  priceInner: { flex: 1, paddingVertical: 11, paddingRight: 10, fontSize: 13, color: '#111827' },
  priceSep: { fontSize: 16, color: '#9CA3AF', fontWeight: '600' },
  infoBox: {
    backgroundColor: '#FFFDE6',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  infoIcon: { fontSize: 18 },
  infoTitle: { fontSize: 13, fontWeight: '700', color: '#92400E', marginBottom: 3 },
  infoText: { fontSize: 12, color: '#78350F', lineHeight: 18 },
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
  submitBtnDisabled: { backgroundColor: '#E5E7EB', opacity: 0.6 },
  submitBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});

export default CreatePostBuyerScreen;
