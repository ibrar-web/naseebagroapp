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

type BusinessField = {
  label: string;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  keyboardType?: KeyboardTypeOptions;
  placeholder: string;
  icon: string;
};

const BusinessRow = ({
  field,
  isLast,
}: {
  field: BusinessField;
  isLast: boolean;
}) => (
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

const BusinessProfileScreen = ({ navigation }: any) => {
  const [bizName, setBizName] = useState('Asad Agri Traders');
  const [bizType, setBizType] = useState('Seller / Supplier');
  const [registration, setRegistration] = useState('REG-2021-04521');
  const [crop, setCrop] = useState('Basmati Rice, Wheat');
  const [location, setLocation] = useState('Gujranwala, Punjab');
  const [farmSize, setFarmSize] = useState('45 Acres');
  const [saved, setSaved] = useState(false);

  const fields: BusinessField[] = [
    {
      label: 'Business Name',
      value: bizName,
      setValue: setBizName,
      keyboardType: 'default',
      placeholder: 'Business name',
      icon: '▥',
    },
    {
      label: 'Business Type',
      value: bizType,
      setValue: setBizType,
      keyboardType: 'default',
      placeholder: 'Business type',
      icon: '▣',
    },
    {
      label: 'Registration No',
      value: registration,
      setValue: setRegistration,
      keyboardType: 'default',
      placeholder: 'Registration number',
      icon: '▤',
    },
    {
      label: 'Primary Crop',
      value: crop,
      setValue: setCrop,
      keyboardType: 'default',
      placeholder: 'Primary crop',
      icon: '⬡',
    },
    {
      label: 'Farm Location',
      value: location,
      setValue: setLocation,
      keyboardType: 'default',
      placeholder: 'Farm location',
      icon: '⌖',
    },
    {
      label: 'Farm Size',
      value: farmSize,
      setValue: setFarmSize,
      keyboardType: 'default',
      placeholder: 'Farm size',
      icon: '⌁',
    },
  ];

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SubHeader title="Business Profile" navigation={navigation} />

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 pt-8 pb-10">
          <View className="mb-8 flex-row items-center rounded-[28px] bg-green-900 px-5 py-5 shadow-2xl shadow-green-900/20">
            <View className="h-16 w-16 items-center justify-center rounded-3xl bg-green-700">
              <Text className="text-white text-4xl">▥</Text>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-white text-xl font-extrabold">
                Asad Agri Traders
              </Text>
              <Text className="mt-1 text-green-300 text-base font-medium">
                Verified Seller • Since 2021
              </Text>
            </View>
            <View className="flex-row items-center rounded-full bg-green-50 px-3 py-1.5">
              <Text className="mr-2 text-green-600 text-base">●</Text>
              <Text className="text-green-700 text-base font-extrabold">
                Approved
              </Text>
            </View>
          </View>

          <View className="overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-black/5">
            {fields.map((field, index) => (
              <BusinessRow
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
              {saved ? 'Profile Updated' : 'Update Profile'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default BusinessProfileScreen;
