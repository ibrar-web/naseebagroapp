import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useTranslation } from '../../../localization';
import { AppIcon } from '../../../assets/icons';
import GreenHeader from '../components/GreenHeader';
import StepDots from '../components/StepDots';

type Props = NativeStackScreenProps<RootStackParamList, 'IdVerify'>;

type UploadState = { uri: string; name: string } | null;

const pickImage = (onPick: (uri: string, name: string) => void) => {
  Alert.alert(
    'Select Photo',
    'Choose how to upload your CNIC photo',
    [
      {
        text: 'Camera',
        onPress: () =>
          launchCamera({ mediaType: 'photo', quality: 0.8 }, res => {
            const asset = res.assets?.[0];
            if (asset?.uri) {
              onPick(asset.uri, asset.fileName ?? 'cnic.jpg');
            }
          }),
      },
      {
        text: 'Gallery',
        onPress: () =>
          launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, res => {
            const asset = res.assets?.[0];
            if (asset?.uri) {
              onPick(asset.uri, asset.fileName ?? 'cnic.jpg');
            }
          }),
      },
      { text: 'Cancel', style: 'cancel' },
    ],
  );
};

const IdVerifyScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const [cnic, setCnic] = useState('');
  const [front, setFront] = useState<UploadState>(null);
  const [back, setBack] = useState<UploadState>(null);

  const canContinue = cnic.length >= 13 && front !== null && back !== null;

  const UploadBox = ({
    label,
    data,
    onPress,
  }: {
    label: string;
    data: UploadState;
    onPress: () => void;
  }) => (
    <View>
      <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}
      </Text>
      <TouchableOpacity
        onPress={onPress}
        className={`rounded-2xl overflow-hidden items-center justify-center py-7 gap-2 ${
          data ? 'bg-green-50' : 'bg-gray-50'
        }`}
        style={[
          styles.uploadBox,
          { borderColor: data ? '#1A6B34' : '#D1D5DB' },
        ]}
        activeOpacity={0.8}
      >
        {data ? (
          <>
            <Image
              source={{ uri: data.uri }}
              style={styles.preview}
              resizeMode="cover"
            />
            <View className="flex-row items-center gap-2 mt-2">
              <AppIcon name="approved" size={16} color="#1A6B34" />
              <Text className="text-green-700 text-xs font-bold" numberOfLines={1}>
                {data.name}
              </Text>
            </View>
          </>
        ) : (
          <>
            <AppIcon name="upload" size={28} color="#9CA3AF" />
            <Text className="text-gray-400 text-sm font-medium">
              {t('auth.uploadPhoto')}
            </Text>
            <Text className="text-gray-300 text-xs">Camera or Gallery</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <GreenHeader
        step={t('auth.idVerifyStep')}
        title={t('auth.idVerifyTitle')}
        subtitle={t('auth.idVerifySubtitle')}
        icon="profileCnic"
        onBack={() => navigation.goBack()}
      />

      <StepDots active={2} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-2xl p-4 mb-4 gap-4" style={styles.card}>
          {/* CNIC input */}
          <View>
            <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              {t('auth.cnicNumber')}
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 text-gray-900 text-base"
              style={styles.textInput}
              placeholder={t('auth.cnicPlaceholder')}
              placeholderTextColor="#9CA3AF"
              value={cnic}
              onChangeText={setCnic}
              keyboardType="numbers-and-punctuation"
              maxLength={15}
            />
          </View>

          <UploadBox
            label={t('auth.cnicFront')}
            data={front}
            onPress={() =>
              pickImage((uri, name) => setFront({ uri, name }))
            }
          />
          <UploadBox
            label={t('auth.cnicBack')}
            data={back}
            onPress={() =>
              pickImage((uri, name) => setBack({ uri, name }))
            }
          />
        </View>

        {/* Security note */}
        <View className="flex-row gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
          <AppIcon name="shield" size={18} color="#D97706" />
          <Text className="flex-1 text-amber-700 text-xs leading-5">
            {t('auth.idVerifyNote')}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('PaymentSetup')}
          className={`py-4 rounded-2xl items-center bg-green-700 ${!canContinue ? 'opacity-40' : ''}`}
          disabled={!canContinue}
          style={canContinue ? styles.btnShadow : undefined}
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

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  textInput: { paddingVertical: 12 },
  uploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  preview: { width: '100%', height: 120, borderRadius: 12 },
  btnShadow: {
    shadowColor: '#1A6B34',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default IdVerifyScreen;
