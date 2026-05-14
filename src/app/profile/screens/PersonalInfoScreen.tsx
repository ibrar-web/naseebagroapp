import React, { useState } from 'react';
import {
  Alert,
  Image,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  KeyboardTypeOptions,
  StyleSheet,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import SubHeader from '../components/SubHeader';
import { AppIcon } from '../../../assets/icons';
import type { AppIconName } from '../../../assets/icons';
import { useTranslation } from '../../../localization';
import type { TranslationKey } from '../../../localization';
import { useAppDispatch, useAppSelector } from '../../../store';
import { updateUser } from '../../../store/slices/authSlice';
import { AppLoader } from '../../components';
import api from '../../../utils/api';

type PersonalForm = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  date_of_birth: string;
  cnic: string;
  profile_picture: string;
};

type SelectedImage = {
  uri: string;
  name: string;
  type: string;
};

type InfoField = {
  labelKey: TranslationKey;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: KeyboardTypeOptions;
  placeholderKey: TranslationKey;
  icon: AppIconName;
};

const pickProfileImage = (onPick: (image: SelectedImage) => void) => {
  const handleAsset = (asset?: {
    uri?: string;
    fileName?: string;
    type?: string;
  }) => {
    if (!asset?.uri) {
      return;
    }

    onPick({
      uri: asset.uri,
      name: asset.fileName ?? 'profile.jpg',
      type: asset.type ?? 'image/jpeg',
    });
  };

  Alert.alert('Select Photo', 'Choose a new profile photo', [
    {
      text: 'Camera',
      onPress: () =>
        launchCamera({ mediaType: 'photo', quality: 0.8 }, response =>
          handleAsset(response.assets?.[0]),
        ),
    },
    {
      text: 'Gallery',
      onPress: () =>
        launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, response =>
          handleAsset(response.assets?.[0]),
        ),
    },
    { text: 'Cancel', style: 'cancel' },
  ]);
};

const InfoRow = ({ field, isLast }: { field: InfoField; isLast: boolean }) => {
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
        <AppIcon name="edit" size={16} color="#D1D5DB" />
      </View>
    </View>
  );
};

const PersonalInfoScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);

  const initial: PersonalForm = {
    fullName: user?.fullName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    city: user?.city ?? '',
    date_of_birth: user?.date_of_birth ?? '',
    cnic: user?.profile?.cnic ?? '',
    profile_picture: user?.profile_picture ?? '',
  };

  const [form, setForm] = useState<PersonalForm>(initial);
  const [selectedPhoto, setSelectedPhoto] = useState<SelectedImage | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const setField =
    <K extends keyof PersonalForm>(key: K) =>
    (v: string) => {
      setForm(f => ({ ...f, [key]: v }));
      setSaved(false);
    };

  const handlePickPhoto = () =>
    pickProfileImage(image => {
      setSelectedPhoto(image);
      setField('profile_picture')(image.uri);
    });

  const handleSave = async () => {
    if (saving) {
      return;
    }

    const textKeys: (keyof Omit<PersonalForm, 'profile_picture'>)[] = [
      'fullName',
      'email',
      'phone',
      'city',
      'date_of_birth',
      'cnic',
    ];

    const changedFields = textKeys.filter(k => form[k] !== initial[k]);
    const hasPhotoChange = !!selectedPhoto;

    if (changedFields.length === 0 && !hasPhotoChange) {
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();

      for (const key of changedFields) {
        formData.append(key, form[key]);
      }

      if (hasPhotoChange) {
        formData.append('profile_picture', {
          uri: selectedPhoto!.uri,
          name: selectedPhoto!.name,
          type: selectedPhoto!.type,
        } as any);
      }

      await api.profile.personal.updateForm(formData);

      const storeUpdate: Parameters<typeof updateUser>[0] = {};

      for (const key of changedFields) {
        if (key === 'cnic') {
          storeUpdate.profile = { ...(user?.profile ?? {}), cnic: form.cnic };
        } else {
          (storeUpdate as any)[key] = form[key];
        }
      }

      if (hasPhotoChange) {
        storeUpdate.profile_picture = form.profile_picture;
      }

      dispatch(updateUser(storeUpdate));
      setSelectedPhoto(null);
      setSaved(true);
    } catch {
      Alert.alert('Update Failed', 'Please check your details and try again.');
    } finally {
      setSaving(false);
    }
  };

  const fields: InfoField[] = [
    {
      labelKey: 'personal.fullName',
      value: form.fullName,
      onChangeText: setField('fullName'),
      keyboardType: 'default',
      placeholderKey: 'personal.placeholderFullName',
      icon: 'profileName',
    },
    {
      labelKey: 'personal.email',
      value: form.email,
      onChangeText: setField('email'),
      keyboardType: 'email-address',
      placeholderKey: 'personal.placeholderEmail',
      icon: 'profileEmail',
    },
    {
      labelKey: 'personal.phone',
      value: form.phone,
      onChangeText: setField('phone'),
      keyboardType: 'phone-pad',
      placeholderKey: 'personal.placeholderPhone',
      icon: 'profilePhone',
    },
    {
      labelKey: 'personal.city',
      value: form.city,
      onChangeText: setField('city'),
      keyboardType: 'default',
      placeholderKey: 'personal.placeholderCity',
      icon: 'profileCity',
    },
    {
      labelKey: 'personal.dateOfBirth',
      value: form.date_of_birth,
      onChangeText: setField('date_of_birth'),
      keyboardType: 'default',
      placeholderKey: 'personal.placeholderDateOfBirth',
      icon: 'profileDateOfBirth',
    },
    {
      labelKey: 'personal.cnic',
      value: form.cnic,
      onChangeText: setField('cnic'),
      keyboardType: 'default',
      placeholderKey: 'personal.placeholderCnic',
      icon: 'profileCnic',
    },
  ];

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SubHeader title={t('personal.title')} navigation={navigation} />

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 pt-6 pb-10">
          <View className="items-center pb-10">
            <TouchableOpacity
              onPress={handlePickPhoto}
              className="h-24 w-24 items-center justify-center rounded-[28px] border-4 border-white bg-orange-500 shadow-2xl shadow-black/10"
              activeOpacity={0.85}
            >
              {form.profile_picture ? (
                <Image
                  source={{ uri: form.profile_picture }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              ) : (
                <AppIcon name="profileAvatar" size={44} color="#FFFFFF" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePickPhoto}
              className="mt-5"
              activeOpacity={0.7}
            >
              <Text className="text-green-700 text-lg font-extrabold">
                {t('personal.changePhoto')}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-black/5">
            {fields.map((field, index) => (
              <InfoRow
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
              {saved ? t('common.saved') : t('common.saveChanges')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AppLoader
        visible={saving}
        overlay
        message={t('common.updating')}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
});

export default PersonalInfoScreen;
