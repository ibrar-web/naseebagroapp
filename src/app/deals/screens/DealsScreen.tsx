import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useAppSelector } from '../../../store';

const FILTERS = ['All', 'Active', 'Payment', 'Transit', 'Completed'];

const DEALS = [
  { id: 'DEL-001', commodity: 'Premium Wheat', emoji: '🌾', qty: '200 Tons', rate: '₨3,850/40kg', amount: '₨19.25L', counterparty: 'Asad Traders',   location: 'Lahore → Karachi',     stage: 8,  status: 'Active'    },
  { id: 'DEL-002', commodity: 'IRRI-6 Rice',   emoji: '🍚', qty: '80 Tons',  rate: '₨4,200/40kg', amount: '₨8.4L',   counterparty: 'Punjab Agri Co', location: 'Sheikhupura → Lahore', stage: 6,  status: 'Payment'   },
  { id: 'DEL-003', commodity: 'Desi Cotton',   emoji: '☁️', qty: '50 Tons',  rate: '₨8,500/40kg', amount: '₨10.6L',  counterparty: 'Cotton King',    location: 'Multan → Faisalabad',  stage: 10, status: 'Transit'   },
  { id: 'DEL-004', commodity: 'Yellow Maize',  emoji: '🌽', qty: '300 Tons', rate: '₨2,600/40kg', amount: '₨19.5L',  counterparty: 'Farm Fresh Ltd', location: 'Faisalabad → Karachi', stage: 12, status: 'Completed' },
];

const stageColor = (s: number) =>
  s < 5 ? '#F59E0B' : s < 8 ? '#3B82F6' : s < 11 ? '#8B5CF6' : '#10B981';

const DealCard = ({ item, onPress }: any) => {
  const pct   = Math.round((item.stage / 12) * 100);
  const color = stageColor(item.stage);
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl p-3.5 mb-3"
      style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}
      activeOpacity={0.88}
    >
      <View className="flex-row gap-3">
        <View className="w-14 h-14 rounded-xl bg-green-50 items-center justify-center">
          <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
        </View>
        <View className="flex-1">
          <View className="flex-row justify-between">
            <Text className="text-gray-400 text-xs font-mono">{item.id}</Text>
            <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: color + '20' }}>
              <Text className="text-xs font-bold" style={{ color }}>{item.status}</Text>
            </View>
          </View>
          <Text className="text-gray-900 text-sm font-bold mt-0.5">{item.commodity}</Text>
          <Text className="text-gray-500 text-xs mt-0.5">{item.qty} · {item.counterparty}</Text>
        </View>
      </View>

      <View className="flex-row justify-between mt-2.5">
        <Text className="text-gray-500 text-xs">📍 {item.location}</Text>
        <Text className="text-green-700 text-sm font-extrabold">{item.amount}</Text>
      </View>

      {/* Pipeline */}
      <View className="h-1.5 bg-gray-100 rounded-full mt-2.5 overflow-hidden">
        <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </View>
      <View className="flex-row justify-between mt-1">
        <Text className="text-gray-400 text-xs">Stage {item.stage}/12</Text>
        <Text className="text-xs font-bold" style={{ color }}>{pct}% complete</Text>
      </View>
    </TouchableOpacity>
  );
};

const DealsScreen = ({ navigation }: any) => {
  const mode = useAppSelector(s => s.app.mode);
  const [activeFilter, setActiveFilter] = useState('All');
  const filtered = activeFilter === 'All' ? DEALS : DEALS.filter(d => d.status === activeFilter);

  return (
    <View className="flex-1 bg-gray-50">

      {/* Header */}
      <View className="bg-green-800 pt-12 pb-4 px-4 overflow-hidden">
        <View className="absolute rounded-full bg-green-700 opacity-25"
              style={{ width: 160, height: 160, top: -40, right: -40 }} />
        <Text className="text-white text-2xl font-extrabold">{mode === 'buyer' ? 'My Deals' : 'My Orders'}</Text>
        <Text className="text-green-300 text-xs mt-1 mb-3">{DEALS.length} total deals</Text>

        {/* Summary */}
        <View className="flex-row gap-2">
          {[
            { l: 'Active',     v: 1, bg: 'rgba(46,158,82,0.2)',  c: '#45B86A' },
            { l: 'In Transit', v: 1, bg: 'rgba(59,130,246,0.2)', c: '#60A5FA' },
            { l: 'Completed',  v: 1, bg: 'rgba(247,219,74,0.2)', c: '#F7DB4A' },
          ].map(s => (
            <View key={s.l} className="flex-1 rounded-xl p-2.5 items-center"
                  style={{ backgroundColor: s.bg }}>
              <Text className="text-xl font-extrabold" style={{ color: s.c }}>{s.v}</Text>
              <Text className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>{s.l}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Filter tabs */}
      <View className="bg-white border-b border-gray-100">
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={f => f}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveFilter(item)}
              className={`px-4 py-1.5 rounded-full ${activeFilter === item ? 'bg-green-700' : 'bg-gray-100'}`}
              activeOpacity={0.8}
            >
              <Text className={`text-xs font-semibold ${activeFilter === item ? 'text-white' : 'text-gray-600'}`}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={d => d.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <DealCard item={item} onPress={() => navigation.navigate('DealDetail', { dealId: item.id })} />
        )}
        ListEmptyComponent={
          <View className="items-center pt-16 gap-3">
            <Text style={{ fontSize: 40 }}>📭</Text>
            <Text className="text-gray-700 text-base font-bold">No deals found</Text>
            <Text className="text-gray-400 text-sm">Try a different filter</Text>
          </View>
        }
      />
    </View>
  );
};

export default DealsScreen;
