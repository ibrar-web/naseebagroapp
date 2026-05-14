import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import SubHeader from '../components/SubHeader';
import { AppIcon } from '../../../assets/icons';
import type { AppIconName } from '../../../assets/icons';
import { useTranslation } from '../../../localization';
import type { TranslationKey } from '../../../localization';
import { AppLoader } from '../../components';
import api from '../../../utils/api';
import {
  firstString,
  formatDisplayDate,
  normalizeList,
  toBoolean,
  unwrapApiData,
} from '../utils/profileApi';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.05,
  shadowRadius: 18,
  elevation: 3,
};

type VerificationState = 'approved' | 'pending' | 'rejected';

type VerificationItem = {
  icon: AppIconName;
  labelKey: TranslationKey;
  status: VerificationState;
  verifiedAt: string;
  keys: string[];
};

const BASE_ITEMS: Omit<VerificationItem, 'status' | 'verifiedAt'>[] = [
  {
    icon: 'verificationId',
    labelKey: 'verification.cnic',
    keys: ['cnic', 'id', 'identity', 'identity_verification'],
  },
  {
    icon: 'verificationBusiness',
    labelKey: 'verification.businessDocs',
    keys: ['business', 'business_docs', 'business_profile'],
  },
  {
    icon: 'verificationBank',
    labelKey: 'verification.bankAccount',
    keys: ['bank', 'banking', 'bank_account'],
  },
  {
    icon: 'profilePhone',
    labelKey: 'verification.phone',
    keys: ['phone', 'phone_number'],
  },
  {
    icon: 'address',
    labelKey: 'verification.address',
    keys: ['address', 'location'],
  },
];

const normalizeStatus = (value: any): VerificationState => {
  if (typeof value === 'boolean') {
    return value ? 'approved' : 'pending';
  }

  const status = String(value ?? '').toLowerCase();

  if (
    ['approved', 'verified', 'complete', 'completed', 'true'].includes(status)
  ) {
    return 'approved';
  }

  if (['rejected', 'failed', 'declined'].includes(status)) {
    return 'rejected';
  }

  return 'pending';
};

const findDetail = (payload: any, keys: string[]) => {
  const sources = [
    payload?.statuses,
    payload?.verification_status,
    payload?.verificationStatus,
    payload?.verification,
    payload,
  ];

  for (const source of sources) {
    if (!source) {
      continue;
    }

    for (const key of keys) {
      if (source[key] !== undefined) {
        return source[key];
      }
    }
  }

  const list = normalizeList(payload, ['items', 'statuses', 'verification']);

  return list.find((item: any) => {
    const type = firstString(
      item?.type,
      item?.key,
      item?.name,
      item?.verification_type,
    ).toLowerCase();

    return keys.some(key => type.includes(key));
  });
};

const buildVerificationItems = (response: any): VerificationItem[] => {
  const payload = unwrapApiData(response);

  return BASE_ITEMS.map(item => {
    const detail = findDetail(payload, item.keys);
    const statusValue =
      typeof detail === 'object'
        ? detail?.status ??
          detail?.verification_status ??
          detail?.is_verified ??
          detail?.approved
        : detail;

    return {
      ...item,
      status: normalizeStatus(statusValue),
      verifiedAt:
        typeof detail === 'object'
          ? firstString(detail?.verified_at, detail?.verifiedAt, detail?.date)
          : '',
    };
  });
};

const VerificationStatusScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<VerificationItem[]>(
    BASE_ITEMS.map(item => ({ ...item, status: 'pending', verifiedAt: '' })),
  );
  const [accountVerified, setAccountVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadVerificationStatus = async () => {
      setLoading(true);
      try {
        const response = await api.profile.verificationStatus.get();
        const payload = unwrapApiData(response);
        const nextItems = buildVerificationItems(response);
        const verified =
          toBoolean(
            payload?.is_verified ??
              payload?.account_verified ??
              payload?.accountVerified,
          ) || nextItems.every(item => item.status === 'approved');

        if (mounted) {
          setItems(nextItems);
          setAccountVerified(verified);
        }
      } catch {
        if (mounted) {
          setItems(
            BASE_ITEMS.map(item => ({
              ...item,
              status: 'pending',
              verifiedAt: '',
            })),
          );
          setAccountVerified(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadVerificationStatus().catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View className="flex-1 bg-gray-50">
      <SubHeader title={t('verification.title')} navigation={navigation} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className={`mb-8 items-center rounded-[28px] px-5 py-10 ${
            accountVerified ? 'bg-green-800' : 'bg-yellow-700'
          }`}
          style={CARD_SHADOW}
        >
          <View
            className={`h-20 w-20 items-center justify-center rounded-3xl ${
              accountVerified ? 'bg-green-500' : 'bg-yellow-500'
            }`}
          >
            <AppIcon
              name={accountVerified ? 'approved' : 'shield'}
              size={54}
              color="#FFFFFF"
            />
          </View>
          <Text className="mt-8 text-white text-2xl font-extrabold">
            {accountVerified
              ? t('verification.accountVerified')
              : t('verification.accountPending')}
          </Text>
          <Text className="mt-3 text-center text-white/80 text-lg font-medium">
            {accountVerified
              ? t('verification.accountVerifiedSub')
              : t('verification.accountPendingSub')}
          </Text>
        </View>

        <View
          className="overflow-hidden rounded-[28px] bg-white"
          style={CARD_SHADOW}
        >
          {items.map((item, index) => {
            const approved = item.status === 'approved';
            const rejected = item.status === 'rejected';
            const statusBg = approved
              ? 'bg-green-50'
              : rejected
              ? 'bg-red-50'
              : 'bg-yellow-100';
            const statusText = approved
              ? 'text-green-700'
              : rejected
              ? 'text-red-600'
              : 'text-yellow-800';
            const iconColor = approved
              ? '#1A6B34'
              : rejected
              ? '#DC2626'
              : '#A14E14';
            const detailText =
              approved && item.verifiedAt
                ? t('common.verifiedDate', {
                    date: formatDisplayDate(item.verifiedAt),
                  })
                : approved
                ? t('common.verifiedDash')
                : rejected
                ? t('common.rejected')
                : t('common.pending');

            return (
              <View
                key={item.labelKey}
                className={`flex-row items-center px-6 py-5 ${
                  index < items.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <View
                  className={`h-16 w-16 items-center justify-center rounded-2xl ${statusBg}`}
                >
                  <AppIcon name={item.icon} size={28} color={iconColor} />
                </View>
                <View className="ml-5 flex-1">
                  <Text className="text-gray-900 text-xl font-extrabold">
                    {t(item.labelKey)}
                  </Text>
                  <Text className="mt-1 text-gray-400 text-lg font-medium">
                    {detailText}
                  </Text>
                </View>
                <View className={`rounded-2xl px-5 py-3 ${statusBg}`}>
                  <Text
                    className={`text-base font-extrabold uppercase ${statusText}`}
                  >
                    {approved
                      ? t('common.approved')
                      : rejected
                      ? t('common.rejected')
                      : t('common.pending')}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <AppLoader visible={loading} overlay message={t('common.loading')} />
    </View>
  );
};

export default VerificationStatusScreen;
