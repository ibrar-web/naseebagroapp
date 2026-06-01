import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useAppSelector } from '../../../store';

type Props = NativeStackScreenProps<RootStackParamList, 'PrePost'>;

const CATEGORIES = [
  { emoji: '🌾', name: 'Grains', count: '5 commodities' },
  { emoji: '🌿', name: 'Cotton', count: '3 commodities' },
  { emoji: '🥦', name: 'Vegetables', count: '5 commodities' },
  { emoji: '🌻', name: 'Oilseeds', count: '4 commodities' },
  { emoji: '🍋', name: 'Fruits', count: '5 commodities' },
  { emoji: '🌶️', name: 'Spices', count: '4 commodities' },
  { emoji: '🍬', name: 'Sugarcane', count: '3 commodities' },
  { emoji: '🫘', name: 'Pulses', count: '4 commodities' },
];

const PrePostScreen = ({ navigation }: Props) => {
  const mode = useAppSelector(s => s.app.mode);
  const isBuyer = mode === 'buyer';

  const handleCategorySelect = (category: string) => {
    if (isBuyer) {
      navigation.navigate('CreatePostBuyer', { category });
    } else {
      navigation.navigate('CreatePostSeller', { category });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isBuyer ? 'Create Demand' : 'Create Supply'}
        </Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          {isBuyer ? 'What are you looking for?' : 'What are you selling?'}
        </Text>
        <Text style={styles.subtitle}>Select a category to get started</Text>

        <View style={styles.grid}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.name}
              onPress={() => handleCategorySelect(cat.name)}
              style={styles.categoryCard}
              activeOpacity={0.82}
            >
              <Text style={styles.catEmoji}>{cat.emoji}</Text>
              <Text style={styles.catName}>{cat.name}</Text>
              <Text style={styles.catCount}>{cat.count}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
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
  backBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  backArrow: { fontSize: 22, color: '#111827', lineHeight: 24 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#6B7280', marginBottom: 20 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  catEmoji: { fontSize: 24, marginBottom: 8 },
  catName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  catCount: { fontSize: 11, color: '#9CA3AF', marginTop: 3 },
});

export default PrePostScreen;
