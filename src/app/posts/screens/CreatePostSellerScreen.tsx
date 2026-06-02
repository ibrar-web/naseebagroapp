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

type Props = NativeStackScreenProps<RootStackParamList, 'CreatePostSeller'>;

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

const LOCATIONS = ['Lahore', 'Faisalabad', 'Multan', 'Gujranwala', 'Rawalpindi', 'Karachi', 'Okara', 'Sahiwal', 'Rahim Yar Khan'];
const PAYMENT_DAYS = ['3', '7', '15', '30'];
const DELIVERY_DAYS = ['1', '2', '3', '5', '7', '10', '14'];
const GRADES = ['Grade A', 'Grade B', 'Grade C', 'Export Quality', 'Organic'];

const CreatePostSellerScreen = ({ navigation, route }: Props) => {
  const { category } = route.params;
  const commodityList = COMMODITIES[category] ?? COMMODITIES['Grains'];

  const [commodity, setCommodity] = useState('');
  const [showCommodityPicker, setShowCommodityPicker] = useState(false);
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [paymentType, setPaymentType] = useState<'fixed' | 'weekly'>('fixed');
  const [paymentDays, setPaymentDays] = useState('30');
  const [deliveryDays, setDeliveryDays] = useState('3');
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [moisture, setMoisture] = useState('');
  const [condition, setCondition] = useState('');

  const toggleGrade = (g: string) =>
    setSelectedGrades(prev =>
      prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g],
    );

  const isValid = !!commodity && !!price && !!quantity && !!location;

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
        <Text style={styles.headerTitle}>Create Supply</Text>
        <View style={styles.categoryChip}>
          <Text style={styles.categoryChipText}>
            {COMMODITIES[category] ? `${category === 'Grains' ? '🌾' : category === 'Cotton' ? '🌿' : '📦'} ${category}` : category}
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Listing Details</Text>

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

          {/* Price */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Price per 40kg (PKR) <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputWithPrefix}>
              <Text style={styles.prefix}>₨</Text>
              <TextInput
                style={styles.inputInner}
                placeholder="e.g. 4200"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Quantity */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Available Quantity (bags) <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 200"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Location */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Pickup Location <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity
              onPress={() => setShowLocationPicker(!showLocationPicker)}
              style={styles.picker}
              activeOpacity={0.8}
            >
              <Text style={[styles.pickerText, !location && styles.placeholder]}>
                {location || 'Select city'}
              </Text>
              <Text style={styles.chevron}>▾</Text>
            </TouchableOpacity>
            {showLocationPicker && (
              <View style={styles.dropdownList}>
                {LOCATIONS.map(loc => (
                  <TouchableOpacity
                    key={loc}
                    onPress={() => { setLocation(loc); setShowLocationPicker(false); }}
                    style={styles.dropdownItem}
                  >
                    <Text style={[styles.dropdownText, location === loc && styles.dropdownTextActive]}>
                      {loc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Payment Terms */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Payment Term</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                onPress={() => setPaymentType('fixed')}
                style={[styles.toggleBtn, paymentType === 'fixed' && styles.toggleBtnActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, paymentType === 'fixed' && styles.toggleTextActive]}>
                  Fixed Days
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPaymentType('weekly')}
                style={[styles.toggleBtn, paymentType === 'weekly' && styles.toggleBtnActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, paymentType === 'weekly' && styles.toggleTextActive]}>
                  Weekly %
                </Text>
              </TouchableOpacity>
            </View>
            {paymentType === 'fixed' && (
              <View style={styles.chipRow}>
                {PAYMENT_DAYS.map(d => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setPaymentDays(d)}
                    style={[styles.chip, paymentDays === d && styles.chipActive]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipText, paymentDays === d && styles.chipTextActive]}>
                      {d} days
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Delivery Terms */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Delivery Terms</Text>
            <View style={styles.chipRow}>
              {DELIVERY_DAYS.map(d => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setDeliveryDays(d)}
                  style={[styles.chip, deliveryDays === d && styles.chipActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, deliveryDays === d && styles.chipTextActive]}>
                    {d}d
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {deliveryDays && (
              <Text style={styles.successHint}>✓ Delivery within {deliveryDays} business days</Text>
            )}
          </View>

          {/* Grade */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Grade / Quality <Text style={styles.optional}>(optional)</Text></Text>
            <View style={styles.chipRow}>
              {GRADES.map(g => (
                <TouchableOpacity
                  key={g}
                  onPress={() => toggleGrade(g)}
                  style={[styles.chip, selectedGrades.includes(g) && styles.chipActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, selectedGrades.includes(g) && styles.chipTextActive]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Moisture */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Moisture % (max) <Text style={styles.optional}>(optional)</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 14"
              keyboardType="numeric"
              value={moisture}
              onChangeText={setMoisture}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Condition */}
          <View style={[styles.field, { marginBottom: 0 }]}>
            <Text style={styles.fieldLabel}>Supply Condition <Text style={styles.optional}>(optional)</Text></Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe condition, storage, etc."
              multiline
              numberOfLines={3}
              value={condition}
              onChangeText={setCondition}
              placeholderTextColor="#9CA3AF"
            />
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
            {isValid ? 'Post Supply →' : 'Fill the form above to continue'}
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
    backgroundColor: '#E8F7EE',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  categoryChipText: { fontSize: 12, fontWeight: '600', color: '#1A6B34' },
  scrollContent: { padding: 16, paddingBottom: 20 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
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
  inputWithPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
  },
  prefix: { paddingHorizontal: 12, fontSize: 14, color: '#6B7280', fontWeight: '600' },
  inputInner: { flex: 1, paddingVertical: 11, paddingRight: 12, fontSize: 13, color: '#111827' },
  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  toggleBtnActive: { borderColor: '#1A6B34', backgroundColor: '#F2FBF5' },
  toggleText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  toggleTextActive: { color: '#1A6B34' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  chipActive: { borderColor: '#1A6B34', backgroundColor: '#F2FBF5' },
  chipText: { fontSize: 12, color: '#6B7280' },
  chipTextActive: { color: '#1A6B34', fontWeight: '700' },
  successHint: { marginTop: 6, fontSize: 11, color: '#1A6B34', fontWeight: '600' },
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

export default CreatePostSellerScreen;
