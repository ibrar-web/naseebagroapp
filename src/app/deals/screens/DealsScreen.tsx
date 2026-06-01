import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import { useAppSelector } from '../../../store';
import { useTranslation } from '../../../localization';

const DEALS = [
  {
    id: 'DEL-001',
    commodity: 'Premium Wheat',
    qty: '200 Tons',
    rate: '₨3,850/40kg',
    amount: '₨19.25L',
    counterparty: 'Asad Traders',
    location: 'Lahore → Karachi',
    stage: 8,
    status: 'Active',
    image:
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=900&q=80',
    fallback: '#C29A4A',
  },
  {
    id: 'DEL-002',
    commodity: 'IRRI-6 Rice',
    qty: '80 Tons',
    rate: '₨4,200/40kg',
    amount: '₨8.4L',
    counterparty: 'Punjab Agri Co',
    location: 'Sheikhupura → Lahore',
    stage: 6,
    status: 'Active',
    image:
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&q=80',
    fallback: '#8A9A5B',
  },
  {
    id: 'DEL-003',
    commodity: 'Desi Cotton',
    qty: '50 Tons',
    rate: '₨8,500/40kg',
    amount: '₨10.6L',
    counterparty: 'Cotton King',
    location: 'Multan → Faisalabad',
    stage: 10,
    status: 'Active',
    image:
      'https://images.unsplash.com/photo-1594179047519-f347310d3322?w=900&q=80',
    fallback: '#D8D6C7',
  },
  {
    id: 'DEL-004',
    commodity: 'Yellow Maize',
    qty: '300 Tons',
    rate: '₨2,600/40kg',
    amount: '₨19.5L',
    counterparty: 'Farm Fresh Ltd',
    location: 'Faisalabad → Karachi',
    stage: 12,
    status: 'Closed',
    image:
      'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=900&q=80',
    fallback: '#DCA640',
  },
];

const TABS = ['All', 'Active', 'Closed'] as const;
type TabType = (typeof TABS)[number];

const statusColor = (status: string) => {
  if (status === 'Active') return '#10B981';
  if (status === 'Closed') return '#9CA3AF';
  return '#F59E0B';
};

const stageColor = (s: number) =>
  s < 5 ? '#F59E0B' : s < 8 ? '#3B82F6' : s < 11 ? '#8B5CF6' : '#10B981';

const DealCard = ({ item, onPress }: any) => {
  const { t } = useTranslation();
  const pct = Math.round((item.stage / 12) * 100);
  const color = stageColor(item.stage);
  const sColor = statusColor(item.status);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.card}
      activeOpacity={0.88}
    >
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.cardImage}
        resizeMode="cover"
        imageStyle={{ backgroundColor: item.fallback }}
      >
        <View style={StyleSheet.absoluteFillObject} className="bg-black/35" />
        <View className="absolute top-2.5 right-3">
          <View
            className="rounded-full px-2.5 py-1"
            style={{ backgroundColor: sColor + '33' }}
          >
            <Text
              className="text-xs font-bold"
              style={{ color: item.status === 'Closed' ? '#D1D5DB' : sColor }}
            >
              {item.status}
            </Text>
          </View>
        </View>
        <View className="absolute bottom-2.5 left-3 right-12">
          <Text className="text-white/55 text-[9px] font-mono mb-0.5">
            {item.id}
          </Text>
          <Text className="text-white text-[15px] font-extrabold" numberOfLines={1}>
            {item.commodity}
          </Text>
        </View>
      </ImageBackground>

      <View className="px-3.5 pt-3 pb-3.5">
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-500 text-xs">
            {item.qty} · {item.counterparty}
          </Text>
          <Text className="text-green-700 text-sm font-extrabold">
            {item.amount}
          </Text>
        </View>

        <View className="flex-row items-center mt-1.5" style={{ gap: 4 }}>
          <Text className="text-gray-400 text-xs">📍</Text>
          <Text className="text-gray-400 text-xs">{item.location}</Text>
        </View>

        <View className="h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
          <View
            className="h-full rounded-full"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </View>
        <View className="flex-row justify-between mt-1">
          <Text className="text-gray-400 text-[11px]">
            {t('deals.stage', { stage: item.stage })}
          </Text>
          <Text className="text-[11px] font-bold" style={{ color }}>
            {t('deals.complete', { pct })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const TabBadge = ({ count, active }: { count: number; active: boolean }) => (
  <View
    className="rounded-full"
    style={{
      marginLeft: 5,
      paddingHorizontal: 7,
      paddingVertical: 1,
      backgroundColor: active ? '#E8F7EE' : '#F3F4F6',
    }}
  >
    <Text
      style={{
        fontSize: 11,
        fontWeight: '700',
        color: active ? '#1A6B34' : '#9CA3AF',
      }}
    >
      {count}
    </Text>
  </View>
);

const DealsScreen = ({ navigation }: any) => {
  const mode = useAppSelector(s => s.app.mode);
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('All');

  const activeCount = DEALS.filter(d => d.status === 'Active').length;
  const closedCount = DEALS.filter(d => d.status === 'Closed').length;

  const tabCount = (tab: TabType) => {
    if (tab === 'All') return DEALS.length;
    if (tab === 'Active') return activeCount;
    return closedCount;
  };

  const filtered =
    activeTab === 'All' ? DEALS : DEALS.filter(d => d.status === activeTab);

  return (
    <View className="flex-1 bg-gray-50">
      <View
        style={{
          backgroundColor: '#145228',
          paddingTop: 44,
          paddingBottom: 20,
          paddingHorizontal: 20,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff' }}>
          {mode === 'buyer' ? t('deals.myDeals') : t('deals.myOrders')}
        </Text>
        <Text
          style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}
        >
          {DEALS.length} total · {activeCount} active
        </Text>
      </View>

      <View
        className="flex-row bg-white"
        style={{ borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}
      >
        {TABS.map(tab => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className="flex-1 flex-row items-center justify-center py-3"
              style={{
                borderBottomWidth: 2,
                borderBottomColor: isActive ? '#217A3C' : 'transparent',
              }}
              activeOpacity={0.75}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? '#1A6B34' : '#6B7280',
                }}
              >
                {tab}
              </Text>
              <TabBadge count={tabCount(tab)} active={isActive} />
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={d => d.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <DealCard
            item={item}
            onPress={() =>
              navigation.navigate('DealDetail', { dealId: item.id })
            }
          />
        )}
        ListEmptyComponent={
          <View className="items-center pt-16" style={{ gap: 12 }}>
            <Text style={{ fontSize: 40 }}>📭</Text>
            <Text className="text-gray-700 text-base font-bold">
              {t('deals.noDeals')}
            </Text>
            <Text className="text-gray-400 text-sm">
              {t('deals.differentFilter')}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: 100,
  },
});

export default DealsScreen;
