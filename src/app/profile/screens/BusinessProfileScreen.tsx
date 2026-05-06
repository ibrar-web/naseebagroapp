import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import SubHeader from '../components/SubHeader';

const TYPES = ['Trader', 'Farmer', 'Processor', 'Broker', 'Exporter'];

const BusinessProfileScreen = ({ navigation }: any) => {
  const [bizName, setBizName]     = useState('Asad Traders');
  const [bizType, setBizType]     = useState('Trader');
  const [ntn,     setNtn]         = useState('1234567-8');
  const [city,    setCity]        = useState('Lahore, Punjab');
  const [desc,    setDesc]        = useState('Wholesale wheat and rice trader serving Punjab markets since 2015.');
  const [saved,   setSaved]       = useState(false);

  return (
    <KeyboardAvoidingView className="flex-1 bg-gray-50"
                          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SubHeader title="Business Profile" subtitle="Your trading business details" navigation={navigation} />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
                  keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Biz name + NTN */}
        {[
          { label: 'Business Name', icon: '🏢', value: bizName, set: setBizName, kb: 'default'   },
          { label: 'NTN Number',    icon: '🔢', value: ntn,     set: setNtn,     kb: 'default'   },
          { label: 'City / Location',icon:'📍', value: city,    set: setCity,    kb: 'default'   },
        ].map(f => (
          <View key={f.label} className="bg-white rounded-2xl px-4 pt-3 pb-4"
                style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
            <View className="flex-row items-center gap-2 mb-2">
              <Text style={{ fontSize: 14 }}>{f.icon}</Text>
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">{f.label}</Text>
            </View>
            <TextInput
              className="text-gray-900 text-base font-semibold border-b border-gray-100 pb-1"
              value={f.value}
              onChangeText={f.set}
              keyboardType={f.kb as any}
            />
          </View>
        ))}

        {/* Business type selector */}
        <View className="bg-white rounded-2xl px-4 pt-3 pb-4"
              style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Business Type</Text>
          <View className="flex-row flex-wrap gap-2">
            {TYPES.map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => setBizType(t)}
                className={`px-4 py-2 rounded-full border ${bizType === t ? 'bg-green-700 border-green-700' : 'bg-gray-50 border-gray-200'}`}
              >
                <Text className={`text-sm font-semibold ${bizType === t ? 'text-white' : 'text-gray-600'}`}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View className="bg-white rounded-2xl px-4 pt-3 pb-4"
              style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</Text>
          <TextInput
            className="text-gray-900 text-sm"
            value={desc}
            onChangeText={setDesc}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{ minHeight: 80 }}
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
