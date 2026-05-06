import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import SubHeader from '../components/SubHeader';
import { AppIcon } from '../../../assets/icons';
import { useTranslation } from '../../../localization';
import type { TranslationKey } from '../../../localization';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07,
  shadowRadius: 12,
  elevation: 3,
};

const SECTIONS: { titleKey: TranslationKey; bodyKey: TranslationKey }[] = [
  { titleKey: 'terms.acceptanceTitle', bodyKey: 'terms.acceptanceBody' },
  { titleKey: 'terms.accountsTitle', bodyKey: 'terms.accountsBody' },
  { titleKey: 'terms.listingsTitle', bodyKey: 'terms.listingsBody' },
  { titleKey: 'terms.paymentTitle', bodyKey: 'terms.paymentBody' },
  { titleKey: 'terms.disputeTitle', bodyKey: 'terms.disputeBody' },
  { titleKey: 'terms.privacyTitle', bodyKey: 'terms.privacyBody' },
  { titleKey: 'terms.liabilityTitle', bodyKey: 'terms.liabilityBody' },
];

const TermsScreen = ({ navigation }: any) => {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-gray-50">
      <SubHeader
        title={t('terms.title')}
        subtitle={t('terms.subtitle')}
        navigation={navigation}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <View
          className="bg-green-700 rounded-2xl p-5 mb-4"
          style={{
            shadowColor: '#1A6B34',
            shadowOpacity: 0.2,
            shadowRadius: 10,
            elevation: 4,
          }}
        >
          <AppIcon name="legal" size={32} color="#FFFFFF" />
          <Text className="text-white text-lg font-extrabold mt-2">
            {t('terms.legalDocuments')}
          </Text>
          <Text className="text-green-200 text-sm mt-1">
            {t('terms.bannerBody')}
          </Text>
        </View>

        {/* Sections */}
        <View
          className="bg-white rounded-2xl overflow-hidden mb-4"
          style={CARD_SHADOW}
        >
          {SECTIONS.map((s, idx) => (
            <View
              key={s.titleKey}
              className={`px-4 py-5 ${
                idx < SECTIONS.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <Text className="text-gray-900 text-sm font-bold mb-2">
                {t(s.titleKey)}
              </Text>
              <Text className="text-gray-600 text-sm leading-5">
                {t(s.bodyKey)}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          className="bg-green-700 rounded-2xl py-4 items-center"
          style={{
            shadowColor: '#1A6B34',
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 4,
          }}
          activeOpacity={0.88}
        >
          <Text className="text-white text-base font-bold">
            {t('terms.agree')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default TermsScreen;
