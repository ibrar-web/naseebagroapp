import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  KeyboardTypeOptions,
} from 'react-native';
import SubHeader from '../components/SubHeader';
import { AppIcon } from '../../../assets/icons';

type InfoField = {
  label: string;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  keyboardType?: KeyboardTypeOptions;
  placeholder: string;
  icon: string;
};

const InfoRow = ({ field, isLast }: { field: InfoField; isLast: boolean }) => (
  <View
    className={`flex-row items-center px-5 py-4 ${
      isLast ? '' : 'border-b border-gray-100'
    }`}
  >
    <View className="h-12 w-12 items-center justify-center rounded-2xl bg-green-50">
      <Text className="text-green-700 text-2xl">{field.icon}</Text>
    </View>
    <View className="ml-4 flex-1">
      <Text className="text-gray-400 text-base font-medium">{field.label}</Text>
      <TextInput
        className="p-0 text-gray-900 text-lg font-extrabold"
        value={field.value}
        onChangeText={field.setValue}
        keyboardType={field.keyboardType}
        placeholder={field.placeholder}
        placeholderTextColor="#9CA3AF"
        returnKeyType="done"
      />
    </View>
    <View className="ml-3">
      <AppIcon name="edit" size={24} color="#D1D5DB" />
    </View>
  </View>
);

const PersonalInfoScreen = ({ navigation }: any) => {
  const [name, setName] = useState('Muhammad Asad');
  const [email, setEmail] = useState('asad@traders.com');
  const [phone, setPhone] = useState('+92 300 1234567');
  const [city, setCity] = useState('Lahore, Punjab');
  const [dob, setDob] = useState('15 March 1990');
  const [cnic, setCnic] = useState('35202-XXXXXXX-X');
  const [saved, setSaved] = useState(false);

  const fields: InfoField[] = [
    {
      label: 'Full Name',
      value: name,
      setValue: setName,
      keyboardType: 'default',
      placeholder: 'Enter full name',
      icon: '♙',
    },
    {
      label: 'Email',
      value: email,
      setValue: setEmail,
      keyboardType: 'email-address',
      placeholder: 'Enter email',
      icon: '✉',
    },
    {
      label: 'Phone',
      value: phone,
      setValue: setPhone,
      keyboardType: 'phone-pad',
      placeholder: 'Enter phone',
      icon: '☎',
    },
    {
      label: 'City',
      value: city,
      setValue: setCity,
      keyboardType: 'default',
      placeholder: 'Enter city',
      icon: '⌖',
    },
    {
      label: 'Date of Birth',
      value: dob,
      setValue: setDob,
      keyboardType: 'default',
      placeholder: 'Enter date of birth',
      icon: '◷',
    },
    {
      label: 'CNIC',
      value: cnic,
      setValue: setCnic,
      keyboardType: 'default',
      placeholder: 'XXXXX-XXXXXXX-X',
      icon: '⬡',
    },
  ];

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SubHeader title="Personal Information" navigation={navigation} />

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 pt-6 pb-10">
          <View className="items-center pb-10">
            <TouchableOpacity
              className="h-24 w-24 items-center justify-center rounded-[28px] border-4 border-white bg-orange-500 shadow-2xl shadow-black/10"
              activeOpacity={0.85}
            >
              <Text className="text-4xl">👤</Text>
            </TouchableOpacity>
            <TouchableOpacity className="mt-5" activeOpacity={0.7}>
              <Text className="text-green-700 text-lg font-extrabold">
                Change Photo
              </Text>
            </TouchableOpacity>
          </View>

          <View className="overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-black/5">
            {fields.map((field, index) => (
              <InfoRow
                key={field.label}
                field={field}
                isLast={index === fields.length - 1}
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={() => setSaved(true)}
            className="mt-8 h-16 items-center justify-center rounded-3xl bg-green-700 shadow-2xl shadow-green-900/20"
            activeOpacity={0.88}
          >
            <Text className="text-white text-xl font-extrabold">
              {saved ? 'Saved' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PersonalInfoScreen;
