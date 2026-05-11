import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useTranslation } from '../../../localization';
import { CITIES } from '../../../constants';
import { useAppDispatch } from '../../../store';
import { setRegisterBizInfo } from '../../../store/slices/registerSlice';
import GreenHeader from '../components/GreenHeader';
import StepDots from '../components/StepDots';

type Props = NativeStackScreenProps<RootStackParamList, 'BizInfo'>;

const BIZ_TYPES = ['Farmer', 'Trader', 'Wholesaler', 'Retailer', 'Exporter'];

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 3,
} as const;

const BizInfoScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [form, setForm] = useState({
    businessName: '',
    businessType: '',
    city: '',
    address: '',
  });
  const [showBizTypePicker, setShowBizTypePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);

  const canContinue =
    form.businessName.length > 1 &&
    form.businessType.length > 0 &&
    form.city.length > 0 &&
    form.address.length > 3;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <GreenHeader
        step={t('auth.bizInfoStep')}
        title={t('auth.bizInfoTitle')}
        subtitle={t('auth.bizInfoSubtitle')}
        icon="business"
        onBack={() => navigation.goBack()}
      />

      <StepDots active={1} />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-2xl p-4 mb-5 gap-4" style={CARD_SHADOW}>
          {/* Business Name */}
          <View>
            <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              {t('auth.businessName')}
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 text-gray-900 text-base"
              style={{ paddingVertical: 12 }}
              placeholder={t('auth.businessNamePlaceholder')}
              placeholderTextColor="#9CA3AF"
              value={form.businessName}
              onChangeText={v => setForm(p => ({ ...p, businessName: v }))}
              autoCapitalize="words"
            />
          </View>

          {/* Business Type */}
          <View>
            <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              {t('auth.businessType')}
            </Text>
            <TouchableOpacity
              onPress={() => setShowBizTypePicker(!showBizTypePicker)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 flex-row justify-between items-center"
              style={{ paddingVertical: 14 }}
              activeOpacity={0.8}
            >
              <Text className={form.businessType ? 'text-gray-900 text-base' : 'text-gray-400 text-base'}>
                {form.businessType || t('auth.selectBusinessType')}
              </Text>
              <Text className="text-gray-400 text-sm">▼</Text>
            </TouchableOpacity>
            {showBizTypePicker && (
              <View className="bg-white rounded-xl border border-gray-200 mt-1 overflow-hidden" style={{ elevation: 4 }}>
                {BIZ_TYPES.map(type => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => {
                      setForm(p => ({ ...p, businessType: type }));
                      setShowBizTypePicker(false);
                    }}
                    className={`px-4 py-3 border-b border-gray-100 ${form.businessType === type ? 'bg-green-50' : ''}`}
                    activeOpacity={0.7}
                  >
                    <Text className={`text-sm ${form.businessType === type ? 'text-green-700 font-bold' : 'text-gray-700'}`}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* City */}
          <View>
            <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              {t('auth.city')}
            </Text>
            <TouchableOpacity
              onPress={() => setShowCityPicker(!showCityPicker)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 flex-row justify-between items-center"
              style={{ paddingVertical: 14 }}
              activeOpacity={0.8}
            >
              <Text className={form.city ? 'text-gray-900 text-base' : 'text-gray-400 text-base'}>
                {form.city || t('auth.selectCity')}
              </Text>
              <Text className="text-gray-400 text-sm">▼</Text>
            </TouchableOpacity>
            {showCityPicker && (
              <ScrollView
                className="bg-white rounded-xl border border-gray-200 mt-1 overflow-hidden"
                style={{ maxHeight: 180, elevation: 4 }}
                nestedScrollEnabled
              >
                {CITIES.map(city => (
                  <TouchableOpacity
                    key={city}
                    onPress={() => {
                      setForm(p => ({ ...p, city }));
                      setShowCityPicker(false);
                    }}
                    className={`px-4 py-3 border-b border-gray-100 ${form.city === city ? 'bg-green-50' : ''}`}
                    activeOpacity={0.7}
                  >
                    <Text className={`text-sm ${form.city === city ? 'text-green-700 font-bold' : 'text-gray-700'}`}>
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Address */}
          <View>
            <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              {t('auth.address')}
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 text-gray-900 text-base"
              style={{ paddingVertical: 12, height: 80, textAlignVertical: 'top' }}
              placeholder={t('auth.addressPlaceholder')}
              placeholderTextColor="#9CA3AF"
              value={form.address}
              onChangeText={v => setForm(p => ({ ...p, address: v }))}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            dispatch(setRegisterBizInfo({
              city: form.city,
              businessName: form.businessName,
              businessType: form.businessType,
            }));
            navigation.navigate('IdVerify');
          }}
          className={`py-4 rounded-2xl items-center bg-green-700 ${!canContinue ? 'opacity-40' : ''}`}
          disabled={!canContinue}
          style={canContinue ? { shadowColor: '#1A6B34', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 } : {}}
          activeOpacity={0.88}
        >
          <Text className="text-white text-base font-bold">
            {t('auth.continueNext')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default BizInfoScreen;
