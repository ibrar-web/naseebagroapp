import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useTranslation } from '../../../localization';
import { AppIcon } from '../../../assets/icons';
import GreenHeader from '../components/GreenHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'Location'>;

const LocationScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-gray-50">
      <GreenHeader
        step={t('auth.locationStep')}
        title={t('auth.locationTitle')}
        subtitle={t('auth.locationSubtitle')}
        icon="profileCity"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {/* Your Location row */}
        <TouchableOpacity
          onPress={() => navigation.navigate('BasicInfo')}
          className="bg-white rounded-2xl flex-row items-center px-4 gap-3"
          style={styles.locationRow}
          activeOpacity={0.8}
        >
          <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center">
            <AppIcon name="profileCity" size={20} color="#15803d" />
          </View>
          <Text className="flex-1 text-gray-900 text-base font-semibold">
            Your Location
          </Text>
          <Text className="text-gray-400 text-lg">›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('BasicInfo')}
          className="py-3 items-center mt-4"
          activeOpacity={0.7}
        >
          <Text className="text-gray-400 text-sm font-medium">
            {t('auth.locationSkip')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 24 },
  locationRow: {
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
});

export default LocationScreen;
