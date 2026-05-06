import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import SubHeader from '../components/SubHeader';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07,
  shadowRadius: 12,
  elevation: 3,
};

const PersonalInfoScreen = ({ navigation }: any) => {
  const [name,  setName]  = useState('Muhammad Asad');
  const [email, setEmail] = useState('asad@traders.com');
  const [phone, setPhone] = useState('+92 300 1234567');
  const [city,  setCity]  = useState('Lahore');
  const [cnic,  setCnic]  = useState('35201-1234567-1');
  const [saved, setSaved] = useState(false);

  const fields = [
    { label: 'Full Name',  value: name,  setValue: setName,  kb: 'default',       placeholder: 'Enter full name'  },
    { label: 'Email',      value: email, setValue: setEmail, kb: 'email-address',  placeholder: 'Enter email'       },
    { label: 'City',       value: city,  setValue: setCity,  kb: 'default',        placeholder: 'Enter city'        },
    { label: 'CNIC',       value: cnic,  setValue: setCnic,  kb: 'default',        placeholder: 'XXXXX-XXXXXXX-X'  },
  ];

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SubHeader title="Personal Information" subtitle="Update your personal details" navigation={navigation} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* Avatar / photo section */}
        <View className="bg-white rounded-2xl overflow-hidden items-center py-7 mb-4" style={CARD_SHADOW}>
          <View className="relative mb-4">
            {/* Avatar circle */}
            <View
              className="w-24 h-24 rounded-full bg-green-700 items-center justify-center"
              style={{ shadowColor: '#1A6B34', shadowOpacity: 0.25, shadowRadius: 10, elevation: 4 }}
            >
              <Text className="text-white font-extrabold" style={{ fontSize: 34 }}>MA</Text>
            </View>
            {/* Camera badge */}
            <TouchableOpacity
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-orange-500 items-center justify-center border-2 border-white"
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 14 }}>📷</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-gray-900 text-base font-bold">Muhammad Asad</Text>
          <Text className="text-gray-400 text-xs mt-1">Tap camera icon to change photo</Text>
        </View>

        {/* Phone — display only */}
        <View className="bg-white rounded-2xl overflow-hidden mb-4" style={CARD_SHADOW}>
          <View className="px-4 pt-3 pb-1">
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mobile Number</Text>
          </View>
          <View className="flex-row items-center justify-between px-4 pb-4">
            <View className="flex-row items-center gap-2">
              <Text style={{ fontSize: 16 }}>📱</Text>
              <Text className="text-gray-900 text-base font-semibold">{phone}</Text>
            </View>
            <TouchableOpacity className="px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
              <Text className="text-green-700 text-xs font-bold">Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Editable fields */}
        {fields.map((f, idx) => (
          <View
            key={f.label}
            className="bg-white rounded-2xl overflow-hidden mb-3"
            style={CARD_SHADOW}
          >
            <View className="px-4 pt-3 pb-1">
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">{f.label}</Text>
            </View>
            <TextInput
              className="text-gray-900 text-base font-semibold px-4 pb-4"
              value={f.value}
              onChangeText={f.setValue}
              keyboardType={f.kb as any}
              placeholder={f.placeholder}
              placeholderTextColor="#9CA3AF"
              autoFocus={idx === 0 ? false : undefined}
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
