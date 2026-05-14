import React, { useEffect, useState } from 'react';
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
import { firstString, unwrapApiData } from '../utils/profileApi';

type InfoField = {
  labelKey: TranslationKey;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  keyboardType?: KeyboardTypeOptions;
  placeholderKey: TranslationKey;
  icon: AppIconName;
};

type SelectedImage = {
  uri: string;
  name: string;
  type: string;
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
          onChangeText={field.setValue}
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
  console.log(user);
  const [name, setName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [dob, setDob] = useState(user?.date_of_birth ?? '');
  const [cnic, setCnic] = useState(user?.profile?.cnic ?? '');
  const [profilePhotoUri, setProfilePhotoUri] = useState(
    user?.profile_picture ?? '',
  );
  const [selectedPhoto, setSelectedPhoto] = useState<SelectedImage | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let mounted = true;

    const applyPersonalProfile = (response: any) => {
      const payload = unwrapApiData(response);
      const userData = payload?.user ?? payload;
      const profileData =
        payload?.profile ?? userData?.profile ?? payload?.personal_profile;

      if (!mounted) {
        return;
      }

      setName(
        firstString(userData?.fullName, userData?.full_name, userData?.name),
      );
      setEmail(firstString(userData?.email));
      setPhone(firstString(userData?.phone));
      setCity(firstString(userData?.city));
      setDob(firstString(userData?.date_of_birth, userData?.dob));
      setCnic(firstString(profileData?.cnic, userData?.cnic));
      setProfilePhotoUri(
        firstString(
          userData?.profile_picture_url,
          userData?.profile_picture,
          payload?.profile_picture_url,
          payload?.profile_picture,
        ),
      );
    };

    const loadPersonalProfile = async () => {
      setLoading(true);
      try {
        const response = await api.profile.personal.get();
        applyPersonalProfile(response);
      } catch {
        if (user) {
          applyPersonalProfile({ user });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadPersonalProfile().catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, [user]);

  const handlePickPhoto = () =>
    pickProfileImage(image => {
      setSelectedPhoto(image);
      setProfilePhotoUri(image.uri);
      setSaved(false);
    });

  const handleSave = async () => {
    if (saving) {
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('fullName', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('city', city);
      formData.append('date_of_birth', dob);
      formData.append('cnic', cnic);

      if (selectedPhoto) {
        formData.append('profile_picture', {
          uri: selectedPhoto.uri,
          name: selectedPhoto.name,
          type: selectedPhoto.type,
        } as any);
      }

      const response = await api.profile.personal.updateForm(formData);
      const payload = unwrapApiData(response);
      const responseUser = payload?.user ?? payload;

      dispatch(
        updateUser({
          ...responseUser,
          fullName: firstString(responseUser?.fullName, name),
          email: firstString(responseUser?.email, email),
          phone: firstString(responseUser?.phone, phone),
          city: firstString(responseUser?.city, city),
          date_of_birth: firstString(responseUser?.date_of_birth, dob),
          profile_picture: firstString(
            responseUser?.profile_picture,
            responseUser?.profile_picture_url,
            profilePhotoUri,
          ),
          profile: {
            ...(user?.profile ?? {}),
            ...(responseUser?.profile ?? payload?.profile ?? {}),
            cnic,
          },
        }),
      );
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
      value: name,
      setValue: setName,
      keyboardType: 'default',
      placeholderKey: 'personal.placeholderFullName',
      icon: 'profileName',
    },
    {
      labelKey: 'personal.email',
      value: email,
      setValue: setEmail,
      keyboardType: 'email-address',
      placeholderKey: 'personal.placeholderEmail',
      icon: 'profileEmail',
    },
    {
      labelKey: 'personal.phone',
      value: phone,
      setValue: setPhone,
      keyboardType: 'phone-pad',
      placeholderKey: 'personal.placeholderPhone',
      icon: 'profilePhone',
    },
    {
      labelKey: 'personal.city',
      value: city,
      setValue: setCity,
      keyboardType: 'default',
      placeholderKey: 'personal.placeholderCity',
      icon: 'profileCity',
    },
    {
      labelKey: 'personal.dateOfBirth',
      value: dob,
      setValue: setDob,
      keyboardType: 'default',
      placeholderKey: 'personal.placeholderDateOfBirth',
      icon: 'profileDateOfBirth',
    },
    {
      labelKey: 'personal.cnic',
      value: cnic,
      setValue: setCnic,
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
              {profilePhotoUri ? (
                <Image
                  source={{ uri: profilePhotoUri }}
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
        visible={loading || saving}
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
