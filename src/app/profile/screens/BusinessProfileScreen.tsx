import React, { useEffect, useState } from 'react';
import {
  Alert,
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
import { useAppDispatch, useAppSelector } from '../../../store';
import { updateUser } from '../../../store/slices/authSlice';
import { AppLoader } from '../../components';
import api from '../../../utils/api';
import {
  firstString,
  formatDisplayDate,
  toBoolean,
  unwrapApiData,
} from '../utils/profileApi';

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
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const [bizName, setBizName] = useState(user?.profile?.business_name ?? '');
  const [bizType, setBizType] = useState(user?.profile?.business_type ?? '');
  const [registration, setRegistration] = useState(
    user?.profile?.business_registration_number ?? '',
  );
  const [crop, setCrop] = useState(user?.profile?.primary_crop ?? '');
  const [location, setLocation] = useState(user?.city ?? '');
  const [farmSize, setFarmSize] = useState(user?.profile?.farm_size ?? '');
  const [verified, setVerified] = useState(user?.is_verified ?? false);
  const [verifiedAt, setVerifiedAt] = useState(user?.verified_at ?? '');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let mounted = true;

    const applyBusinessProfile = (response: any) => {
      const payload = unwrapApiData(response);
      const business = payload?.business ?? payload?.profile ?? payload;
      const responseUser = payload?.user ?? payload;

      if (!mounted) {
        return;
      }

      setBizName(
        firstString(
          business?.business_name,
          business?.businessName,
          responseUser?.profile?.business_name,
        ),
      );
      setBizType(
        firstString(
          business?.business_type,
          business?.businessType,
          responseUser?.profile?.business_type,
        ),
      );
      setRegistration(
        firstString(
          business?.business_registration_number,
          business?.registration_number,
          business?.registrationNo,
          responseUser?.profile?.business_registration_number,
        ),
      );
      setCrop(
        firstString(
          business?.primary_crop,
          business?.primaryCrop,
          responseUser?.profile?.primary_crop,
        ),
      );
      setLocation(
        firstString(
          business?.farm_location,
          business?.farmLocation,
          business?.location,
          responseUser?.city,
        ),
      );
      setFarmSize(
        firstString(
          business?.farm_size,
          business?.farmSize,
          responseUser?.profile?.farm_size,
        ),
      );
      setVerified(
        toBoolean(
          business?.is_verified ?? responseUser?.is_verified,
          user?.is_verified ?? false,
        ),
      );
      setVerifiedAt(
        firstString(business?.verified_at, responseUser?.verified_at),
      );
    };

    const loadBusinessProfile = async () => {
      setLoading(true);
      try {
        const response = await api.profile.business.get();
        applyBusinessProfile(response);
      } catch {
        if (user) {
          applyBusinessProfile({ user, profile: user.profile });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadBusinessProfile().catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, [user]);

  const handleSave = async () => {
    if (saving) {
      return;
    }

    setSaving(true);
    try {
      const payload = {
        business_name: bizName,
        business_type: bizType,
        business_registration_number: registration,
        primary_crop: crop,
        farm_location: location,
        farm_size: farmSize,
      };
      const response = await api.profile.business.update(payload);
      const responsePayload = unwrapApiData(response);

      dispatch(
        updateUser({
          ...(responsePayload?.user ?? {}),
          city: firstString(responsePayload?.user?.city, user?.city),
          profile: {
            ...(user?.profile ?? {}),
            ...(responsePayload?.profile ??
              responsePayload?.business ??
              responsePayload ??
              {}),
            ...payload,
          },
        }),
      );
      setSaved(true);
    } catch {
      Alert.alert('Update Failed', 'Please check your details and try again.');
    } finally {
      setSaving(false);
    }
  };

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
                {bizName || t('business.businessName')}
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
        visible={loading || saving}
        overlay
        message={saving ? t('common.updating') : t('common.loading')}
      />
    </KeyboardAvoidingView>
  );
};

export default BusinessProfileScreen;
