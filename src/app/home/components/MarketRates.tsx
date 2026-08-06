import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppIcon } from '../../../assets/icons';
import SectionHeader from '../../components/headers/SectionHeader';
import { useTranslation } from '../../../localization';
import api from '../../../utils/api';

interface MarketDataItem {
  id: string;
  name: string;
  mill: string;
  price: string;
  prevPrice?: string | null;
  unit?: string;
  change: string;
  up: boolean;
  image: string;
}

const CARD_WIDTH = 162;
const CARD_GAP = 10;
const CARD_STEP = CARD_WIDTH + CARD_GAP;
const SLIDE_DURATION = 700;

const MarketRates = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [marketData, setMarketData] = useState<MarketDataItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollViewRef = useRef<ScrollView>(null);
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const activeIndexRef = useRef(0);
  const dataLenRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const id = scrollAnim.addListener(({ value }) => {
      scrollViewRef.current?.scrollTo({ x: value, animated: false });
    });
    return () => scrollAnim.removeListener(id);
  }, [scrollAnim]);

  useEffect(() => {
    const getData = async () => {
      try {
        const res: any = await api.marketplace.public.listMarketRatesAll({ page: 1, limit: 10 });
        const data: MarketDataItem[] = (res?.rates ?? []).slice(0, 10);
        setMarketData(data);
        dataLenRef.current = data.length;
      } catch {
        // silently ignore
      }
    };
    getData();
  }, []);

  useEffect(() => {
    if (marketData.length < 2) return;

    timerRef.current = setInterval(() => {
      const next = (activeIndexRef.current + 1) % dataLenRef.current;
      activeIndexRef.current = next;
      setActiveIndex(next);
      Animated.timing(scrollAnim, {
        toValue: next * CARD_STEP,
        duration: SLIDE_DURATION,
        useNativeDriver: false,
      }).start();
    }, 2000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [marketData.length, scrollAnim]);

  return (
    <View style={styles.section}>
      <SectionHeader
        title={t('home.marketRates')}
        onSeeAll={() => navigation.navigate('MarketRates')}
      />

      <ScrollView
        ref={scrollViewRef}
        horizontal
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: CARD_GAP, paddingBottom: 6 }}
      >
        {marketData.map(item => (
          <MarketRateCard
            key={item.id}
            item={item}
            onPress={() => navigation.navigate('MarketRates')}
          />
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {marketData.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex ? styles.dotActive : styles.dotInactive]}
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
  <TouchableOpacity onPress={onPress} style={styles.rateCard} activeOpacity={0.88}>
    <ImageBackground
      source={{ uri: item.image }}
      style={styles.rateImage}
      resizeMode="cover"
    >
      <View style={styles.rateImageOverlay} />
      <View
        style={[
          styles.changeBadge,
          { backgroundColor: item.up ? 'rgba(22,163,74,0.88)' : 'rgba(220,38,38,0.88)' },
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
        <Text style={styles.rateMill} numberOfLines={1}>{item.mill}</Text>
      </View>
      <View style={styles.ratePriceRow}>
        <Text style={styles.ratePrice}>{item.price}</Text>
        {item.unit ? <Text style={styles.rateUnit}>{item.unit}</Text> : null}
      </View>
      {item.prevPrice ? (
        <View style={styles.prevRow}>
          <Text style={[styles.prevArrow, { color: item.up ? '#16A34A' : '#DC2626' }]}>
            {item.up ? '▲' : '▼'}
          </Text>
          <Text style={styles.prevLabel}>Prev </Text>
          <Text style={styles.prevValue}>{item.prevPrice}</Text>
          {item.change ? (
            <Text style={[styles.prevChange, { color: item.up ? '#16A34A' : '#DC2626' }]}>
              {' '}{item.change}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  section: { paddingHorizontal: 16, marginBottom: 20, marginTop: 16 },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    marginTop: 6,
  },
  dot: { height: 6, borderRadius: 3 },
  dotActive: { width: 20, backgroundColor: '#217A3C' },
  dotInactive: { width: 6, backgroundColor: '#E5E7EB' },

  rateCard: {
    width: CARD_WIDTH,
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
  rateUnit: { fontSize: 10, color: '#6B7280', fontWeight: '600' },
  prevRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  prevArrow: { fontSize: 8, fontWeight: '800' },
  prevLabel: { fontSize: 9, color: '#9CA3AF', marginLeft: 2 },
  prevValue: { fontSize: 9, color: '#6B7280', fontWeight: '600' },
  prevChange: { fontSize: 9, fontWeight: '700' },
});
