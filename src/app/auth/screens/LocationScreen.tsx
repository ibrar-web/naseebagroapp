import React, { useState, useMemo } from 'react';
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
import { useTranslation } from '../../../localization';
import { CITIES } from '../../../constants';
import { AppIcon } from '../../../assets/icons';
import GreenHeader from '../components/GreenHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'Location'>;

const LocationScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const filteredCities = useMemo(
    () =>
      query.trim().length === 0
        ? CITIES
        : CITIES.filter(c => c.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <View className="flex-1 bg-gray-50">
      <GreenHeader
        step={t('auth.locationStep')}
        title={t('auth.locationTitle')}
        subtitle={t('auth.locationSubtitle')}
        icon="profileCity"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search input */}
        <View className="bg-white rounded-2xl flex-row items-center px-4 mb-4 gap-3" style={styles.card}>
          <AppIcon name="profileCity" size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 text-gray-900 text-sm py-4"
            placeholder="Search city..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="words"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} activeOpacity={0.7}>
              <Text className="text-gray-400 text-lg">✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Info box */}
        <View className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4 flex-row gap-3">
          <Text style={styles.pinEmoji}>📍</Text>
          <Text className="flex-1 text-blue-700 text-sm leading-5">
            {t('auth.locationInfo')}
          </Text>
        </View>

        {/* City chips */}
        {filteredCities.length === 0 ? (
          <View className="items-center py-8">
            <Text className="text-gray-400 text-sm">No cities found for &quot;{query}&quot;</Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-2 mb-5">
            {filteredCities.map(city => {
              const isActive = selected === city;
              return (
                <TouchableOpacity
                  key={city}
                  onPress={() => setSelected(city)}
                  className={`px-4 py-2.5 rounded-2xl border-2 ${
                    isActive ? 'bg-green-700 border-green-700' : 'bg-white border-gray-200'
                  }`}
                  style={isActive ? styles.chipActive : styles.chipInactive}
                  activeOpacity={0.8}
                >
                  <Text
                    className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-700'}`}
                  >
                    {city}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Selected confirmation */}
        {selected && (
          <View className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4 flex-row items-center gap-3">
            <Text style={styles.checkEmoji}>✅</Text>
            <Text className="text-green-700 text-sm font-semibold">
              {t('auth.selectedCity')}{' '}
              <Text className="font-extrabold">{selected}</Text>
            </Text>
          </View>
        )}

        {/* Buttons */}
        <TouchableOpacity
          onPress={() => navigation.navigate('BasicInfo')}
          className={`py-4 rounded-2xl items-center mb-3 bg-green-700 ${!selected ? 'opacity-40' : ''}`}
          disabled={!selected}
          style={selected ? styles.btnShadow : undefined}
          activeOpacity={0.88}
        >
          <Text className="text-white text-base font-bold">
            {t('auth.locationContinue')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('BasicInfo')}
          className="py-3 items-center"
          activeOpacity={0.7}
        >
          <Text className="text-gray-400 text-sm font-medium">
            {t('auth.locationSkip')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  chipActive: {
    shadowColor: '#1A6B34',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  chipInactive: {
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  btnShadow: {
    shadowColor: '#1A6B34',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  pinEmoji: { fontSize: 20 },
  checkEmoji: { fontSize: 18 },
});

export default LocationScreen;
