import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import SubHeader from '../components/SubHeader';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07,
  shadowRadius: 12,
  elevation: 3,
};

const TYPES = ['Trader', 'Farmer', 'Processor', 'Broker', 'Exporter'];

const BusinessProfileScreen = ({ navigation }: any) => {
  const [bizName, setBizName] = useState('Asad Traders');
  const [bizType, setBizType] = useState('Trader');
  const [ntn,     setNtn]     = useState('1234567-8');
  const [city,    setCity]    = useState('Lahore, Punjab');
  const [desc,    setDesc]    = useState('Wholesale wheat and rice trader serving Punjab markets since 2015.');
  const [saved,   setSaved]   = useState(false);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SubHeader title="Business Profile" subtitle="Your trading business details" navigation={navigation} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {[
          { label: 'Business Name',   value: bizName, set: setBizName, kb: 'default', placeholder: 'Business name'      },
          { label: 'NTN Number',      value: ntn,     set: setNtn,     kb: 'default', placeholder: 'e.g. 1234567-8'     },
          { label: 'City / Location', value: city,    set: setCity,    kb: 'default', placeholder: 'City, Province'     },
        ].map(f => (
          <View key={f.label} className="bg-white rounded-2xl overflow-hidden mb-3" style={CARD_SHADOW}>
            <View className="px-4 pt-3 pb-1">
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">{f.label}</Text>
            </View>
            <TextInput
              className="text-gray-900 text-base font-semibold px-4 pb-4"
              value={f.value}
              onChangeText={f.set}
              keyboardType={f.kb as any}
              placeholder={f.placeholder}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        ))}

        {/* Business type */}
        <View className="bg-white rounded-2xl overflow-hidden mb-3" style={CARD_SHADOW}>
          <View className="px-4 pt-3 pb-3">
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Business Type</Text>
            <View className="flex-row flex-wrap gap-2">
              {TYPES.map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setBizType(t)}
                  className={`px-4 py-2 rounded-full border ${bizType === t ? 'bg-green-700 border-green-700' : 'bg-gray-50 border-gray-200'}`}
                  activeOpacity={0.8}
                >
                  <Text className={`text-sm font-semibold ${bizType === t ? 'text-white' : 'text-gray-600'}`}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Description */}
        <View className="bg-white rounded-2xl overflow-hidden mb-3" style={CARD_SHADOW}>
          <View className="px-4 pt-3 pb-1">
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">About Business</Text>
          </View>
          <TextInput
            className="text-gray-900 text-sm px-4 pb-4"
            value={desc}
            onChangeText={setDesc}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholder="Brief description of your business..."
            placeholderTextColor="#9CA3AF"
            style={{ minHeight: 88 }}
          />
        </View>

        <TouchableOpacity
          onPress={() => setSaved(true)}
          className="bg-green-700 rounded-2xl py-4 items-center mt-2"
          style={{ shadowColor: '#1A6B34', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}
          activeOpacity={0.88}
        >
          <Text className="text-white text-base font-bold">{saved ? '✓ Saved' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default BusinessProfileScreen;
