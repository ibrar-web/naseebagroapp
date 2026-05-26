import React, { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
} from 'react-native';
import SubHeader from '../components/SubHeader';
import { AppIcon } from '../../../assets/icons';
import type { AppIconName } from '../../../assets/icons';
import {
  getLanguageByCode,
  isSupportedLanguage,
  useTranslation,
} from '../../../localization';
import type { LanguageCode } from '../../../localization';
import type { TranslationKey } from '../../../localization';
import { AppLoader } from '../../components';
import api from '../../../utils/api';
import { firstString, toBoolean, unwrapApiData } from '../utils/profileApi';
import { useAppSelector } from '../../../store';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.05,
  shadowRadius: 18,
  elevation: 3,
};

type SettingsRow = {
  icon: AppIconName;
  labelKey: TranslationKey;
  value?: string;
  onPress?: () => void;
};

type SettingsGroup = {
  titleKey: TranslationKey;
  rows: SettingsRow[];
};

const SettingsCard = ({ rows }: { rows: SettingsRow[] }) => (
  <View className="overflow-hidden rounded-[28px] bg-white" style={CARD_SHADOW}>
    {rows.map((row, index) => (
      <TouchableOpacity
        key={row.labelKey}
        onPress={row.onPress}
        className={`flex-row items-center px-6 py-6 ${
          index < rows.length - 1 ? 'border-b border-gray-100' : ''
        }`}
        activeOpacity={0.75}
      >
        <View className="h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
          <AppIcon name={row.icon} size={28} color="#1A6B34" />
        </View>
        <SettingsCardText row={row} />
      </TouchableOpacity>
    ))}
  </View>
);

const SettingsCardText = ({ row }: { row: SettingsRow }) => {
  const { t } = useTranslation();

  return (
    <>
      <Text className="ml-5 flex-1 text-gray-900 text-xl font-extrabold">
        {t(row.labelKey)}
      </Text>
      {row.value ? (
        <Text className="mr-5 text-gray-400 text-lg font-medium">
          {row.value}
        </Text>
      ) : null}
      <AppIcon name="chevronRight" size={28} color="#D1D5DB" />
    </>
  );
};

