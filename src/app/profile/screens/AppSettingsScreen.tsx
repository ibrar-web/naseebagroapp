import React, { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  StyleSheet,
} from 'react-native';
import { AppIcon } from '../../../assets/icons';
import type { AppIconName } from '../../../assets/icons';
import {
  getLanguageByCode,
  isSupportedLanguage,
  useTranslation,
} from '../../../localization';
import type { LanguageCode } from '../../../localization';
import type { TranslationKey } from '../../../localization';
import { AppLoader, MockStatusBar } from '../../components';
import api from '../../../utils/api';
import { firstString, toBoolean, unwrapApiData } from '../utils/profileApi';
import { useAppSelector } from '../../../store';

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
        const nextLanguage = isSupportedLanguage(apiLanguage) ? apiLanguage : undefined;
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
      } catch {
        // keep existing state
      } finally {
        if (!isRefresh) setLoading(false);
      }
    },
    [setLanguage, token],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await loadSettings(true); } finally { setRefreshing(false); }
  }, [loadSettings]);

  useFocusEffect(useCallback(() => { loadSettings(); }, [loadSettings]));

  const updateSettings = async (
    payload: Record<string, any>,
    applyLocalChange: () => void,
    rollback: () => void,
  ) => {
    if (updating) return;
    applyLocalChange();
    if (!token) return;
    setUpdating(true);
    try {
      await api.profile.appSettings.update(payload);
    } catch {
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
      () => setSettings(current => ({ ...current, biometricLogin: nextValue })),
      () => setSettings(current => ({ ...current, biometricLogin: !nextValue })),
    ).catch(() => undefined);
  };

  const toggleTwoFactor = () => {
    const nextValue = !settings.twoFactor;
    updateSettings(
      { two_factor_enabled: nextValue },
      () => setSettings(current => ({ ...current, twoFactor: nextValue })),
      () => setSettings(current => ({ ...current, twoFactor: !nextValue })),
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
      () => setSettings(current => ({ ...current, currency: previousCurrency })),
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
          value: settings.twoFactor ? t('common.enabled') : t('common.disabled'),
          onPress: toggleTwoFactor,
        },
      ],
    },
    {
      titleKey: 'appSettings.data',
      rows: [
        { icon: 'cache', labelKey: 'appSettings.clearCache', value: t('common.cacheValue') },
        { icon: 'version', labelKey: 'appSettings.appVersion', value: t('common.versionValue') },
      ],
    },
  ];

  return (
    <View style={s.container}>
      <MockStatusBar backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <AppIcon name="chevronRight" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t('appSettings.title')}</Text>
        <View style={s.headerSpacer} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1A6B34" colors={['#1A6B34']} />
        }
      >
        {groups.map(group => (
          <View key={group.titleKey} style={s.group}>
            <Text style={s.groupLabel}>{t(group.titleKey)}</Text>
            <View style={s.card}>
              {group.rows.map((row, rIdx) => (
                <TouchableOpacity
                  key={row.labelKey}
                  onPress={row.onPress}
                  style={[s.row, rIdx < group.rows.length - 1 && s.rowBorder]}
                  activeOpacity={0.75}
                >
                  <View style={s.iconBox}>
                    <AppIcon name={row.icon} size={15} color="#217A3C" />
                  </View>
                  <Text style={s.rowLabel}>{t(row.labelKey)}</Text>
                  {row.value ? <Text style={s.rowValue}>{row.value}</Text> : null}
                  <AppIcon name="chevronRight" size={15} color="#D1D5DB" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        <View style={s.bottomSpacer} />
      </ScrollView>

      <AppLoader
        visible={loading || updating}
        overlay
        message={updating ? t('common.updating') : t('common.loading')}
      />

      {/* Currency picker bottom sheet */}
      <Modal
        visible={showCurrencyPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCurrencyPicker(false)}
      >
        <View style={s.modalContainer}>
          <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setShowCurrencyPicker(false)} />
          <View style={s.sheet}>
            <View style={s.dragHandle} />
            <Text style={s.sheetTitle}>{t('appSettings.selectCurrency')}</Text>
            {['PKR', 'USD'].map(currency => (
              <TouchableOpacity
                key={currency}
                onPress={() => handleSelectCurrency(currency)}
                style={[s.currencyOption, settings.currency === currency && s.currencyOptionSelected]}
                activeOpacity={0.75}
              >
                <Text style={[s.currencyLabel, settings.currency === currency && s.currencyLabelSelected]}>
                  {currency === 'PKR' ? t('appSettings.pkr') : t('appSettings.usd')}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setShowCurrencyPicker(false)}
              style={s.cancelBtn}
              activeOpacity={0.75}
            >
              <Text style={s.cancelText}>{t('appSettings.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: { padding: 4, borderRadius: 8, transform: [{ rotate: '180deg' }] },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  headerSpacer: { width: 30 },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  bottomSpacer: { height: 20 },

  group: { marginBottom: 20 },
  groupLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingLeft: 4,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  iconBox: {
    width: 34,
    height: 34,
    backgroundColor: '#F2FBF5',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: '#111827' },
  rowValue: { fontSize: 12, color: '#9CA3AF', marginRight: 2 },

  // Currency modal
  modalContainer: { flex: 1, justifyContent: 'flex-end' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
  },
  dragHandle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    marginBottom: 20,
  },
  sheetTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 16 },
  currencyOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
  },
  currencyOptionSelected: { backgroundColor: '#F2FBF5' },
  currencyLabel: { fontSize: 14, fontWeight: '600', color: '#111827' },
  currencyLabelSelected: { color: '#1A6B34' },
  cancelBtn: {
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
});

export default AppSettingsScreen;
