import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import SubHeader from '../components/SubHeader';

const PersonalInfoScreen = ({ navigation }: any) => {
  const [name,  setName]  = useState('Muhammad Asad');
  const [email, setEmail] = useState('asad@traders.com');
  const [phone, setPhone] = useState('+92 300 1234567');
  const [city,  setCity]  = useState('Lahore');
  const [cnic,  setCnic]  = useState('35201-1234567-1');
  const [saved, setSaved] = useState(false);

  const fields = [
    { label: 'Full Name',    value: name,  setValue: setName,  kb: 'default',      icon: '👤' },
    { label: 'Email',        value: email, setValue: setEmail, kb: 'email-address', icon: '✉️' },
    { label: 'City',         value: city,  setValue: setCity,  kb: 'default',       icon: '📍' },
    { label: 'CNIC',         value: cnic,  setValue: setCnic,  kb: 'default',       icon: '🪪' },
  ];

  return (
    <KeyboardAvoidingView className="flex-1 bg-gray-50"
                          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SubHeader title="Personal Information" subtitle="Update your personal details" navigation={navigation} />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
                  keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Phone — display only */}
        <View className="bg-white rounded-2xl p-4"
              style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Mobile Number</Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Text style={{ fontSize: 16 }}>📱</Text>
              <Text className="text-gray-900 text-base font-semibold">{phone}</Text>
            </View>
            <TouchableOpacity className="px-3 py-1.5 bg-green-100 rounded-lg">
              <Text className="text-green-700 text-xs font-bold">Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Editable fields */}
        {fields.map(f => (
          <View key={f.label} className="bg-white rounded-2xl px-4 pt-3 pb-4"
                style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
            <View className="flex-row items-center gap-2 mb-2">
              <Text style={{ fontSize: 14 }}>{f.icon}</Text>
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">{f.label}</Text>
            </View>
            <TextInput
              className="text-gray-900 text-base font-semibold border-b border-gray-100 pb-1"
              value={f.value}
              onChangeText={f.setValue}
              keyboardType={f.kb as any}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        ))}

        {/* Save button */}
        <TouchableOpacity
          onPress={() => setSaved(true)}
          className="bg-green-700 rounded-2xl py-4 items-center mt-2"
          style={{ shadowColor: '#1A6B34', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}
          activeOpacity={0.88}
        >
          <Text className="text-white text-base font-bold">
            {saved ? '✓ Saved' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PersonalInfoScreen;
