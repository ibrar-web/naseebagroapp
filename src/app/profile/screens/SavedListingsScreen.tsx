import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import SubHeader from '../components/SubHeader';

const SAVED = [
  { id: 'L001', name: 'Premium Wheat',  emoji: '🌾', price: '₨3,850/40kg', qty: '500 Tons',  location: 'Lahore'     },
  { id: 'L002', name: 'IRRI-6 Rice',   emoji: '🍚', price: '₨4,200/40kg', qty: '200 Tons',  location: 'Sheikhupura'},
  { id: 'L004', name: 'Yellow Maize',  emoji: '🌽', price: '₨2,600/40kg', qty: '800 Tons',  location: 'Faisalabad' },
];

const SavedListingsScreen = ({ navigation }: any) => (
  <View className="flex-1 bg-gray-50">
    <SubHeader title="Saved Listings" subtitle={`${SAVED.length} saved commodities`} navigation={navigation} />

    {SAVED.length === 0 ? (
      <View className="flex-1 items-center justify-center gap-4">
        <Text style={{ fontSize: 56 }}>🔖</Text>
        <Text className="text-gray-700 text-lg font-bold">No saved listings</Text>
        <Text className="text-gray-400 text-sm text-center px-10">
          Tap the heart icon on any listing to save it here
        </Text>
      </View>
    ) : (
      <FlatList
        data={SAVED}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
            className="bg-white rounded-2xl flex-row items-center p-4 gap-3"
            style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}
            activeOpacity={0.88}
          >
            <View className="w-14 h-14 rounded-xl bg-green-50 items-center justify-center">
              <Text style={{ fontSize: 30 }}>{item.emoji}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-sm font-bold">{item.name}</Text>
              <Text className="text-gray-500 text-xs mt-0.5">{item.qty} · 📍 {item.location}</Text>
            </View>
            <View className="items-end gap-2">
              <Text className="text-green-700 text-sm font-extrabold">{item.price}</Text>
              <TouchableOpacity className="p-1">
                <Text style={{ fontSize: 18 }}>❤️</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    )}
  </View>
);

export default SavedListingsScreen;
