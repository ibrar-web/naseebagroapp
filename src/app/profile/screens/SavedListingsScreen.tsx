import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../../../assets/icons';
import { useAppSelector } from '../../../store';
import { useTranslation } from '../../../localization';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.05,
  shadowRadius: 18,
  elevation: 3,
};

const SavedListingsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const savedListings = useAppSelector(state => state.app.savedListings);
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="rgb(255, 255, 255)"
        translucent={false}
      />
      <View style={{ height: insets.top, backgroundColor: '#FFFFFF' }} />

      <View className="bg-green-800 px-10 pb-10 pt-16">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="h-16 w-16 items-center justify-center rounded-2xl bg-white/20"
            activeOpacity={0.75}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <AppIcon name="back" size={30} color="#FFFFFF" />
          </TouchableOpacity>
          <View className="ml-6 flex-1">
            <Text className="text-white text-3xl font-extrabold">
              {t('saved.title')}
            </Text>
            <Text className="mt-2 text-green-200 text-lg font-medium">
              {t('saved.count', { count: savedListings.length })}
            </Text>
          </View>
        </View>
      </View>

      {savedListings.length === 0 ? (
        <View className="flex-1 items-center px-10 pt-32">
          <View className="h-40 w-40 items-center justify-center rounded-full bg-green-50">
            <AppIcon name="savedEmpty" size={68} color="#45B86A" />
          </View>
          <Text className="mt-12 text-center text-gray-900 text-2xl font-extrabold">
            {t('saved.emptyTitle')}
          </Text>
          <Text className="mt-6 text-center text-gray-500 text-lg leading-7">
            {t('saved.emptyBody')}
          </Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('MainTabs', { screen: 'Market' })
            }
            className="mt-10 rounded-3xl bg-green-700 px-9 py-5 shadow-2xl shadow-green-900/20"
            activeOpacity={0.85}
          >
            <Text className="text-white text-lg font-extrabold">
              {t('common.browseMarketplace')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={savedListings}
          keyExtractor={item => item}
          contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('CommodityDetail', { listingId: item })
              }
              className="mb-3 flex-row items-center rounded-2xl bg-white p-4"
              style={CARD_SHADOW}
              activeOpacity={0.88}
            >
              <View className="h-14 w-14 items-center justify-center rounded-xl bg-green-50">
                <AppIcon name="listing" size={28} color="#1A6B34" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-gray-900 text-base font-bold">
                  {item}
                </Text>
                <Text className="mt-1 text-gray-400 text-sm">
                  {t('saved.title')}
                </Text>
              </View>
              <AppIcon name="heart" size={20} color="#EF4444" />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default SavedListingsScreen;
