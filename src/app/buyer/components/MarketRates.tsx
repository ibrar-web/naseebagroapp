import {
  FlatList,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { AppIcon } from '../../../assets/icons';
import SectionHeader from '../../components/headers/SectionHeader';
import { useTranslation } from '../../../localization';
import api from '../../../utils/api';

interface MarketDataItem {
  id: string;
  commodity_name: string;
  mill: string;
  price: string;
  change: string;
  up: boolean;
  image: string;
  fallback?: string;
}
const MarketRates = ({ navigation }: any) => {
  const [rateIndex, setRateIndex] = useState(0);
  const { t } = useTranslation();
  const [marketData, setMarketData] = useState<MarketDataItem[]>([]);
  const handleRateScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / 172);
    setRateIndex(idx);
  };
  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const data: any = await api.marketplace.public.listMarketRates();
      console.log('Market reates', data);
      setMarketData(data?.items);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <View style={styles.section}>
      <SectionHeader
        title={t('home.marketRates')}
        onSeeAll={() => navigation.navigate('MarketRates')}
      />
      <FlatList
        horizontal
        data={marketData}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingBottom: 6 }}
        snapToInterval={172}
        decelerationRate="fast"
        onScroll={handleRateScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <MarketRateCard
            item={item}
            onPress={() => navigation.navigate('MarketRates')}
          />
        )}
      />
      {/* Dot indicators */}
      <View style={styles.dots}>
        {marketData.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === rateIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default MarketRates;

const MarketRateCard = ({
  item,
  onPress,
}: {
  item: MarketDataItem;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={styles.rateCard}
    activeOpacity={0.88}
  >
    <ImageBackground
      source={{ uri: item.image }}
      style={styles.rateImage}
      resizeMode="cover"
    >
      <View style={styles.rateImageOverlay} />
      <View
        style={[
          styles.changeBadge,
          {
            backgroundColor: item.up
              ? 'rgba(22,163,74,0.88)'
              : 'rgba(220,38,38,0.88)',
          },
        ]}
      >
        <Text style={styles.changeArrow}>{item.up ? '▲' : '▼'}</Text>
        <Text style={styles.changeText}>{item.change}</Text>
      </View>
      <View style={styles.rateNameBox}>
        <Text style={styles.rateName}>{item.name}</Text>
      </View>
    </ImageBackground>
    <View style={styles.rateBody}>
      <View style={styles.rateMillRow}>
        <AppIcon name="listing" size={10} color="#9CA3AF" />
        <Text style={styles.rateMill}>{item.mill}</Text>
      </View>
      <View style={styles.ratePriceRow}>
        <Text style={styles.ratePrice}>{item.price}</Text>
        <Text style={styles.rateUnit}>/40kg</Text>
      </View>
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
  // Dots
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    marginTop: 6,
  },
  dot: { height: 6, borderRadius: 3 },
  dotActive: { width: 20, backgroundColor: '#217A3C' },
  dotInactive: { width: 6, backgroundColor: '#E5E7EB' },

  // Market rate card
  rateCard: {
    width: 162,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  rateImage: { height: 80 },
  rateImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  changeBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  changeArrow: { fontSize: 8, color: '#FFFFFF' },
  changeText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },
  rateNameBox: { position: 'absolute', bottom: 7, left: 9, right: 9 },
  rateName: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    lineHeight: 14,
  },
  rateBody: { padding: 8 },
  rateMillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  rateMill: { fontSize: 10, fontWeight: '600', color: '#6B7280' },
  ratePriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  ratePrice: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1A6B34',
    letterSpacing: -0.4,
    lineHeight: 20,
  },
  rateUnit: { fontSize: 9, color: '#9CA3AF', fontWeight: '500' },
});
