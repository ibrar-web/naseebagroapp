import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setRegisterCity } from '../../../store/slices/registerSlice';
import { AppIcon } from '../../../assets/icons';
import AuthStatusBar from '../components/AuthStatusBar';
import { GooglePlacesInput } from '../../components/GooglePlacesInput';

type Props = NativeStackScreenProps<RootStackParamList, 'Location'>;

const GREEN = '#217A3C';
const DARK_GREEN = '#145228';

const LocationScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const savedCity = useAppSelector(s => s.register.city);
  const [selected, setSelected] = useState<string>(savedCity ?? '');

  const handleSelect = (name: string) => {
    setSelected(name);
    dispatch(setRegisterCity(name));
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <AuthStatusBar />
        <View style={styles.bgCircle} />
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <AppIcon name="back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.titleRow}>
          <View style={styles.iconBox}>
            <AppIcon name="profileCity" size={26} color="#fff" />
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.headerTitle}>Your Location</Text>
            <Text style={styles.headerSubtitle}>
              We use your city to show you the most relevant listings and market rates nearby.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.infoCard}>
          <AppIcon name="alertCircle" size={16} color={GREEN} />
          <Text style={styles.infoText}>
            Your location is only used to filter nearby listings and improve search results. It is never shared with buyers or sellers.
          </Text>
        </View>

        <View style={styles.mb16}>
          <Text style={styles.label}>Select Your City</Text>
          <GooglePlacesInput
            value={selected}
            onChange={handleSelect}
            placeholder="Search your city..."
            buttonStyle={styles.placesBtn}
          />
        </View>

        <View style={styles.spacer} />

        <TouchableOpacity
          onPress={() => navigation.navigate('BasicInfo')}
          style={[styles.ctaBtn, !selected && styles.ctaDisabled]}
          activeOpacity={0.88}
          disabled={!selected}
        >
          <Text style={styles.ctaText}>Continue</Text>
          <AppIcon name="arrowRight" size={18} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('BasicInfo')}
          style={styles.skipBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  backBtn: {
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    padding: 8,
  },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginTop: 16 },
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
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.533)', marginTop: 6, lineHeight: 20 },
  body: { flex: 1, padding: 24, paddingTop: 24 },
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
  infoText: { flex: 1, fontSize: 12, color: DARK_GREEN, lineHeight: 18 },
  mb16: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  placesBtn: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  spacer: { flex: 1 },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
