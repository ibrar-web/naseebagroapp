import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
  RefreshControl,
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
import { unwrapApiData } from '../utils/profileApi';
import { promptLogin } from '../../auth/utils/requireLogin';

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
  const token = useAppSelector(s => s.auth.token);

  const [form, setForm] = useState<PersonalForm>({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    date_of_birth: '',
    cnic: '',
    profile_picture: '',
  });
  const [serverForm, setServerForm] = useState<PersonalForm>(form);
  const [selectedPhoto, setSelectedPhoto] = useState<SelectedImage | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [imageError, setImageError] = useState(false);

  const setField =
    <K extends keyof PersonalForm>(key: K) =>
    (v: string) => {
      setForm(f => ({ ...f, [key]: v }));
      setSaved(false);
    };

  const loadPersonalInfo = useCallback(
    async (isRefresh = false) => {
      if (!token) {
        return;
      }

      if (!isRefresh) setLoading(true);
      try {
        const response = await api.profile.personal.get();
        const data = unwrapApiData(response) ?? {};
        const personal = data.user ?? data.profile ?? data;
        const loaded: PersonalForm = {
          fullName: String(personal.full_name ?? personal.fullName ?? ''),
          email: String(personal.email ?? ''),
          phone: String(personal.phone ?? ''),
          city: String(personal.city ?? ''),
          date_of_birth: String(
            personal.date_of_birth ?? personal.dateOfBirth ?? '',
          ),
          cnic: String(personal.cnic ?? personal.profile?.cnic ?? ''),
          profile_picture: String(
            personal.profile_picture ?? personal.profilePicture ?? '',
          ),
        };
        setForm(loaded);
        setServerForm(loaded);
        setImageError(false);
      } catch (error) {
        console.error(
          'PersonalInfoScreen: Failed to load personal info:',
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
      await loadPersonalInfo(true);
    } finally {
      setRefreshing(false);
    }
  }, [loadPersonalInfo]);

  useFocusEffect(
    useCallback(() => {
      loadPersonalInfo();
    }, [loadPersonalInfo]),
  );

  const handlePickPhoto = () => {
    if (!token) {
      promptLogin(navigation);
      return;
    }

    pickProfileImage(image => {
      setSelectedPhoto(image);
      setField('profile_picture')(image.uri);
      setImageError(false);
    });
  };

  const handleSave = async () => {
    if (saving) {
      return;
    }

    if (!token) {
      promptLogin(navigation);
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

    const changedFields = textKeys.filter(k => form[k] !== serverForm[k]);
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

      // Fetch fresh data from server instead of relying on local state
      const freshResponse = await api.profile.personal.get();
      const freshData = unwrapApiData(freshResponse) ?? {};
      const freshPersonal = freshData.user ?? freshData.profile ?? freshData;
      const freshForm: PersonalForm = {
        fullName: String(
          freshPersonal.full_name ?? freshPersonal.fullName ?? '',
        ),
        email: String(freshPersonal.email ?? ''),
        phone: String(freshPersonal.phone ?? ''),
        city: String(freshPersonal.city ?? ''),
        date_of_birth: String(
          freshPersonal.date_of_birth ?? freshPersonal.dateOfBirth ?? '',
        ),
        cnic: String(freshPersonal.cnic ?? freshPersonal.profile?.cnic ?? ''),
        profile_picture: String(
          freshPersonal.profile_picture ?? freshPersonal.profilePicture ?? '',
        ),
      };

      const storeUpdate: Parameters<typeof updateUser>[0] = {};
      if (freshForm.fullName) storeUpdate.fullName = freshForm.fullName;
      if (freshForm.email) storeUpdate.email = freshForm.email;
      if (freshForm.phone) storeUpdate.phone = freshForm.phone;
      if (freshForm.city) storeUpdate.city = freshForm.city;
      if (freshForm.date_of_birth)
        storeUpdate.date_of_birth = freshForm.date_of_birth;
      if (freshForm.cnic) {
        storeUpdate.profile = {
          ...(user?.profile ?? {}),
          cnic: freshForm.cnic,
        };
      }
      if (freshForm.profile_picture) {
        storeUpdate.profile_picture = freshForm.profile_picture;
      }

      dispatch(updateUser(storeUpdate));
      setForm(freshForm);
      setServerForm(freshForm);
      setSelectedPhoto(null);
      setImageError(false);
      setSaved(true);
    } catch (error) {
      console.error('PersonalInfoScreen: Save failed:', error);
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1A6B34']}
          />
        }
      >
        <View className="px-4 pt-6 pb-10">
          <View className="items-center pb-10">
            <TouchableOpacity
              onPress={handlePickPhoto}
              className="h-24 w-24 items-center justify-center rounded-[28px] border-4 border-white bg-orange-500 shadow-2xl shadow-black/10"
              activeOpacity={0.85}
            >
              {form.profile_picture && !imageError ? (
                <Image
                  source={{ uri: form.profile_picture }}
                  style={styles.avatar}
                  resizeMode="cover"
                  onError={() => setImageError(true)}
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
        visible={saving || loading}
        overlay
        message={saving ? t('common.updating') : t('common.loading')}
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
