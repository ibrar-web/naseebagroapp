import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  View,
} from 'react-native';
import { AppIcon } from '../../../assets/icons';
import { CommonActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  CategoryRouteParam,
  RootStackParamList,
} from '../../../navigation/types';
import { useAppSelector } from '../../../store';
import MockStatusBar from '../../components/MockStatusBar';
import api from '../../../utils/api';

type Props = NativeStackScreenProps<RootStackParamList, 'PrePost'>;

const normalizeCategories = (response: any): CategoryRouteParam[] => {
  const items =
    response?.items ?? response?.data?.items ?? response?.data?.data?.items;

  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter(item => item?.id && item?.name)
    .map(item => ({
      id: String(item.id),
      name: String(item.name),
      image_url: item.image_url ?? null,
      commodity_count:
        typeof item.commodity_count === 'number'
          ? item.commodity_count
          : Number(item.commodity_count ?? 0),
    }));
};

const commodityCountLabel = (count?: number) => {
  const safeCount = Number.isFinite(count) ? Number(count) : 0;
  return `${safeCount} ${safeCount === 1 ? 'commodity' : 'commodities'}`;
};

const PrePostScreen = ({ navigation }: Props) => {
  const mode = useAppSelector(s => s.app.mode);
  const isBuyer = mode === 'buyer';
  const [categories, setCategories] = useState<CategoryRouteParam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.marketplace.public.listCategories();
      setCategories(normalizeCategories(response));
    } catch {
      setError('Unable to load categories. Please try again.');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'MainTabs',
            params: { screen: 'Post', params: { initialTab: 'posts' } },
          },
        ],
      }),
    );
  };

  const handleCategorySelect = (categoryData: CategoryRouteParam) => {
    const params = {
      category: categoryData.name,
      categoryData,
    };

    if (isBuyer) {
      navigation.navigate('CreateBuyerDemand', params);
    } else {
      navigation.navigate('CreatePostSeller', params);
    }
  };

  const renderCategory = (category: CategoryRouteParam) => {
    const imageUrl =
      category.image_url ||
      `https://placehold.co/300x220?text=${encodeURIComponent(category.name)}`;

    return (
      <TouchableOpacity
        key={category.id}
        onPress={() => handleCategorySelect(category)}
        style={styles.categoryCard}
        activeOpacity={0.84}
      >
        <ImageBackground
          source={{ uri: imageUrl }}
          style={styles.categoryImage}
          imageStyle={styles.categoryImageStyle}
        />
        <View style={styles.categoryBody}>
          <Text style={styles.catName} numberOfLines={2}>
            {category.name}
          </Text>
          <Text style={styles.catCount}>
            {commodityCountLabel(category.commodity_count)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <MockStatusBar backgroundColor="#FFFFFF" textColor="#111827" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goBack}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <AppIcon name="back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isBuyer ? 'Create Demand' : 'Create Supply'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          {isBuyer ? 'What are you looking for?' : 'What are you selling?'}
        </Text>
        <Text style={styles.subtitle}>Select a category to get started</Text>

        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color="#217A3C" />
            <Text style={styles.stateText}>Loading categories...</Text>
          </View>
        ) : error ? (
          <View style={styles.stateBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              onPress={loadCategories}
              style={styles.retryButton}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>No categories available.</Text>
          </View>
        ) : (
          <View style={styles.grid}>{categories.map(renderCategory)}</View>
        )}
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
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  headerSpacer: { width: 34 },
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  categoryImage: {
    width: '100%',
    aspectRatio: 1.35,
    backgroundColor: '#E5E7EB',
  },
  categoryImageStyle: { borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  categoryBody: { padding: 12 },
  catName: { fontSize: 14, fontWeight: '800', color: '#111827' },
  catCount: { fontSize: 11, color: '#6B7280', marginTop: 4 },
  stateBox: {
    minHeight: 190,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  stateText: { marginTop: 10, fontSize: 13, color: '#6B7280' },
  errorText: {
    color: '#991B1B',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#217A3C',
  },
  retryButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
});

export default PrePostScreen;
