import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useAppSelector } from '../../../store';
import { useTranslation } from '../../../localization';

const CATEGORIES = [
  'All',
  'Grains',
  'Cotton',
  'Vegetables',
  'Oilseeds',
  'Fruits',
  'Spices',
];

const COMMODITIES = [
  {
    id: 'L001',
    name: 'Premium Wheat',
    qty: '500 Tons',
    price: '₨3,850/40kg',
    location: 'Lahore',
    emoji: '🌾',
    seller: 'Asad Traders',
    verified: true,
  },
  {
    id: 'L002',
    name: 'IRRI-6 Rice',
    qty: '200 Tons',
    price: '₨4,200/40kg',
    location: 'Sheikhupura',
    emoji: '🍚',
    seller: 'Punjab Agri Co',
    verified: true,
  },
  {
    id: 'L003',
    name: 'Desi Cotton Grade A',
    qty: '150 Tons',
    price: '₨8,500/40kg',
    location: 'Multan',
    emoji: '☁️',
    seller: 'Cotton King',
    verified: false,
  },
  {
    id: 'L004',
    name: 'Yellow Maize',
    qty: '800 Tons',
    price: '₨2,600/40kg',
    location: 'Faisalabad',
    emoji: '🌽',
    seller: 'Farm Fresh Ltd',
    verified: true,
  },
  {
    id: 'L005',
    name: 'Mustard Seeds',
    qty: '100 Tons',
    price: '₨6,100/40kg',
    location: 'Gujranwala',
    emoji: '🌻',
    seller: 'Seed Masters',
    verified: false,
  },
  {
    id: 'L006',
    name: 'Sugarcane Raw',
    qty: '1000 Tons',
    price: '₨340/40kg',
    location: 'Mirpur Khas',
    emoji: '🎋',
    seller: 'South Agri Corp',
    verified: true,
  },
];

const DEMANDS = [
  {
    id: 'D001',
    commodity: 'Wheat',
    qty: '200 Tons',
    budget: '₨3,900/40kg',
    location: 'Lahore',
    date: '2 days ago',
    status: 'Active',
  },
  {
    id: 'D002',
    commodity: 'Rice',
    qty: '50 Tons',
    budget: '₨4,100/40kg',
    location: 'Karachi',
    date: '4 days ago',
    status: 'Pending',
  },
  {
    id: 'D003',
    commodity: 'Cotton',
    qty: '80 Tons',
    budget: '₨8,200/40kg',
    location: 'Faisalabad',
    date: '1 week ago',
    status: 'Active',
  },
];

