import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useAppDispatch } from '../../../store';
import { setRegisterBizInfo } from '../../../store/slices/registerSlice';
import api from '../../../utils/api';
import { AppIcon } from '../../../assets/icons';
import AuthStatusBar from '../components/AuthStatusBar';

type Props = NativeStackScreenProps<RootStackParamList, 'BizInfo'>;

type CityOption = { id: string; name: string };

const GREEN = '#217A3C';
const DARK_GREEN = '#145228';
const STEP_ACTIVE = 1;
const STEP_TOTAL = 5;

const BIZ_TYPES = [
  'Trader', 'Supplier', 'Mill Owner', 'Farmer', 'Exporter', 'Broker', 'Investor',
];

const BizInfoScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState({
    businessName: '',
    businessType: '',
    city: '',
    address: '',
  });
  const [cities, setCities] = useState<CityOption[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [citySearch, setCitySearch] = useState('');
  const [showBizTypePicker, setShowBizTypePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);

  useEffect(() => {
    api.marketplace.public.listCities()
      .then((res: any) => setCities(res?.data ?? []))
      .catch(() => {})
      .finally(() => setCitiesLoading(false));
  }, []);

  const filteredCities = citySearch.trim()
    ? cities.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase()))
    : cities;

  const canContinue =
    form.businessName.length > 1 &&
    form.businessType.length > 0 &&
    form.city.length > 0 &&
    form.address.length > 3;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <AuthStatusBar />
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <AppIcon name="back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Business Details</Text>
        <Text style={styles.headerSubtitle}>Step 2 of 5 — Your Trade Profile</Text>
        <View style={styles.dotsRow}>
          {Array.from({ length: STEP_TOTAL }).map((_, i) => (
            <Text
              key={i}
              style={[
                styles.dot,
                i <= STEP_ACTIVE ? styles.dotActive : styles.dotInactive,
              ]}
            >
              {i <= STEP_ACTIVE ? '●' : '○'}
            </Text>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Business Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Company / Business Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Asad Traders"
            placeholderTextColor="#9CA3AF"
            value={form.businessName}
            onChangeText={v => setForm(p => ({ ...p, businessName: v }))}
            autoCapitalize="words"
          />
        </View>

        {/* Business Type */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Business Type</Text>
          <TouchableOpacity
            onPress={() => {
              setShowBizTypePicker(!showBizTypePicker);
              setShowCityPicker(false);
            }}
            style={styles.selectBtn}
            activeOpacity={0.8}
          >
            <Text style={[styles.selectText, !form.businessType && styles.placeholderText]}>
              {form.businessType || 'Select...'}
            </Text>
            <Text style={styles.chevron}>▾</Text>
          </TouchableOpacity>
          {showBizTypePicker && (
            <View style={styles.pickerCard}>
              {BIZ_TYPES.map(type => (
                <TouchableOpacity
                  key={type}
                  onPress={() => {
                    setForm(p => ({ ...p, businessType: type }));
                    setShowBizTypePicker(false);
                  }}
                  style={[
                    styles.pickerItem,
                    form.businessType === type && styles.pickerItemActive,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      form.businessType === type && styles.pickerItemTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* City */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>City / Location</Text>
          <TouchableOpacity
            onPress={() => {
              setShowCityPicker(!showCityPicker);
              setShowBizTypePicker(false);
            }}
            style={styles.selectBtn}
            activeOpacity={0.8}
          >
            <Text style={[styles.selectText, !form.city && styles.placeholderText]}>
              {form.city || 'Select...'}
            </Text>
            <Text style={styles.chevron}>▾</Text>
          </TouchableOpacity>
          {showCityPicker && (
            <View style={styles.pickerCard}>
              <View style={styles.searchRow}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search city..."
                  placeholderTextColor="#9CA3AF"
                  value={citySearch}
                  onChangeText={setCitySearch}
                  autoFocus
                />
              </View>
              {citiesLoading ? (
                <ActivityIndicator color={GREEN} style={{ paddingVertical: 16 }} />
              ) : (
                <ScrollView
                  style={styles.pickerList}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                >
                  {filteredCities.map(city => (
                    <TouchableOpacity
                      key={city.id}
                      onPress={() => {
                        setForm(p => ({ ...p, city: city.name }));
                        setShowCityPicker(false);
                        setCitySearch('');
                      }}
                      style={[
                        styles.pickerItem,
                        form.city === city.name && styles.pickerItemActive,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          form.city === city.name && styles.pickerItemTextActive,
                        ]}
                      >
                        {city.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {filteredCities.length === 0 && (
                    <Text style={styles.emptyText}>No cities found</Text>
                  )}
                </ScrollView>
              )}
            </View>
          )}
        </View>

        {/* Address */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Full Address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Street, Area, City"
            placeholderTextColor="#9CA3AF"
            value={form.address}
            onChangeText={v => setForm(p => ({ ...p, address: v }))}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.spacer} />

        <TouchableOpacity
          onPress={() => {
            dispatch(setRegisterBizInfo({
              city: form.city,
              businessName: form.businessName,
              businessType: form.businessType,
            }));
            navigation.navigate('IdVerify');
          }}
          style={[styles.ctaBtn, !canContinue && styles.ctaDisabled]}
          disabled={!canContinue}
          activeOpacity={0.88}
        >
          <Text style={styles.ctaText}>→ Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: DARK_GREEN,
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 28,
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    top: 44,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    padding: 8,
  },
  dotsRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  dot: { fontSize: 14 },
  dotActive: { color: '#F3CD03' },
  dotInactive: { color: 'rgba(255,255,255,0.267)', fontSize: 10 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 50 },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.533)',
    marginTop: 4,
  },
  scroll: { padding: 24, paddingTop: 24, paddingBottom: 40, flexGrow: 1 },
  fieldGroup: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  selectText: { fontSize: 14, color: '#111827' },
  placeholderText: { color: '#9CA3AF' },
  chevron: { color: '#9CA3AF', fontSize: 14 },
  pickerCard: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  searchRow: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchInput: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    fontSize: 14,
    color: '#111827',
  },
  pickerList: { maxHeight: 180 },
  pickerItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerItemActive: { backgroundColor: '#F0FDF4' },
  pickerItemText: { fontSize: 14, color: '#374151' },
  pickerItemTextActive: { color: GREEN, fontWeight: '600' },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 13,
    paddingVertical: 20,
  },
  spacer: { flex: 1, minHeight: 24 },
  ctaBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: '#2E9E52',
    shadowOpacity: 0.27,
    shadowRadius: 12,
    elevation: 4,
  },
  ctaDisabled: { opacity: 0.5, shadowOpacity: 0, elevation: 0 },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});

export default BizInfoScreen;
