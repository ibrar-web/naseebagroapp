import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import SubHeader from '../components/SubHeader';
import { AppIcon } from '../../../assets/icons';
import type { AppIconName } from '../../../assets/icons';
import { useTranslation } from '../../../localization';
import type { TranslationKey } from '../../../localization';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07,
  shadowRadius: 12,
  elevation: 3,
};

const FAQS: { qKey: TranslationKey; aKey: TranslationKey }[] = [
  { qKey: 'support.qPostDemand', aKey: 'support.aPostDemand' },
  { qKey: 'support.qPayments', aKey: 'support.aPayments' },
  { qKey: 'support.qKyc', aKey: 'support.aKyc' },
  { qKey: 'support.qCancelDeal', aKey: 'support.aCancelDeal' },
  { qKey: 'support.qTrackShipment', aKey: 'support.aTrackShipment' },
];

const CONTACT = [
  {
    icon: 'contactWhatsapp' as AppIconName,
    labelKey: 'support.whatsapp' as TranslationKey,
    sub: '+92 311 123 4567',
    color: '#25D366',
  },
  {
    icon: 'contactEmail' as AppIconName,
    labelKey: 'support.email' as TranslationKey,
    sub: 'support@naseeb.pk',
    color: '#1A6B34',
  },
  {
    icon: 'contactPhone' as AppIconName,
    labelKey: 'support.helpline' as TranslationKey,
    sub: '0800-12345',
    color: '#3B82F6',
  },
];

const SupportScreen = ({ navigation }: any) => {
  const [open, setOpen] = useState<number | null>(null);
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-gray-50">
      <SubHeader
        title={t('support.title')}
        subtitle={t('support.subtitle')}
        navigation={navigation}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-3">
          {t('support.contactUs')}
        </Text>

        <View className="flex-row gap-3 mb-4">
          {CONTACT.map(c => (
            <TouchableOpacity
              key={c.labelKey}
              className="flex-1 bg-white rounded-2xl py-4 items-center gap-2"
              style={CARD_SHADOW}
              activeOpacity={0.85}
            >
              <AppIcon name={c.icon} size={26} color={c.color} />
              <Text className="text-gray-900 text-xs font-bold">
                {t(c.labelKey)}
              </Text>
              <Text className="text-gray-400 text-xs text-center">{c.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-3">
          {t('support.faq')}
        </Text>

        <View
          className="bg-white rounded-2xl overflow-hidden"
          style={CARD_SHADOW}
        >
          {FAQS.map((faq, idx) => (
            <View
              key={idx}
              className={
                idx < FAQS.length - 1 ? 'border-b border-gray-100' : ''
              }
            >
              <TouchableOpacity
                onPress={() => setOpen(open === idx ? null : idx)}
                className="flex-row items-center px-4 py-4 gap-3"
                activeOpacity={0.7}
              >
                <View className="w-8 h-8 rounded-lg bg-green-50 items-center justify-center">
                  <AppIcon name="faq" size={16} color="#1A6B34" />
                </View>
                <Text className="flex-1 text-gray-800 text-sm font-semibold">
                  {t(faq.qKey)}
                </Text>
                <AppIcon
                  name={open === idx ? 'chevronDown' : 'chevronRight'}
                  size={18}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
              {open === idx && (
                <View className="px-4 pb-4" style={{ paddingLeft: 60 }}>
                  <Text className="text-gray-600 text-sm leading-5">
                    {t(faq.aKey)}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default SupportScreen;
