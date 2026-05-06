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
import type { AppIconName } from '../../../assets/icons';
import { useTranslation } from '../../../localization';
import type { TranslationKey } from '../../../localization';

type BusinessField = {
  labelKey: TranslationKey;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  keyboardType?: KeyboardTypeOptions;
  placeholderKey: TranslationKey;
  icon: AppIconName;
};

const BusinessRow = ({
  field,
  isLast,
}: {
  field: BusinessField;
  isLast: boolean;
}) => <BusinessRowContent field={field} isLast={isLast} />;

const BusinessRowContent = ({
  field,
  isLast,
}: {
  field: BusinessField;
  isLast: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <View
      className={`flex-row items-center px-5 py-4 ${
        isLast ? '' : 'border-b border-gray-100'
      }`}
    >
      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-green-50">
        <AppIcon name={field.icon} size={22} color="#1A6B34" />
      </View>
      <View className="ml-4 flex-1">
        <Text className="text-gray-400 text-base font-medium">
          {t(field.labelKey)}
        </Text>
        <TextInput
          className="p-0 text-gray-900 text-lg font-extrabold"
          value={field.value}
          onChangeText={field.setValue}
          keyboardType={field.keyboardType}
          placeholder={t(field.placeholderKey)}
          placeholderTextColor="#9CA3AF"
          returnKeyType="done"
        />
      </View>
      <View className="ml-3">
        <AppIcon name="edit" size={24} color="#D1D5DB" />
      </View>
    </View>
  );
};

const BusinessProfileScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [bizName, setBizName] = useState('Asad Agri Traders');
  const [bizType, setBizType] = useState('Seller / Supplier');
  const [registration, setRegistration] = useState('REG-2021-04521');
  const [crop, setCrop] = useState('Basmati Rice, Wheat');
  const [location, setLocation] = useState('Gujranwala, Punjab');
  const [farmSize, setFarmSize] = useState('45 Acres');
  const [saved, setSaved] = useState(false);

  const fields: BusinessField[] = [
    {
      labelKey: 'business.businessName',
      value: bizName,
      setValue: setBizName,
      keyboardType: 'default',
      placeholderKey: 'business.placeholderBusinessName',
      icon: 'business',
    },
    {
      labelKey: 'business.businessType',
      value: bizType,
      setValue: setBizType,
      keyboardType: 'default',
      placeholderKey: 'business.placeholderBusinessType',
      icon: 'businessType',
    },
    {
      labelKey: 'business.registrationNo',
      value: registration,
      setValue: setRegistration,
      keyboardType: 'default',
      placeholderKey: 'business.placeholderRegistrationNo',
      icon: 'registration',
    },
    {
      labelKey: 'business.primaryCrop',
      value: crop,
      setValue: setCrop,
      keyboardType: 'default',
      placeholderKey: 'business.placeholderPrimaryCrop',
      icon: 'crop',
    },
    {
      labelKey: 'business.farmLocation',
      value: location,
      setValue: setLocation,
      keyboardType: 'default',
      placeholderKey: 'business.placeholderFarmLocation',
      icon: 'profileCity',
    },
    {
      labelKey: 'business.farmSize',
      value: farmSize,
      setValue: setFarmSize,
      keyboardType: 'default',
      placeholderKey: 'business.placeholderFarmSize',
      icon: 'farmSize',
    },
  ];

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SubHeader title={t('business.title')} navigation={navigation} />

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 pt-8 pb-10">
          <View className="mb-8 flex-row items-center rounded-[28px] bg-green-900 px-5 py-5 shadow-2xl shadow-green-900/20">
            <View className="h-16 w-16 items-center justify-center rounded-3xl bg-green-700">
              <AppIcon name="business" size={34} color="#FFFFFF" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-white text-xl font-extrabold">
                Asad Agri Traders
              </Text>
              <Text className="mt-1 text-green-300 text-base font-medium">
                {t('business.verifiedSellerSince')}
              </Text>
            </View>
            <View className="flex-row items-center rounded-full bg-green-50 px-3 py-1.5">
              <View className="mr-2">
                <AppIcon name="approved" size={14} color="#2E9E52" />
              </View>
              <Text className="text-green-700 text-base font-extrabold">
                {t('common.approved')}
              </Text>
            </View>
          </View>

          <View className="overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-black/5">
            {fields.map((field, index) => (
              <BusinessRow
                key={field.labelKey}
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
              {saved ? t('common.profileUpdated') : t('common.updateProfile')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default BusinessProfileScreen;
