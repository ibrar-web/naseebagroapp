import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import api from '../../../utils/api';
import { AppIcon } from '../../../assets/icons';
import AuthStatusBar from '../components/AuthStatusBar';

type Props = NativeStackScreenProps<RootStackParamList, 'Location'>;

type CityOption = { id: string; name: string; province: string | null };

const GREEN = '#217A3C';
const DARK_GREEN = '#145228';

const LocationScreen = ({ navigation }: Props) => {
  const [cities, setCities] = useState<CityOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<CityOption | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    api.marketplace.public.listCities()
      .then((res: any) => setCities(res?.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = search.trim()
    ? cities.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()),
      )
    : cities;

  return (
    <View style={styles.flex}>
      {/* Green gradient header */}
      <View style={styles.header}>
        <AuthStatusBar />
        <View style={styles.bgCircle} />
        <View style={styles.titleRow}>
          <View style={styles.iconBox}>
            <AppIcon name="profileCity" size={26} color="#fff" />
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.headerTitle}>Your Location</Text>
            <Text style={styles.headerSubtitle}>
              We use your city to show you the most relevant listings and market
              rates nearby.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        {/* Info card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>ℹ</Text>
          <Text style={styles.infoText}>
            Your location is only used to filter nearby listings and improve
            search results. It is never shared with buyers or sellers.
          </Text>
        </View>

        {/* City select */}
        <View style={styles.mb16}>
          <Text style={styles.label}>Select Your City</Text>
          <TouchableOpacity
            onPress={() => setShowPicker(!showPicker)}
            style={styles.selectBtn}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.selectText,
                !selected && styles.placeholderText,
              ]}
            >
              {selected ? selected.name : 'Choose your city...'}
            </Text>
            <Text style={styles.chevron}>▾</Text>
          </TouchableOpacity>

          {showPicker && (
            <View style={styles.pickerCard}>
              <View style={styles.searchRow}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search city..."
                  placeholderTextColor="#9CA3AF"
                  value={search}
                  onChangeText={setSearch}
                  autoFocus
                />
              </View>
              {loading ? (
                <ActivityIndicator
                  color={GREEN}
                  style={{ paddingVertical: 20 }}
                />
              ) : (
                <ScrollView
                  style={styles.pickerList}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                >
                  {filtered.map(city => (
                    <TouchableOpacity
                      key={city.id}
                      onPress={() => {
                        setSelected(city);
                        setShowPicker(false);
                        setSearch('');
                      }}
                      style={[
                        styles.pickerItem,
                        selected?.id === city.id && styles.pickerItemActive,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selected?.id === city.id &&
                            styles.pickerItemTextActive,
                        ]}
                      >
                        {city.name}
                      </Text>
                      {city.province ? (
                        <Text style={styles.provinceText}>
                          {city.province}
                        </Text>
                      ) : null}
                    </TouchableOpacity>
                  ))}
                  {filtered.length === 0 && (
                    <Text style={styles.emptyText}>No cities found</Text>
                  )}
                </ScrollView>
              )}
            </View>
          )}
        </View>

        <View style={styles.spacer} />

        <TouchableOpacity
          onPress={() => navigation.navigate('BasicInfo')}
          style={[styles.ctaBtn, !selected && styles.ctaDisabled]}
          activeOpacity={0.88}
          disabled={!selected}
        >
          <Text style={styles.ctaText}>→ Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('BasicInfo')}
          style={styles.skipBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: DARK_GREEN,
    paddingTop: 48,
    paddingLeft: 16,
    paddingRight: 24,
    paddingBottom: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  bgCircle: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.067)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginTop: 50,
  },
  iconBox: {
    width: 52,
    height: 52,
    backgroundColor: 'rgba(255,255,255,0.133)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.533)',
    marginTop: 6,
    lineHeight: 20,
  },
  body: {
    flex: 1,
    padding: 24,
    paddingTop: 24,
  },
  infoCard: {
    backgroundColor: '#F2FBF5',
    borderWidth: 1,
    borderColor: '#7FD4A0',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoIcon: { color: GREEN, fontSize: 16, marginTop: 1 },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: DARK_GREEN,
    lineHeight: 18,
  },
  mb16: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
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
  pickerList: { maxHeight: 200 },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerItemActive: { backgroundColor: '#F0FDF4' },
  pickerItemText: { fontSize: 14, color: '#374151' },
  pickerItemTextActive: { color: GREEN, fontWeight: '600' },
  provinceText: { fontSize: 11, color: '#9CA3AF' },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 13,
    paddingVertical: 20,
  },
  spacer: { flex: 1 },
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
    marginBottom: 12,
  },
  ctaDisabled: { opacity: 0.6, shadowOpacity: 0, elevation: 0 },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  skipBtn: { alignItems: 'center', paddingVertical: 8 },
  skipText: { fontSize: 12, color: '#9CA3AF' },
});

export default LocationScreen;
