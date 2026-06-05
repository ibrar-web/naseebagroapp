import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppIcon } from '../../../assets/icons';
import api from '../../../utils/api';
import SectionHeader from '../../components/headers/SectionHeader';

type FeaturedListing = {
  id: string;
  code?: string;
  post_type?: 'SUPPLY' | 'DEMAND';
  commodity_name?: string;
  image?: string;
  location?: string;
  price?: string;
  badge?: string | null;
  quantity?: number;
  quantity_label?: string;
  is_mill_based?: boolean;
  avg_rating?: string;
  review_count?: number;
};

type FeaturedCategory = {
  id: string;
  name: string;
  image_url?: string;
  listings_count?: number;
  listings?: FeaturedListing[];
};

const FALLBACK_COLORS = ['#8A9A5B', '#C29A4A', '#D8D6C7', '#DCA640', '#D9A825'];

const normalizeFeaturedCategories = (response: any): FeaturedCategory[] => {
  const root =
    response?.items || response?.data?.items ? response : response?.data ?? {};
  const items = root?.items ?? root?.data?.items ?? [];
  return Array.isArray(items) ? items : [];
};

const formatBadge = (item: FeaturedListing) => {
  if (item.badge) {
    return item.badge.replace(/_/g, ' ');
  }

  return item.is_mill_based ? 'MILL BASED' : 'DIRECT';
};

const getDetailRoute = (item: FeaturedListing) =>
  item.post_type === 'DEMAND' || item.code?.startsWith('LST-D')
    ? 'ListingDetail'
    : 'CommodityDetail';

const CategorySection = ({ navigation }: any) => {
  const [categories, setCategories] = useState<FeaturedCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.marketplace.public.listHomeCategoryListing();
        if (active) {
          setCategories(normalizeFeaturedCategories(response));
        }
      } catch (err) {
        console.log('Featured categories error', err);
        if (active) {
          setError('Unable to load featured categories.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  const visibleCategories = useMemo(
    () => categories.filter(category => (category.listings?.length ?? 0) > 0),
    [categories],
  );

  if (loading && categories.length === 0) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator color="#217A3C" />
        <Text style={styles.loadingText}>Loading featured categories...</Text>
      </View>
    );
  }

  if (error && categories.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <AppIcon name="notificationWarning" size={24} color="#D97706" />
        <Text style={styles.emptyTitle}>{error}</Text>
      </View>
    );
  }

  if (visibleCategories.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <AppIcon name="listing" size={24} color="#9CA3AF" />
        <Text style={styles.emptyTitle}>No featured listings yet.</Text>
      </View>
    );
  }

  return (
    <>
      {visibleCategories.map((section, sectionIndex) => (
        <View key={section.id} style={styles.section}>
          <SectionHeader
            title={section.name}
            onSeeAll={() => navigation.navigate('Market')}
          />
          <FlatList
            horizontal
            data={section.listings ?? []}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item, index }) => (
              <CategoryCard
                item={item}
                fallback={
                  FALLBACK_COLORS[
                    (sectionIndex + index) % FALLBACK_COLORS.length
                  ]
                }
                onPress={() =>
                  navigation.navigate(getDetailRoute(item), {
                    listingId: item.id,
                  })
                }
              />
            )}
          />
        </View>
      ))}
    </>
  );
};

export default CategorySection;

const CategoryCard = ({
  item,
  fallback,
  onPress,
}: {
  item: FeaturedListing;
  fallback: string;
  onPress: () => void;
}) => {
  const image =
    item.image ??
    `https://placehold.co/600x400?text=${encodeURIComponent(
      item.commodity_name ?? 'Commodity',
    )}`;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.catCard}
      activeOpacity={0.88}
    >
      <ImageBackground
        source={{ uri: image }}
        style={[styles.catImage, { backgroundColor: fallback }]}
        resizeMode="cover"
      >
        <View style={styles.catImageOverlay} />
        <View style={styles.catBadge}>
          <Text style={styles.catBadgeText}>{formatBadge(item)}</Text>
        </View>
        <View style={styles.catInfo}>
          <Text style={styles.catCode}>{item.code ?? item.id}</Text>
          <Text style={styles.catName} numberOfLines={1}>
            {item.commodity_name ?? 'Commodity'}
          </Text>
          <View style={styles.catLocationRow}>
            <AppIcon
              name="profileCity"
              size={9}
              color="rgba(255,255,255,0.7)"
            />
            <Text style={styles.catLocation} numberOfLines={1}>
              {item.location ?? 'Multiple mills'}
            </Text>
          </View>
        </View>
      </ImageBackground>
      <View style={styles.catBody}>
        <Text style={styles.catPrice} numberOfLines={1}>
          {item.price ?? 'Ask price'}
        </Text>
        <Text style={styles.catStock} numberOfLines={1}>
          {item.quantity_label ?? 'Quantity available'}
        </Text>
        <TouchableOpacity
          style={styles.interestBtn}
          onPress={onPress}
          activeOpacity={0.86}
        >
          <Text style={styles.interestBtnText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  section: { paddingHorizontal: 16, marginBottom: 20, marginTop: 16 },
  listContent: { gap: 12, paddingBottom: 4 },
  loadingBox: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  emptyBox: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingVertical: 22,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  emptyTitle: {
    marginTop: 8,
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '700',
    textAlign: 'center',
  },
  catCard: {
    width: 180,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  catImage: { height: 110 },
  catImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  catBadge: {
    position: 'absolute',
    top: 8,
    left: 10,
    zIndex: 3,
    backgroundColor: '#F3CD03',
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  catBadgeText: { fontSize: 8, fontWeight: '800', color: '#0D3B1F' },
  catInfo: { position: 'absolute', bottom: 8, left: 10, right: 10, zIndex: 3 },
  catCode: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '700',
    marginBottom: 1,
  },
  catName: { fontSize: 13, fontWeight: '900', color: '#FFFFFF' },
  catLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
  catLocation: { fontSize: 9, color: 'rgba(255,255,255,0.7)', flex: 1 },
  catBody: { padding: 10 },
  catPrice: { fontSize: 17, fontWeight: '900', color: '#1A6B34' },
  catStock: { fontSize: 10, color: '#9CA3AF', marginTop: 1 },
  interestBtn: {
    marginTop: 8,
    width: '100%',
    paddingVertical: 8,
    backgroundColor: '#F3CD03',
    borderRadius: 9,
    alignItems: 'center',
  },
  interestBtnText: { fontSize: 11, fontWeight: '700', color: '#0D3B1F' },
});
