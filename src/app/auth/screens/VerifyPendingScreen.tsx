import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useTranslation } from '../../../localization';
import { AppIcon } from '../../../assets/icons';

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyPending'>;

const STATUS_ROWS = [
  { icon: 'profileCnic', titleKey: 'auth.verifyPendingId' },
  { icon: 'business', titleKey: 'auth.verifyPendingBiz' },
  { icon: 'bank', titleKey: 'auth.verifyPendingPayment' },
] as const;

const VerifyPendingScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Back header */}
      <View className="bg-gray-50 px-5 pt-12 pb-2 flex-row items-center">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-xl bg-white items-center justify-center"
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <AppIcon name="back" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon */}
        <View className="items-center mb-8">
          <View
            className="w-24 h-24 rounded-full bg-amber-50 items-center justify-center mb-5"
            style={styles.pendingCircle}
          >
            <Text style={styles.hourglassEmoji}>⏳</Text>
          </View>
          <Text className="text-gray-900 text-2xl font-extrabold text-center">
            {t('auth.verifyPendingTitle')}
          </Text>
          <Text className="text-gray-500 text-sm text-center mt-2 leading-5 px-4">
            {t('auth.verifyPendingSubtitle')}
          </Text>
        </View>

        {/* Status rows */}
        <View className="bg-white rounded-2xl overflow-hidden mb-6" style={styles.card}>
          {STATUS_ROWS.map((row, idx) => (
            <View
              key={row.titleKey}
              className={`flex-row items-center px-4 py-4 gap-4 ${
                idx < STATUS_ROWS.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <View className="w-10 h-10 rounded-xl bg-amber-50 items-center justify-center">
                <AppIcon name={row.icon} size={18} color="#D97706" />
              </View>
              <Text className="flex-1 text-gray-800 text-sm font-semibold">
                {t(row.titleKey)}
              </Text>
              <View className="px-3 py-1 rounded-full" style={styles.pendingBadge}>
                <Text className="text-xs font-bold" style={styles.pendingText}>
                  {t('auth.verifyPendingStatus')}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Estimated time */}
        <View className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex-row gap-3 mb-8">
          <Text style={styles.clockEmoji}>🕐</Text>
          <Text className="flex-1 text-blue-700 text-sm leading-5">
            Verification typically takes 24–48 hours. You will receive a notification once approved.
          </Text>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          onPress={() => navigation.navigate('MainTabs')}
          className="py-4 rounded-2xl items-center bg-green-700 mb-3"
          style={styles.primaryBtn}
          activeOpacity={0.88}
        >
          <Text className="text-white text-base font-bold">
            {t('auth.previewHome')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Support')}
          className="py-4 rounded-2xl items-center border-2 border-green-700"
          activeOpacity={0.88}
        >
          <Text className="text-green-700 text-base font-bold">
            {t('auth.contactSupport')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingBottom: 48 },
  backBtn: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  pendingCircle: {
    borderWidth: 3,
    borderColor: '#FEF3C7',
  },
  hourglassEmoji: { fontSize: 44 },
  clockEmoji: { fontSize: 18 },
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  pendingBadge: { backgroundColor: '#FEF3C7' },
  pendingText: { color: '#D97706' },
  primaryBtn: {
    shadowColor: '#1A6B34',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default VerifyPendingScreen;
