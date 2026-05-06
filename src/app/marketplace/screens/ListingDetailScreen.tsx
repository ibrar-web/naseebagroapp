import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useTranslation } from '../../../localization';

type Props = NativeStackScreenProps<RootStackParamList, 'ListingDetail'>;

const LISTINGS: Record<string, any> = {
  L001: {
    name: 'Premium Wheat',
    emoji: '🌾',
    qty: '500 Tons',
    price: '₨3,850/40kg',
    location: 'Lahore, Punjab',
    seller: 'Asad Traders',
    rating: 4.8,
    deals: 24,
    verified: true,
    desc: 'High-quality wheat from central Punjab farms. Well-dried, free from impurities. Available immediately for bulk purchase.',
  },
  L002: {
    name: 'IRRI-6 Rice',
    emoji: '🍚',
    qty: '200 Tons',
    price: '₨4,200/40kg',
    location: 'Sheikhupura, Punjab',
    seller: 'Punjab Agri Co',
    rating: 4.6,
    deals: 18,
    verified: true,
    desc: 'Fresh harvest IRRI-6 paddy rice. 2024 crop. Moisture content below 14%. Bagged in 40kg standard sacks.',
  },
  L003: {
    name: 'Desi Cotton Grade A',
    emoji: '☁️',
    qty: '150 Tons',
    price: '₨8,500/40kg',
    location: 'Multan, Punjab',
    seller: 'Cotton King',
    rating: 4.2,
    deals: 9,
    verified: false,
    desc: 'Grade A desi cotton lint. Manually picked. Suitable for spinning mills and export.',
  },
  L004: {
    name: 'Yellow Maize',
    emoji: '🌽',
    qty: '800 Tons',
    price: '₨2,600/40kg',
    location: 'Faisalabad, Punjab',
    seller: 'Farm Fresh Ltd',
    rating: 4.7,
    deals: 31,
    verified: true,
    desc: 'Dry yellow maize suitable for feed mills and flour production. Large quantity available at competitive rates.',
  },
};

const ListingDetailScreen = ({ navigation, route }: Props) => {
  const { listingId } = route.params;
  const item = LISTINGS[listingId] ?? LISTINGS['L001'];
  const [saved, setSaved] = useState(false);
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Hero header */}
      <View
        className="bg-green-800 items-center justify-end pb-5 overflow-hidden"
        style={{ height: 200 }}
      >
        <View
          className="absolute rounded-full bg-green-700 opacity-30"
          style={{ width: 200, height: 200, top: -40, right: -40 }}
        />

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="absolute items-center justify-center"
          style={{
            top: 48,
            left: 16,
            width: 38,
            height: 38,
            borderRadius: 10,
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.2)',
          }}
        >
          <Text className="text-white text-lg">←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSaved(s => !s)}
          className="absolute items-center justify-center"
          style={{
            top: 48,
            right: 16,
            width: 38,
            height: 38,
            borderRadius: 10,
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.2)',
          }}
        >
          <Text style={{ fontSize: 20 }}>{saved ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>

        <View
          className="items-center justify-center"
          style={{
            width: 88,
            height: 88,
            borderRadius: 24,
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderWidth: 2,
            borderColor: 'rgba(255,255,255,0.2)',
          }}
        >
          <Text style={{ fontSize: 56 }}>{item.emoji}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title row */}
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1">
            <Text className="text-gray-900 text-xl font-extrabold">
              {item.name}
            </Text>
            <View className="flex-row items-center gap-2 mt-1">
              {item.verified && (
                <View className="bg-green-100 px-2 py-0.5 rounded-full">
                  <Text className="text-green-700 text-xs font-bold">
                    ✓ {t('listing.verified')}
                  </Text>
                </View>
              )}
              <Text className="text-gray-500 text-xs">
                ⭐ {item.rating} ({item.deals} {t('listing.deals')})
              </Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-green-700 text-lg font-extrabold">
              {item.price}
            </Text>
            <Text className="text-gray-400 text-xs mt-0.5">
              {t('listing.available', { qty: item.qty })}
            </Text>
          </View>
        </View>

        {/* Info grid */}
        <View className="flex-row flex-wrap gap-2.5 mb-4">
          {[
            { icon: '📍', label: t('listing.location'), val: item.location },
            { icon: '🏢', label: t('listing.seller'), val: item.seller },
            { icon: '📦', label: t('listing.quantity'), val: item.qty },
            { icon: '💰', label: t('listing.price'), val: item.price },
          ].map(info => (
            <View
              key={info.label}
              className="bg-white rounded-2xl p-3.5 gap-1"
              style={{
                flex: 1,
                minWidth: '45%',
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Text style={{ fontSize: 20 }}>{info.icon}</Text>
              <Text
                className="text-gray-400 text-xs font-semibold uppercase"
                style={{ letterSpacing: 0.5 }}
              >
                {info.label}
              </Text>
              <Text className="text-gray-800 text-sm font-bold">
                {info.val}
              </Text>
            </View>
          ))}
        </View>

        {/* Description */}
        <View
          className="bg-white rounded-2xl p-4 mb-3.5"
          style={{
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <Text className="text-gray-900 text-sm font-extrabold mb-2.5">
            {t('listing.about')}
          </Text>
          <Text className="text-gray-600 text-sm leading-5">{item.desc}</Text>
        </View>

        {/* Price breakdown */}
        <View
          className="bg-white rounded-2xl p-4 mb-3.5"
          style={{
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <Text className="text-gray-900 text-sm font-extrabold mb-2.5">
            {t('listing.priceBreakdown')}
          </Text>
          {[
            { label: t('listing.unitPrice'), val: item.price },
            { label: t('listing.commission'), val: '₨38/40kg' },
            { label: t('listing.estDelivery'), val: '₨85/40kg' },
          ].map(row => (
            <View
              key={row.label}
              className="flex-row justify-between py-2 border-b border-gray-100"
            >
              <Text className="text-gray-600 text-sm">{row.label}</Text>
              <Text className="text-gray-800 text-sm font-bold">{row.val}</Text>
            </View>
          ))}
          <View className="flex-row justify-between pt-3">
            <Text className="text-gray-900 text-sm font-extrabold">
              {t('listing.totalPer')}
            </Text>
            <Text className="text-green-700 text-base font-extrabold">
              ₨3,973
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky action bar */}
      <View
        className="absolute bottom-0 left-0 right-0 flex-row gap-2.5 bg-white px-4 pt-3 pb-7 border-t border-gray-100"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <TouchableOpacity
          className="flex-1 py-3.5 rounded-xl items-center border-2 border-green-700"
          activeOpacity={0.85}
        >
          <Text className="text-green-700 text-sm font-bold">
            {t('listing.chat')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-green-700 py-3.5 rounded-xl items-center"
          style={{ flex: 2 }}
          activeOpacity={0.88}
        >
          <Text className="text-white text-sm font-bold">
            {t('listing.sendInterest')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ListingDetailScreen;
