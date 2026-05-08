import { useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from '../store';
import { setLanguage as setAppLanguage } from '../store/slices/appSlice';
import { authTranslations } from './modules/auth';
import { commonTranslations } from './modules/common';
import { dealsTranslations } from './modules/deals';
import { marketplaceTranslations } from './modules/marketplace';
import { profileTranslations } from './modules/profile';
import { sellerTranslations } from './modules/seller';

export type LanguageCode = 'en' | 'ur';
export type TextDirection = 'ltr' | 'rtl';

export type SupportedLanguage = {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  direction: TextDirection;
};

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', direction: 'ltr' },
  { code: 'ur', label: 'Urdu', nativeLabel: 'اردو', direction: 'rtl' },
];

export const localizationConfig = {
  defaultLanguage: DEFAULT_LANGUAGE,
  fallbackLanguage: DEFAULT_LANGUAGE,
  storageKey: 'naseebagro.language',
  supportedLanguages: SUPPORTED_LANGUAGES,
} as const;

export const getLanguageByCode = (code: LanguageCode) =>
  SUPPORTED_LANGUAGES.find(language => language.code === code) ??
  SUPPORTED_LANGUAGES[0];

export const isSupportedLanguage = (code: string): code is LanguageCode =>
  SUPPORTED_LANGUAGES.some(language => language.code === code);

const en = {
  ...commonTranslations.en,
  ...authTranslations.en,
  ...marketplaceTranslations.en,
  ...sellerTranslations.en,
  ...dealsTranslations.en,
  ...profileTranslations.en,
} as const;

export type TranslationKey = keyof typeof en;

const ur: Record<TranslationKey, string> = {
  ...commonTranslations.ur,
  ...authTranslations.ur,
  ...marketplaceTranslations.ur,
  ...sellerTranslations.ur,
  ...dealsTranslations.ur,
  ...profileTranslations.ur,
};

export const translations: Record<
  LanguageCode,
  Record<TranslationKey, string>
> = {
  en,
  ur,
};

type TranslationParams = Record<string, string | number>;

const interpolate = (template: string, params?: TranslationParams) => {
  if (!params) {
    return template;
  }

  return Object.entries(params).reduce(
    (copy, [key, value]) => copy.split(`{{${key}}}`).join(String(value)),
    template,
  );
};

export const translate = (
  language: LanguageCode,
  key: TranslationKey,
  params?: TranslationParams,
) => {
  const template =
    translations[language]?.[key] ?? translations[DEFAULT_LANGUAGE][key] ?? key;

  return interpolate(template, params);
};

export const useTranslation = () => {
  const dispatch = useAppDispatch();
  const language = useAppSelector(state => state.app.language);
  const languageInfo = getLanguageByCode(language);

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams) =>
      translate(language, key, params),
    [language],
  );

  const setLanguage = useCallback(
    (nextLanguage: LanguageCode) => {
      dispatch(setAppLanguage(nextLanguage));
      void AsyncStorage.setItem(
        localizationConfig.storageKey,
        nextLanguage,
      ).catch(() => undefined);
    },
    [dispatch],
  );

  return {
    t,
    language,
    languageInfo,
    setLanguage,
    direction: languageInfo.direction,
    isUrdu: language === 'ur',
  };
};

export const useHydrateLanguage = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      const storedLanguage = await AsyncStorage.getItem(
        localizationConfig.storageKey,
      );

      if (mounted && storedLanguage && isSupportedLanguage(storedLanguage)) {
        dispatch(setAppLanguage(storedLanguage));
      }
    };

    void hydrate().catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, [dispatch]);
};
