import {
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import SectionHeader from '../../components/headers/SectionHeader';

const CATEGORY_SECTIONS = [
  {
    title: '🌾 Grains',
    items: [
      {
        id: 'L001',
        name: 'Basmati Rice',
        location: 'Gujranwala',
        price: 'PKR 4,200',
        stock: '500 bags',
        badge: 'PREMIUM',
        image:
          'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&q=80',
        fallback: '#8A9A5B',
      },
      {
        id: 'L002',
        name: 'Punjab Wheat',
        location: 'Faisalabad',
        price: 'PKR 2,800',
        stock: '1200 bags',
        badge: 'VERIFIED',
        image:
          'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=900&q=80',
        fallback: '#C29A4A',
      },
      {
        id: 'L003',
        name: 'Yellow Maize',
        location: 'Okara',
        price: 'PKR 1,900',
        stock: '800 bags',
        badge: 'FRESH',
        image:
          'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=900&q=80',
        fallback: '#DCA640',
      },
    ],
  },
  {
    title: '🌿 Cotton',
    items: [
      {
        id: 'L004',
        name: 'Desi Cotton',
        location: 'Multan',
        price: 'PKR 8,500',
        stock: '150 bags',
        badge: 'PREMIUM',
        image:
          'https://images.unsplash.com/photo-1594179047519-f347310d3322?w=900&q=80',
        fallback: '#D8D6C7',
      },
      {
        id: 'L005',
        name: 'NIAB-78',
        location: 'Rahim Yar Khan',
        price: 'PKR 7,800',
        stock: '200 bags',
        badge: 'VERIFIED',
        image:
          'https://images.unsplash.com/photo-1594179047519-f347310d3322?w=900&q=80',
        fallback: '#D8D6C7',
      },
    ],
  },
];
const CategorySection = ({ navigation }: any) => {
  return (
    <>
      {CATEGORY_SECTIONS.map(section => (
        <View key={section.title} style={styles.section}>
          <SectionHeader
            title={section.title}
            onSeeAll={() => navigation.navigate('Market')}
          />
          <FlatList
            horizontal
            data={section.items}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingBottom: 4 }}
            renderItem={({ item }) => (
              <CategoryCard
                item={item}
                onPress={() =>
                  navigation.navigate('CommodityDetail', {
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
  onPress,
}: {
  item: (typeof CATEGORY_SECTIONS)[0]['items'][0];
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={styles.catCard}
    activeOpacity={0.88}
  >
    <ImageBackground
      source={{ uri: item.image }}
      style={styles.catImage}
      resizeMode="cover"
      imageStyle={{ backgroundColor: item.fallback }}
    >
      <View style={styles.catImageOverlay} />
      <View style={styles.catBadge}>
        <Text style={styles.catBadgeText}>{item.badge}</Text>
      </View>
      <View style={styles.catInfo}>
        <Text style={styles.catName}>{item.name}</Text>
        <View style={styles.catLocationRow}>
          <Text style={styles.catLocationPin}>📍</Text>
          <Text style={styles.catLocation}>{item.location}</Text>
        </View>
      </View>
    </ImageBackground>
    <View style={styles.catBody}>
      <Text style={styles.catPrice}>{item.price}</Text>
      <Text style={styles.catStock}>per 40kg · {item.stock}</Text>
      <TouchableOpacity
        style={styles.interestBtn}
        onPress={onPress}
        activeOpacity={0.86}
      >
        <Text style={styles.interestBtnText}>Send Interest →</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);
const styles = StyleSheet.create({
  // Scroll & sections
  scrollContent: { paddingBottom: 100 },
  section: { paddingHorizontal: 16, marginBottom: 20, marginTop: 16 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  seeAllText: { fontSize: 12, color: '#217A3C', fontWeight: '600' },
  seeAllChevron: { fontSize: 14, color: '#217A3C', fontWeight: '700' },
  // Category card
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  catInfo: { position: 'absolute', bottom: 8, left: 10, zIndex: 3 },
  catName: { fontSize: 13, fontWeight: '900', color: '#FFFFFF' },
  catLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
  catLocationPin: { fontSize: 8 },
  catLocation: { fontSize: 9, color: 'rgba(255,255,255,0.7)' },
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