const CommodityCard = ({ item, onPress }: any) => {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center gap-3 bg-white rounded-2xl p-3.5 mb-2.5"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      }}
      activeOpacity={0.88}
    >
      <View
        className="w-15 h-15 rounded-xl bg-green-50 items-center justify-center"
        style={{ width: 60, height: 60 }}
      >
        <Text style={{ fontSize: 36 }}>{item.emoji}</Text>
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-1.5">
          <Text className="text-gray-900 text-sm font-bold">{item.name}</Text>
          {item.verified && (
            <Text className="text-green-700 text-xs bg-green-100 px-1.5 rounded-md">
              ✓
            </Text>
          )}
        </View>
        <Text className="text-gray-500 text-xs mt-0.5">
          {item.qty} · 📍 {item.location}
        </Text>
        <Text className="text-gray-400 text-xs mt-0.5">
          {t('market.by')} {item.seller}
        </Text>
      </View>
      <View className="items-end">
        <Text className="text-green-700 text-sm font-extrabold">
          {item.price}
        </Text>
        <TouchableOpacity
          className="mt-2 px-2.5 py-1.5 bg-green-700 rounded-lg"
          activeOpacity={0.85}
        >
          <Text className="text-white text-xs font-bold">
            {t('market.interest')}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const DemandCard = ({ item }: any) => {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-3.5 mb-2.5"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      }}
      activeOpacity={0.88}
    >
      <View className="flex-row justify-between mb-2">
        <Text className="text-gray-400 text-xs font-mono">{item.id}</Text>
        <View
          className={`px-2 py-0.5 rounded-full ${
            item.status === 'Active' ? 'bg-green-50' : 'bg-amber-50'
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              item.status === 'Active' ? 'text-green-700' : 'text-amber-600'
            }`}
          >
            {item.status === 'Active'
              ? t('market.active')
              : t('market.pending')}
          </Text>
        </View>
      </View>
      <Text className="text-gray-900 text-base font-extrabold">
        {item.commodity}
      </Text>
      <View className="flex-row justify-between mt-1.5">
        <Text className="text-gray-600 text-xs">{item.qty}</Text>
        <Text className="text-green-700 text-sm font-extrabold">
          {item.budget}
        </Text>
      </View>
      <View className="flex-row justify-between mt-2">
        <Text className="text-gray-500 text-xs">📍 {item.location}</Text>
        <Text className="text-gray-400 text-xs">{item.date}</Text>
      </View>
      <TouchableOpacity
        className="mt-3 bg-green-700 rounded-xl py-2.5 items-center"
        activeOpacity={0.85}
      >
        <Text className="text-white text-sm font-bold">
          {t('market.submitOffer')}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const MarketplaceScreen = ({ navigation }: any) => {
  const mode = useAppSelector(s => s.app.mode);
  const { t } = useTranslation();
  const isBuyer = mode === 'buyer';
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = COMMODITIES.filter(
    c =>
      (activeCategory === 'All' ||
        c.name.toLowerCase().includes(activeCategory.toLowerCase())) &&
      (!search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.location.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-green-800 pt-12 pb-1 px-4 overflow-hidden">
        <View
          className="absolute rounded-full bg-green-700 opacity-25"
          style={{ width: 160, height: 160, top: -40, right: -40 }}
        />

        <View className="flex-row justify-between items-center mb-3">
          <View>
            <Text className="text-white text-xl font-extrabold">
              {isBuyer ? t('market.buyCommodities') : t('market.buyerDemands')}
            </Text>
            <Text
              className="text-xs mt-0.5"
              style={{ color: 'rgba(255,255,255,0.55)' }}
            >
              {isBuyer
                ? t('market.listingsAvailable', { count: filtered.length })
                : t('market.activeRequests', { count: DEMANDS.length })}
            </Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl"
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.25)',
            }}
          >
            <Text style={{ fontSize: 14 }}>⚙️</Text>
            <Text className="text-white text-xs font-semibold">
              {t('market.filter')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View
          className="flex-row items-center px-3 py-2.5 rounded-xl mb-2.5"
          style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.2)',
          }}
        >
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            placeholder={
              isBuyer
                ? t('market.searchCommodities')
                : t('market.searchRequests')
            }
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={search}
            onChangeText={setSearch}
            className="flex-1 text-white text-sm"
          />
        </View>

        {/* Category chips */}
        {isBuyer && (
          <FlatList
            horizontal
            data={CATEGORIES}
            keyExtractor={c => c}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 12, gap: 8 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setActiveCategory(item)}
                className="px-3.5 py-1.5 rounded-full"
                style={
                  activeCategory === item
                    ? {
                        backgroundColor: '#F3CD03',
                        borderWidth: 1.5,
                        borderColor: '#F3CD03',
                      }
                    : {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1.5,
                        borderColor: 'rgba(255,255,255,0.25)',
                      }
                }
              >
                <Text
                  className="text-xs"
                  style={
                    activeCategory === item
                      ? { color: '#111827', fontWeight: '800' }
                      : { color: 'rgba(255,255,255,0.8)', fontWeight: '500' }
                  }
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* List */}
      <FlatList
        data={(isBuyer ? filtered : DEMANDS) as any[]}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) =>
          isBuyer ? (
            <CommodityCard
              item={item}
              onPress={() =>
                navigation.navigate('ListingDetail', { listingId: item.id })
              }
            />
          ) : (
            <DemandCard item={item} />
          )
        }
        ListEmptyComponent={
          <View className="items-center pt-16 gap-2">
            <Text style={{ fontSize: 40 }}>🔍</Text>
            <Text className="text-gray-800 text-base font-bold">
              {t('market.noResults')}
            </Text>
            <Text className="text-gray-400 text-sm">
              {t('market.adjustSearch')}
            </Text>
          </View>
        }
      />

      {!isBuyer && (
        <TouchableOpacity
          className="absolute bg-green-600 items-center justify-center"
          style={{
            bottom: 90,
            right: 20,
            width: 52,
            height: 52,
            borderRadius: 26,
            shadowColor: '#1A6B34',
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 6,
          }}
          onPress={() => navigation.navigate('Post')}
          activeOpacity={0.88}
        >
          <Text className="text-white text-2xl">+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default MarketplaceScreen;
