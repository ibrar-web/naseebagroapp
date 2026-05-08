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
import { AppIcon } from '../../../assets/icons';
import GreenHeader from '../components/GreenHeader';
import StepDots from '../components/StepDots';

type Props = NativeStackScreenProps<RootStackParamList, 'IdVerify'>;

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 3,
} as const;

const IdVerifyScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const [cnic, setCnic] = useState('');
  const [frontUploaded, setFrontUploaded] = useState(false);
  const [backUploaded, setBackUploaded] = useState(false);

  const canContinue = cnic.length >= 13 && frontUploaded && backUploaded;

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
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-2xl p-4 mb-4 gap-4" style={CARD_SHADOW}>
          {/* CNIC input */}
          <View>
            <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              {t('auth.cnicNumber')}
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 text-gray-900 text-base"
              style={{ paddingVertical: 12 }}
              placeholder={t('auth.cnicPlaceholder')}
              placeholderTextColor="#9CA3AF"
              value={cnic}
              onChangeText={setCnic}
              keyboardType="numbers-and-punctuation"
              maxLength={15}
            />
          </View>

          {/* Upload boxes */}
          {[
            { label: t('auth.cnicFront'), uploaded: frontUploaded, onPress: () => setFrontUploaded(true) },
            { label: t('auth.cnicBack'), uploaded: backUploaded, onPress: () => setBackUploaded(true) },
          ].map(box => (
            <View key={box.label}>
              <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                {box.label}
              </Text>
              <TouchableOpacity
                onPress={box.onPress}
                className={`rounded-2xl items-center justify-center gap-2 py-7 ${
                  box.uploaded ? 'bg-green-50' : 'bg-gray-50'
                }`}
                style={{
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  borderColor: box.uploaded ? '#1A6B34' : '#D1D5DB',
                }}
                activeOpacity={0.8}
              >
                {box.uploaded ? (
                  <>
                    <Text style={{ fontSize: 28 }}>✅</Text>
                    <Text className="text-green-700 text-sm font-bold">Uploaded</Text>
                  </>
                ) : (
                  <>
                    <AppIcon name="upload" size={28} color="#9CA3AF" />
                    <Text className="text-gray-400 text-sm font-medium">
                      {t('auth.uploadPhoto')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ))}
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

export default IdVerifyScreen;
