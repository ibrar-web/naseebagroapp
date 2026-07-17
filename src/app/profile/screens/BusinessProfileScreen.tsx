import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  KeyboardTypeOptions,
  RefreshControl,
} from 'react-native';
import { showAlert } from '../../components/toastConfig';
import SubHeader from '../components/SubHeader';
import { AppIcon } from '../../../assets/icons';
import type { AppIconName } from '../../../assets/icons';
import { useTranslation } from '../../../localization';
import type { TranslationKey } from '../../../localization';
import { useAppDispatch, useAppSelector } from '../../../store';
import { updateUser } from '../../../store/slices/authSlice';
import { AppLoader } from '../../components';
import api from '../../../utils/api';
import { unwrapApiData } from '../utils/profileApi';
import { promptLogin } from '../../auth/utils/requireLogin';

const formatDisplayDate = (value: any) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

type BusinessForm = {
  business_name: string;
  business_type: string;
  business_registration_number: string;
  primary_crop: string;
  farm_location: string;
  farm_size: string;
};

type BusinessField = {
  labelKey: TranslationKey;
  value: string;
  onChangeText: (v: string) => void;
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
          onChangeText={field.onChangeText}
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
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const token = useAppSelector(s => s.auth.token);

  const [form, setForm] = useState<BusinessForm>({
    business_name: '',
    business_type: '',
    business_registration_number: '',
    primary_crop: '',
    farm_location: '',
    farm_size: '',
  });
  const [serverForm, setServerForm] = useState<BusinessForm>(form);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const verified = user?.is_verified ?? false;
  const verifiedAt = user?.verified_at ?? '';

  const setField =
    <K extends keyof BusinessForm>(key: K) =>
    (v: string) => {
      setForm(f => ({ ...f, [key]: v }));
      setSaved(false);
    };

  const loadBusinessInfo = useCallback(
    async (isRefresh = false) => {
      if (!token) {
        return;
      }

      if (!isRefresh) setLoading(true);
      try {
        const response = await api.profile.business.get();
        console.log('business', response);
        const data = unwrapApiData(response) ?? {};
        const profile = data.profile ?? data;
        const loaded: BusinessForm = {
          business_name: String(
            profile.business_name ?? profile.businessName ?? '',
          ),
          business_type: String(
            profile.business_type ?? profile.businessType ?? '',
          ),
          business_registration_number: String(
            profile.business_registration_number ??
              profile.businessRegistrationNumber ??
              '',
          ),
          primary_crop: String(
            profile.primary_crop ?? profile.primaryCrop ?? '',
          ),
          farm_location: String(
            profile.farm_location ?? profile.farmLocation ?? profile.city ?? '',
          ),
          farm_size: String(profile.farm_size ?? profile.farmSize ?? ''),
        };
        setForm(loaded);
        setServerForm(loaded);
      } catch (error) {
        console.error(
          'BusinessProfileScreen: Failed to load business info:',
          error,
        );
      } finally {
        if (!isRefresh) setLoading(false);
      }
    },
    [token],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadBusinessInfo(true);
    } finally {
      setRefreshing(false);
    }
  }, [loadBusinessInfo]);

  useFocusEffect(
    useCallback(() => {
      loadBusinessInfo();
    }, [loadBusinessInfo]),
  );

  const handleSave = async () => {
    if (saving) {
      return;
    }

    if (!token) {
      promptLogin(navigation);
      return;
    }

    const changedFields = (
      Object.keys(form) as Array<keyof BusinessForm>
    ).filter(k => form[k] !== serverForm[k]);

    if (changedFields.length === 0) {
      return;
    }

    const payload: Record<string, string> = {};
    for (const key of changedFields) {
      payload[key] = form[key];
    }

    setSaving(true);
    try {
      await api.profile.business.update(payload);

      // Fetch fresh data from server instead of relying on local state
      const freshResponse = await api.profile.business.get();
      const freshData = unwrapApiData(freshResponse) ?? {};
      const freshProfile = freshData.profile ?? freshData;
      const freshForm: BusinessForm = {
        business_name: String(
          freshProfile.business_name ?? freshProfile.businessName ?? '',
        ),
        business_type: String(
          freshProfile.business_type ?? freshProfile.businessType ?? '',
        ),
        business_registration_number: String(
          freshProfile.business_registration_number ??
            freshProfile.businessRegistrationNumber ??
            '',
        ),
        primary_crop: String(
          freshProfile.primary_crop ?? freshProfile.primaryCrop ?? '',
        ),
        farm_location: String(
          freshProfile.farm_location ??
            freshProfile.farmLocation ??
            freshProfile.city ??
            '',
        ),
        farm_size: String(
          freshProfile.farm_size ?? freshProfile.farmSize ?? '',
        ),
      };

      dispatch(
        updateUser({
          city: freshForm.farm_location,
          profile: {
            ...(user?.profile ?? {}),
            business_name: freshForm.business_name,
            business_type: freshForm.business_type,
            business_registration_number:
              freshForm.business_registration_number,
            primary_crop: freshForm.primary_crop,
            farm_size: freshForm.farm_size,
          },
        }),
      );

      setForm(freshForm);
      setServerForm(freshForm);
      setSaved(true);
    } catch (error) {
      console.error('BusinessProfileScreen: Save failed:', error);
      showAlert('error', 'Update Failed', 'Please check your details and try again.');
    } finally {
      setSaving(false);
    }
  };

  const fields: BusinessField[] = [
    {
      labelKey: 'business.businessName',
      value: form.business_name,
      onChangeText: setField('business_name'),
      keyboardType: 'default',
      placeholderKey: 'business.placeholderBusinessName',
      icon: 'business',
    },
    {
      labelKey: 'business.businessType',
      value: form.business_type,
      onChangeText: setField('business_type'),
      keyboardType: 'default',
      placeholderKey: 'business.placeholderBusinessType',
      icon: 'businessType',
    },
    {
      labelKey: 'business.registrationNo',
      value: form.business_registration_number,
      onChangeText: setField('business_registration_number'),
      keyboardType: 'default',
      placeholderKey: 'business.placeholderRegistrationNo',
      icon: 'registration',
    },
    {
      labelKey: 'business.primaryCrop',
      value: form.primary_crop,
      onChangeText: setField('primary_crop'),
      keyboardType: 'default',
      placeholderKey: 'business.placeholderPrimaryCrop',
      icon: 'crop',
    },
    {
      labelKey: 'business.farmLocation',
      value: form.farm_location,
      onChangeText: setField('farm_location'),
      keyboardType: 'default',
      placeholderKey: 'business.placeholderFarmLocation',
      icon: 'profileCity',
    },
    {
      labelKey: 'business.farmSize',
      value: form.farm_size,
      onChangeText: setField('farm_size'),
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1A6B34']}
          />
        }
      >
        <View className="px-4 pt-8 pb-10">
          <View className="mb-8 flex-row items-center rounded-[28px] bg-green-900 px-5 py-5 shadow-2xl shadow-green-900/20">
            <View className="h-16 w-16 items-center justify-center rounded-3xl bg-green-700">
              <AppIcon name="business" size={34} color="#FFFFFF" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-white text-xl font-extrabold">
                {form.business_name || t('business.businessName')}
              </Text>
              <Text className="mt-1 text-green-300 text-base font-medium">
                {verified && verifiedAt
                  ? `${t('business.verifiedSeller')} · ${formatDisplayDate(
                      verifiedAt,
                    )}`
                  : verified
                  ? t('business.verifiedSeller')
                  : t('common.pending')}
              </Text>
            </View>
            <View
              className={`flex-row items-center rounded-full px-3 py-1.5 ${
                verified ? 'bg-green-50' : 'bg-yellow-100'
              }`}
            >
              <View className="mr-2">
                <AppIcon
                  name={verified ? 'approved' : 'shield'}
                  size={14}
                  color={verified ? '#2E9E52' : '#A14E14'}
                />
              </View>
              <Text
                className={`text-base font-extrabold ${
                  verified ? 'text-green-700' : 'text-yellow-800'
                }`}
              >
                {verified ? t('common.approved') : t('common.pending')}
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
            onPress={handleSave}
            disabled={saving}
            className={`mt-8 h-16 items-center justify-center rounded-3xl bg-green-700 shadow-2xl shadow-green-900/20 ${
              saving ? 'opacity-60' : ''
            }`}
            activeOpacity={0.88}
          >
            <Text className="text-white text-xl font-extrabold">
              {saved ? t('common.profileUpdated') : t('common.updateProfile')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AppLoader
        visible={saving || loading}
        overlay
        message={saving ? t('common.updating') : t('common.loading')}
      />
    </KeyboardAvoidingView>
  );
};

export default BusinessProfileScreen;
