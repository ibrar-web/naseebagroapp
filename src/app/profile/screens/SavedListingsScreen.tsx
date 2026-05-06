import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import SubHeader from '../components/SubHeader';
import { AppIcon } from '../../../assets/icons';
import type { AppIconName } from '../../../assets/icons';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07,
  shadowRadius: 12,
  elevation: 3,
};

const SAVED = [
  { id: 'L001', name: 'Premium Wheat', icon: 'listing' as AppIconName, price: '₨3,850/40kg', qty: '500 Tons',  location: 'Lahore'      },
  { id: 'L002', name: 'IRRI-6 Rice',  icon: 'listing' as AppIconName, price: '₨4,200/40kg', qty: '200 Tons',  location: 'Sheikhupura' },
  { id: 'L004', name: 'Yellow Maize', icon: 'listing' as AppIconName, price: '₨2,600/40kg', qty: '800 Tons',  location: 'Faisalabad'  },
];

const SavedListingsScreen = ({ navigation }: any) => (
  <View className="flex-1 bg-gray-50">
    <SubHeader title="Saved Listings" subtitle={`${SAVED.length} saved commodities`} navigation={navigation} />

    {SAVED.length === 0 ? (
      <View className="flex-1 items-center justify-center gap-4">
        <AppIcon name="savedEmpty" size={56} color="#9CA3AF" />
        <Text className="text-gray-700 text-lg font-bold">No saved listings</Text>
        <Text className="text-gray-400 text-sm text-center px-10">
          Tap the heart icon on any listing to save it here
        </Text>
      </View>
    ) : (
      <FlatList
        data={SAVED}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
            className="bg-white rounded-2xl flex-row items-center p-4 gap-3 mb-3"
            style={CARD_SHADOW}
            activeOpacity={0.88}
          >
            <View className="w-14 h-14 rounded-xl bg-green-50 items-center justify-center">
              <AppIcon name={item.icon} size={28} color="#1A6B34" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-sm font-bold">{item.name}</Text>
              <View className="flex-row items-center mt-0.5">
                <Text className="text-gray-500 text-xs">{item.qty}</Text>
                <Text className="text-gray-500 text-xs mx-1">·</Text>
                <AppIcon name="profileCity" size={12} color="#6B7280" />
                <Text className="text-gray-500 text-xs ml-1">{item.location}</Text>
              </View>
            </View>
            <View className="items-end gap-2">
              <Text className="text-green-700 text-sm font-extrabold">{item.price}</Text>
              <TouchableOpacity className="p-1" activeOpacity={0.7}>
                <AppIcon name="heart" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    )}
  </View>
);

export default SavedListingsScreen;