const AppSettingsScreen = ({ navigation }: any) => {
  const { t, language, setLanguage } = useTranslation();
  const token = useAppSelector(s => s.auth.token);
  const [settings, setSettings] = useState({
    language,
    currency: '',
    biometricLogin: false,
    twoFactor: false,
  });
  const languageRef = useRef<LanguageCode>(language);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const loadSettings = useCallback(
    async (isRefresh = false) => {
      if (!token) {
        setSettings(current => ({
          ...current,
          language: languageRef.current,
          currency: current.currency || 'PKR',
        }));
        return;
      }

      if (!isRefresh) setLoading(true);
      try {
        const response = await api.profile.appSettings.get();
        const payload = unwrapApiData(response);
        const data = payload?.settings ?? payload?.app_settings ?? payload;
        const apiLanguage = firstString(data?.language);
        const nextLanguage = isSupportedLanguage(apiLanguage)
          ? apiLanguage
          : undefined;

        // Only update language from API if it returns a valid, different value
        const resolvedLanguage = nextLanguage ?? languageRef.current;
        if (resolvedLanguage !== languageRef.current) {
          languageRef.current = resolvedLanguage;
          setLanguage(resolvedLanguage);
        }

        setSettings({
          language: resolvedLanguage,
          currency: firstString(data?.currency),
          biometricLogin: toBoolean(data?.biometric_login_enabled),
          twoFactor: toBoolean(data?.two_factor_enabled),
        });
      } catch (error) {
        console.error('AppSettingsScreen: Failed to load settings:', error);
      } finally {
        if (!isRefresh) setLoading(false);
      }
    },
    [setLanguage, token],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadSettings(true);
    } finally {
      setRefreshing(false);
    }
  }, [loadSettings]);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [loadSettings]),
  );

  const updateSettings = async (
    payload: Record<string, any>,
    applyLocalChange: () => void,
    rollback: () => void,
  ) => {
    if (updating) {
      return;
    }

    applyLocalChange();

    if (!token) {
      return;
    }

    setUpdating(true);
    try {
      await api.profile.appSettings.update(payload);
    } catch (error) {
      console.error('AppSettingsScreen: Update failed:', error);
      rollback();
    } finally {
      setUpdating(false);
    }
  };

  const toggleLanguage = () => {
    const nextLanguage: LanguageCode = settings.language === 'en' ? 'ur' : 'en';
    const previousLanguage = settings.language;

    updateSettings(
      { language: nextLanguage },
      () => {
        languageRef.current = nextLanguage;
        setSettings(current => ({ ...current, language: nextLanguage }));
        setLanguage(nextLanguage);
      },
      () => {
        languageRef.current = previousLanguage;
        setSettings(current => ({ ...current, language: previousLanguage }));
        setLanguage(previousLanguage);
      },
    ).catch(() => undefined);
  };

  const toggleBiometric = () => {
    const nextValue = !settings.biometricLogin;

    updateSettings(
      { biometric_login_enabled: nextValue },
      () =>
        setSettings(current => ({
          ...current,
          biometricLogin: nextValue,
        })),
      () =>
        setSettings(current => ({
          ...current,
          biometricLogin: !nextValue,
        })),
    ).catch(() => undefined);
  };

  const toggleTwoFactor = () => {
    const nextValue = !settings.twoFactor;

    updateSettings(
      { two_factor_enabled: nextValue },
      () =>
        setSettings(current => ({
          ...current,
          twoFactor: nextValue,
        })),
      () =>
        setSettings(current => ({
          ...current,
          twoFactor: !nextValue,
        })),
    ).catch(() => undefined);
  };

  const handleSelectCurrency = (currency: string) => {
    const previousCurrency = settings.currency;

    updateSettings(
      { currency },
      () => {
        setSettings(current => ({ ...current, currency }));
        setShowCurrencyPicker(false);
      },
      () => {
        setSettings(current => ({ ...current, currency: previousCurrency }));
      },
    ).catch(() => undefined);
  };

  const groups: SettingsGroup[] = [
    {
      titleKey: 'appSettings.display',
      rows: [
        {
          icon: 'language',
          labelKey: 'appSettings.language',
          value: getLanguageByCode(settings.language).nativeLabel,
          onPress: toggleLanguage,
        },
        {
          icon: 'currency',
          labelKey: 'appSettings.currency',
          value: settings.currency || t('common.currencyValue'),
          onPress: () => setShowCurrencyPicker(true),
        },
      ],
    },
    {
      titleKey: 'appSettings.security',
      rows: [
        { icon: 'pin', labelKey: 'appSettings.changePin' },
        {
          icon: 'biometric',
          labelKey: 'appSettings.biometricLogin',
          value: settings.biometricLogin ? t('common.on') : t('common.off'),
          onPress: toggleBiometric,
        },
        {
          icon: 'twoFactor',
          labelKey: 'appSettings.twoFactorAuth',
          value: settings.twoFactor
            ? t('common.enabled')
            : t('common.disabled'),
          onPress: toggleTwoFactor,
        },
      ],
    },
    {
      titleKey: 'appSettings.data',
      rows: [
        {
          icon: 'cache',
          labelKey: 'appSettings.clearCache',
          value: t('common.cacheValue'),
        },
        {
          icon: 'version',
          labelKey: 'appSettings.appVersion',
          value: t('common.versionValue'),
        },
      ],
    },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      <SubHeader title={t('appSettings.title')} navigation={navigation} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1A6B34']}
          />
        }
      >
        {groups.map(group => (
          <View key={group.titleKey} className="mb-8">
            <Text className="mb-4 px-2 text-gray-400 text-xl font-extrabold uppercase tracking-widest">
              {t(group.titleKey)}
            </Text>
            <SettingsCard rows={group.rows} />
          </View>
        ))}
      </ScrollView>
      <AppLoader
        visible={loading || updating}
        overlay
        message={updating ? t('common.updating') : t('common.loading')}
      />

      <Modal
        visible={showCurrencyPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCurrencyPicker(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="rounded-t-[28px] bg-white px-6 pb-10 pt-6">
            <Text className="mb-6 text-gray-900 text-xl font-extrabold">
              {t('appSettings.selectCurrency')}
            </Text>
            {['PKR', 'USD'].map(currency => (
              <TouchableOpacity
                key={currency}
                onPress={() => handleSelectCurrency(currency)}
                className={`mb-3 rounded-2xl px-5 py-4 ${
                  settings.currency === currency ? 'bg-green-50' : 'bg-gray-50'
                }`}
                activeOpacity={0.75}
              >
                <Text
                  className={`text-lg font-extrabold ${
                    settings.currency === currency
                      ? 'text-green-700'
                      : 'text-gray-900'
                  }`}
                >
                  {currency === 'PKR'
                    ? t('appSettings.pkr')
                    : t('appSettings.usd')}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setShowCurrencyPicker(false)}
              className="mt-2 rounded-2xl border border-gray-200 py-4"
              activeOpacity={0.75}
            >
              <Text className="text-center text-gray-500 text-lg font-extrabold">
                {t('appSettings.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AppSettingsScreen;
