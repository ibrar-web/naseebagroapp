import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAppSelector } from '../../../store';

const COMMODITIES = ['Wheat', 'Rice', 'Cotton', 'Maize', 'Mustard', 'Sugarcane', 'Other'];
const UNITS       = ['Tons', 'Maunds', 'Quintals', 'KGs'];

const PostScreen = () => {
  const mode    = useAppSelector(s => s.app.mode);
  const isBuyer = mode === 'buyer';

  const [commodity, setCommodity] = useState('');
  const [qty,       setQty]       = useState('');
  const [unit,      setUnit]      = useState('Tons');
  const [price,     setPrice]     = useState('');
  const [location,  setLocation]  = useState('');
  const [notes,     setNotes]     = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6 gap-4">
        <Text style={{ fontSize: 64 }}>✅</Text>
        <Text className="text-gray-900 text-2xl font-extrabold text-center">
          {isBuyer ? 'Demand Posted!' : 'Listing Created!'}
        </Text>
        <Text className="text-gray-500 text-sm text-center leading-5">
          {isBuyer
            ? 'Sellers will be notified and can submit offers.'
            : "Your listing is under review. You'll be notified once approved."}
        </Text>
        <TouchableOpacity
          onPress={() => setSubmitted(false)}
          className="bg-green-700 rounded-2xl py-4 px-12 mt-2"
          style={{ shadowColor: '#1A6B34', shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 }}
          activeOpacity={0.88}
        >
          <Text className="text-white text-base font-bold">Post Another</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isValid = commodity && qty && price && location;

  return (
    <KeyboardAvoidingView className="flex-1 bg-gray-50"
                          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* Header */}
      <View className="bg-green-800 pt-12 pb-6 px-4 overflow-hidden">
        <View className="absolute rounded-full bg-green-700 opacity-20"
              style={{ width: 160, height: 160, top: -40, right: -40 }} />
        <Text className="text-white text-2xl font-extrabold">
          {isBuyer ? '📋 Post a Demand' : '📦 Create Listing'}
        </Text>
        <Text className="text-green-300 text-sm mt-1">
          {isBuyer ? "Let sellers know what you need" : "List your commodity for buyers"}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 60 }}
                  keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Commodity */}
        <View className="bg-white rounded-2xl p-4"
              style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
          <Text className="text-gray-900 text-sm font-extrabold mb-3">Commodity</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
            {COMMODITIES.map(c => (
              <TouchableOpacity
                key={c} onPress={() => setCommodity(c)}
                className={`px-4 py-2 rounded-full border ${commodity === c ? 'bg-green-700 border-green-700' : 'bg-gray-50 border-gray-200'}`}
              >
                <Text className={`text-sm font-semibold ${commodity === c ? 'text-white' : 'text-gray-600'}`}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quantity + Unit */}
        <View className="bg-white rounded-2xl p-4 gap-3"
              style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
          <Text className="text-gray-900 text-sm font-extrabold">Quantity & Unit</Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-base bg-gray-50"
            placeholder="e.g. 200"
            placeholderTextColor="#9CA3AF"
            value={qty}
            onChangeText={setQty}
            keyboardType="numeric"
          />
          <View className="flex-row flex-wrap gap-2">
            {UNITS.map(u => (
              <TouchableOpacity
                key={u} onPress={() => setUnit(u)}
                className={`px-4 py-2 rounded-xl border ${unit === u ? 'bg-green-700 border-green-700' : 'bg-gray-50 border-gray-200'}`}
              >
                <Text className={`text-sm font-semibold ${unit === u ? 'text-white' : 'text-gray-600'}`}>{u}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Price */}
        <View className="bg-white rounded-2xl overflow-hidden"
              style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
          <Text className="text-gray-900 text-sm font-extrabold px-4 pt-4 pb-2">
            {isBuyer ? 'Budget (per 40kg)' : 'Asking Price (per 40kg)'}
          </Text>
          <View className="flex-row items-center border-t border-gray-100">
            <View className="px-4 py-3 bg-green-50 border-r border-gray-200">
              <Text className="text-green-700 text-lg font-extrabold">₨</Text>
            </View>
            <TextInput
              className="flex-1 px-4 text-gray-900 text-lg font-bold"
              style={{ paddingVertical: 12 }}
              placeholder="e.g. 3850"
              placeholderTextColor="#9CA3AF"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Location */}
        <View className="bg-white rounded-2xl p-4 gap-2"
              style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
          <Text className="text-gray-900 text-sm font-extrabold">Location</Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-gray-50"
            placeholder="e.g. Lahore, Punjab"
            placeholderTextColor="#9CA3AF"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Notes */}
        <View className="bg-white rounded-2xl p-4 gap-2"
              style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
          <Text className="text-gray-900 text-sm font-extrabold">Additional Notes</Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-gray-50"
            placeholder={isBuyer ? 'Quality grade, delivery preference...' : 'Quality, packaging, availability...'}
            placeholderTextColor="#9CA3AF"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{ minHeight: 96 }}
          />
        </View>

        <TouchableOpacity
          onPress={() => setSubmitted(true)}
          className={`bg-green-700 rounded-2xl py-4 items-center ${!isValid ? 'opacity-40' : ''}`}
          activeOpacity={0.88}
          disabled={!isValid}
          style={{ shadowColor: '#1A6B34', shadowOpacity: isValid ? 0.25 : 0, shadowRadius: 8, elevation: isValid ? 4 : 0 }}
        >
          <Text className="text-white text-base font-bold">
            {isBuyer ? '📋 Post Demand' : '📦 Submit Listing'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PostScreen;
