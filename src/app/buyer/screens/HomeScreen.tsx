import React from 'react';
import {
  View, Text, ScrollView, FlatList,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '../../../store';
import { switchMode } from '../../../store/slices/appSlice';

const { width: W } = Dimensions.get('window');

const MARKET_DATA = [
  { name: 'Wheat',     price: '₨3,850/40kg', change: '+2.1%', up: true  },
  { name: 'Rice IRRI', price: '₨4,200/40kg', change: '-0.8%', up: false },
  { name: 'Cotton',    price: '₨8,500/40kg', change: '+1.4%', up: true  },
  { name: 'Maize',     price: '₨2,600/40kg', change: '+0.5%', up: true  },
  { name: 'Mustard',   price: '₨6,100/40kg', change: '-1.2%', up: false },
];

const LISTINGS = [
  { id: 'L001', name: 'Premium Wheat', qty: '500 Tons', price: '₨3,850/40kg', location: 'Lahore',      emoji: '🌾' },
  { id: 'L002', name: 'IRRI-6 Rice',  qty: '200 Tons', price: '₨4,200/40kg', location: 'Sheikhupura', emoji: '🍚' },
  { id: 'L003', name: 'Desi Cotton',  qty: '150 Tons', price: '₨8,500/40kg', location: 'Multan',      emoji: '☁️' },
];

const CATEGORIES = [
  { name: 'Grains',     emoji: '🌾' },
  { name: 'Cotton',     emoji: '☁️' },
  { name: 'Vegetables', emoji: '🥬' },
  { name: 'Oilseeds',   emoji: '🌻' },
];

const QUICK_ACTIONS = [
  { label: 'Create Supply', sub: 'List your stock',   emoji: '➕', bg: '#FFFDE6', color: '#D4AE02' },
  { label: 'My Listings',   sub: 'Manage stock',      emoji: '📋', bg: '#E8F7EE', color: '#217A3C' },
  { label: 'View Orders',   sub: 'Track deals',       emoji: '📦', bg: '#EEF6FF', color: '#3B82F6' },
  { label: 'Payouts',       sub: 'Earnings',          emoji: '💰', bg: '#EDE9FE', color: '#7C3AED' },
];

const HomeScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(s => s.app.mode);
  const isBuyer = mode === 'buyer';

  return (
    <View className="flex-1 bg-gray-50">

      {/* ── Header ─────────────────────────────────────────────── */}
      <View className="bg-green-800 px-4 pt-12 pb-4 overflow-hidden">
        <View className="absolute rounded-full bg-green-600 opacity-20"
              style={{ width: 180, height: 180, top: -40, right: -40 }} />

        {/* Row 1: Logo + mode toggle */}
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center gap-2">
            <Text style={{ fontSize: 26 }}>🌾</Text>
            <View>
              <Text className="text-white text-xl font-extrabold" style={{ letterSpacing: -0.3 }}>naseeb</Text>
              <Text className="text-gold font-bold" style={{ fontSize: 7, letterSpacing: 2.5 }}>AGRI MARKET</Text>
            </View>
          </View>
          <View className="flex-row gap-2">
            {(['buyer', 'seller'] as const).map(m => (
              <TouchableOpacity
                key={m}
                onPress={() => dispatch(switchMode(m))}
                className={`px-3 py-1.5 rounded-xl ${mode === m ? 'bg-orange-500' : ''}`}
                style={mode !== m ? { backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' } : {}}
                activeOpacity={0.8}
              >
                <Text className={`text-xs font-semibold ${mode === m ? 'text-gray-900' : 'text-white opacity-80'}`}>
                  {m === 'buyer' ? '🛒 Buyer' : '📦 Seller'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: 8 }} />

        {/* Row 2: User + bell */}
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-3">
            <View className="w-11 h-11 rounded-2xl bg-orange-500 items-center justify-center"
                  style={{ borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' }}>
              <Text style={{ fontSize: 20 }}>👤</Text>
            </View>
            <View>
              <Text className="text-white text-base font-extrabold">Muhammad Asad</Text>
              <Text className="text-green-300 text-xs">📍 Lahore, Punjab</Text>
            </View>
          </View>
          <TouchableOpacity className="p-2.5 rounded-xl relative"
                            style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
            <Text style={{ fontSize: 20 }}>🔔</Text>
            <View className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Stats strip ────────────────────────────────────────── */}
      <View className="flex-row bg-white px-4 py-2.5 gap-2 border-b border-gray-100"
            style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
        {(isBuyer
          ? [{ label: 'Active Deals', val: '3', color: '#217A3C', bg: '#F2FBF5' }, { label: 'Demands', val: '7', color: '#3B82F6', bg: '#EEF6FF' }, { label: 'Total Spent', val: '₨2.4M', color: '#D4AE02', bg: '#FFFDE6' }]
          : [{ label: 'Supplies',    val: '5', color: '#217A3C', bg: '#F2FBF5' }, { label: 'Orders',  val: '4', color: '#3B82F6', bg: '#EEF6FF' }, { label: 'Earnings',   val: '₨890K', color: '#D4AE02', bg: '#FFFDE6' }]
        ).map(s => (
          <View key={s.label} className="flex-1 rounded-xl p-2.5 items-center"
                style={{ backgroundColor: s.bg }}>
            <Text className="text-base font-extrabold" style={{ color: s.color }}>{s.val}</Text>
            <Text className="text-xs text-gray-500 mt-0.5 font-medium">{s.label}</Text>
          </View>
        ))}
      </View>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Market rates */}
        <View className="flex-row justify-between items-center px-4 pt-5 pb-2.5">
          <Text className="text-gray-900 text-base font-extrabold">Market Rates</Text>
          <TouchableOpacity><Text className="text-green-700 text-sm font-semibold">See All</Text></TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={MARKET_DATA}
          keyExtractor={i => i.name}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingHorizontal: 16, paddingBottom: 4 }}
          renderItem={({ item }) => (
            <View className="bg-white rounded-2xl p-3.5 w-32"
                  style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
              <Text className="text-gray-700 text-xs font-bold">{item.name}</Text>
              <Text className="text-gray-900 text-sm font-extrabold mt-1">{item.price}</Text>
              <Text className={`text-xs font-bold mt-1 ${item.up ? 'text-green-600' : 'text-red-500'}`}>
                {item.up ? '▲' : '▼'} {item.change}
              </Text>
            </View>
          )}
        />

        {isBuyer ? (
          <>
            {/* Featured listings */}
            <View className="flex-row justify-between items-center px-4 pt-5 pb-2.5">
              <Text className="text-gray-900 text-base font-extrabold">Featured Supplies</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Market')}>
                <Text className="text-green-700 text-sm font-semibold">View All</Text>
              </TouchableOpacity>
            </View>
            {LISTINGS.map(l => (
              <TouchableOpacity
                key={l.id}
                onPress={() => navigation.navigate('ListingDetail', { listingId: l.id })}
                className="flex-row items-center gap-3 bg-white mx-4 mb-2.5 p-3.5 rounded-2xl"
                style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
                activeOpacity={0.88}
              >
                <View className="w-14 h-14 rounded-xl bg-green-50 items-center justify-center">
                  <Text style={{ fontSize: 28 }}>{l.emoji}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 text-sm font-bold">{l.name}</Text>
                  <Text className="text-gray-500 text-xs mt-0.5">{l.qty} · 📍 {l.location}</Text>
                </View>
                <Text className="text-green-700 text-sm font-extrabold">{l.price}</Text>
              </TouchableOpacity>
            ))}

            {/* Categories */}
            <View className="flex-row justify-between items-center px-4 pt-4 pb-2.5">
              <Text className="text-gray-900 text-base font-extrabold">Browse Categories</Text>
              <TouchableOpacity><Text className="text-green-700 text-sm font-semibold">All</Text></TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap gap-2.5 px-4">
              {CATEGORIES.map(cat => (
                <View key={cat.name} className="bg-white rounded-2xl items-center py-4 gap-2"
                      style={{ width: (W - 48) / 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}>
                  <Text style={{ fontSize: 32 }}>{cat.emoji}</Text>
                  <Text className="text-gray-800 text-sm font-bold">{cat.name}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Earnings */}
            <View className="mx-4 mt-5 bg-green-800 rounded-2xl p-4"
                  style={{ shadowColor: '#145228', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}>
              <Text className="text-green-200 text-xs">Total Earnings (This Month)</Text>
              <Text className="text-white text-3xl font-extrabold mt-1">PKR 890,000</Text>
              <View className="flex-row gap-5 mt-3">
                {[{ l: 'Released', v: '₨640K', c: 'text-white' }, { l: 'Pending', v: '₨250K', c: 'text-orange-400' }, { l: 'This Week', v: '₨120K', c: 'text-white' }].map(s => (
                  <View key={s.l}>
                    <Text className="text-green-300 text-xs">{s.l}</Text>
                    <Text className={`text-sm font-bold ${s.c}`}>{s.v}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Quick actions */}
            <Text className="text-gray-900 text-base font-extrabold px-4 pt-5 pb-2.5">Quick Actions</Text>
            <View className="flex-row flex-wrap gap-2.5 px-4">
              {QUICK_ACTIONS.map(a => (
                <TouchableOpacity key={a.label} className="bg-white rounded-2xl p-3.5 gap-2"
                                  style={{ width: (W - 48) / 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
                                  activeOpacity={0.85}>
                  <View className="w-11 h-11 rounded-xl items-center justify-center" style={{ backgroundColor: a.bg }}>
                    <Text style={{ fontSize: 22 }}>{a.emoji}</Text>
                  </View>
                  <Text className="text-gray-900 text-sm font-bold">{a.label}</Text>
                  <Text className="text-gray-400 text-xs">{a.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
