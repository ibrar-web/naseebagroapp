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
import { useAppDispatch } from '../../../store';
import { setRegisterBasicInfo } from '../../../store/slices/registerSlice';
import GreenHeader from '../components/GreenHeader';
import StepDots from '../components/StepDots';

type Props = NativeStackScreenProps<RootStackParamList, 'BasicInfo'>;

const INPUT_STYLE = {
  shadowColor: '#000',
  shadowOpacity: 0.04,
  shadowRadius: 4,
  elevation: 1,
} as const;

const BasicInfoScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [form, setForm] = useState({
    name: '',
    email: '',
    dateOfBirth: '',
    password: '',
    confirm: '',
  });

  const dateIsValid =
    /^\d{4}-\d{2}-\d{2}$/.test(form.dateOfBirth) &&
    !Number.isNaN(new Date(form.dateOfBirth).getTime());

  const canContinue =
    form.name.length > 2 &&
    form.email.includes('@') &&
    dateIsValid &&
    form.password.length >= 8 &&
    form.password === form.confirm;

  const set = (key: keyof typeof form) => (val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleContinue = () => {
    dispatch(
      setRegisterBasicInfo({
        fullName: form.name,
        email: form.email,
        password: form.password,
        dateOfBirth: form.dateOfBirth,
      }),
    );
    navigation.navigate('BizInfo');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <GreenHeader
        step={t('auth.basicInfoStep')}
        title={t('auth.basicInfoTitle')}
        subtitle={t('auth.basicInfoSubtitle')}
        icon="profileName"
        onBack={() => navigation.goBack()}
      />

      <StepDots active={0} />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          className="bg-white rounded-2xl p-4 mb-5 gap-4"
          style={{
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          {[
            {
              label: t('auth.fullName'),
              key: 'name' as const,
              placeholder: t('auth.fullNamePlaceholder'),
              keyboard: 'default' as const,
              secure: false,
            },
            {
              label: t('auth.email'),
              key: 'email' as const,
              placeholder: t('auth.emailPlaceholder'),
              keyboard: 'email-address' as const,
              secure: false,
            },
            {
              label: t('auth.dateOfBirth'),
              key: 'dateOfBirth' as const,
              placeholder: t('auth.dateOfBirthPlaceholder'),
              keyboard: 'numbers-and-punctuation' as const,
              secure: false,
            },
            {
              label: t('auth.password'),
              key: 'password' as const,
              placeholder: t('auth.passwordPlaceholder'),
              keyboard: 'default' as const,
              secure: true,
            },
            {
              label: t('auth.confirmPassword'),
              key: 'confirm' as const,
              placeholder: t('auth.confirmPasswordPlaceholder'),
              keyboard: 'default' as const,
              secure: true,
            },
          ].map(field => (
            <View key={field.key}>
              <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                {field.label}
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 text-gray-900 text-base"
                style={{ paddingVertical: 12, ...INPUT_STYLE }}
                placeholder={field.placeholder}
                placeholderTextColor="#9CA3AF"
                value={form[field.key]}
                onChangeText={set(field.key)}
                keyboardType={field.keyboard}
                secureTextEntry={field.secure}
                autoCapitalize={field.key === 'email' ? 'none' : 'words'}
              />
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleContinue}
          className={`py-4 rounded-2xl items-center bg-green-700 ${
            !canContinue ? 'opacity-40' : ''
          }`}
          disabled={!canContinue}
          style={
            canContinue
              ? {
                  shadowColor: '#1A6B34',
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }
              : {}
          }
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

export default BasicInfoScreen;
