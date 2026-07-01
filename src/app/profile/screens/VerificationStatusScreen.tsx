import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, StyleSheet } from 'react-native';
import { AppIcon } from '../../../assets/icons';
import type { AppIconName } from '../../../assets/icons';
import { useTranslation } from '../../../localization';
import type { TranslationKey } from '../../../localization';
import { AppLoader } from '../../components';
import MockStatusBar from '../../components/MockStatusBar';
import api from '../../../utils/api';
import { useAppSelector } from '../../../store';
import {
  firstString,
  formatDisplayDate,
  normalizeList,
  toBoolean,
  unwrapApiData,
} from '../utils/profileApi';

type VerificationState = 'approved' | 'pending' | 'rejected';

type VerificationItem = {
  icon: AppIconName;
  labelKey: TranslationKey;
  status: VerificationState;
  verifiedAt: string;
  keys: string[];
};

const BASE_ITEMS: Omit<VerificationItem, 'status' | 'verifiedAt'>[] = [
  { icon: 'verificationId', labelKey: 'verification.cnic', keys: ['cnic', 'id', 'identity', 'identity_verification'] },
  { icon: 'verificationBusiness', labelKey: 'verification.businessDocs', keys: ['business', 'business_docs', 'business_profile'] },
  { icon: 'verificationBank', labelKey: 'verification.bankAccount', keys: ['bank', 'banking', 'bank_account'] },
  { icon: 'profilePhone', labelKey: 'verification.phone', keys: ['phone', 'phone_number'] },
  { icon: 'address', labelKey: 'verification.address', keys: ['address', 'location'] },
];

const normalizeStatus = (value: any): VerificationState => {
  if (typeof value === 'boolean') return value ? 'approved' : 'pending';
  const status = String(value ?? '').toLowerCase();
  if (['approved', 'verified', 'complete', 'completed', 'true'].includes(status)) return 'approved';
  if (['rejected', 'failed', 'declined'].includes(status)) return 'rejected';
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
    if (!source) continue;
    for (const key of keys) {
      if (source[key] !== undefined) return source[key];
    }
  }
  const list = normalizeList(payload, ['items', 'statuses', 'verification']);
  return list.find((item: any) => {
    const type = firstString(item?.type, item?.key, item?.name, item?.verification_type).toLowerCase();
    return keys.some(key => type.includes(key));
  });
};

const buildVerificationItems = (response: any): VerificationItem[] => {
  const payload = unwrapApiData(response);
  return BASE_ITEMS.map(item => {
    const detail = findDetail(payload, item.keys);
    const statusValue =
      typeof detail === 'object'
        ? detail?.status ?? detail?.verification_status ?? detail?.is_verified ?? detail?.approved
        : detail;
    return {
      ...item,
      status: normalizeStatus(statusValue),
      verifiedAt: typeof detail === 'object' ? firstString(detail?.verified_at, detail?.verifiedAt, detail?.date) : '',
    };
  });
};

const statusConfig = (status: VerificationState) => {
  switch (status) {
    case 'approved':
      return { iconBg: '#F2FBF5', iconColor: '#217A3C', badgeBg: '#E8F7EE', badgeColor: '#1A6B34', label: 'APPROVED' };
    case 'rejected':
      return { iconBg: '#FEE2E2', iconColor: '#DC2626', badgeBg: '#FEE2E2', badgeColor: '#DC2626', label: 'REJECTED' };
    default:
      return { iconBg: '#FEF3C7', iconColor: '#92400E', badgeBg: '#FEF3C7', badgeColor: '#92400E', label: 'PENDING' };
  }
};

const VerificationStatusScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const token = useAppSelector(s => s.auth.token);
  const [items, setItems] = useState<VerificationItem[]>(
    BASE_ITEMS.map(item => ({ ...item, status: 'pending', verifiedAt: '' })),
  );
  const [accountVerified, setAccountVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadVerificationStatus = useCallback(
    async (isRefresh = false) => {
      if (!token) return;
      if (!isRefresh) setLoading(true);
      try {
        const response = await api.profile.verificationStatus.get();
        const payload = unwrapApiData(response);
        const nextItems = buildVerificationItems(response);
        const verified =
          toBoolean(payload?.is_verified ?? payload?.account_verified ?? payload?.accountVerified) ||
          nextItems.every(item => item.status === 'approved');
        setItems(nextItems);
        setAccountVerified(verified);
      } catch {
        setItems(BASE_ITEMS.map(item => ({ ...item, status: 'pending', verifiedAt: '' })));
        setAccountVerified(false);
      } finally {
        if (!isRefresh) setLoading(false);
      }
    },
    [token],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await loadVerificationStatus(true); } finally { setRefreshing(false); }
  }, [loadVerificationStatus]);

  useFocusEffect(useCallback(() => { loadVerificationStatus(); }, [loadVerificationStatus]));

  return (
    <View style={s.container}>
      <MockStatusBar backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <AppIcon name="chevronRight" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t('verification.title')}</Text>
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
        {/* Hero card */}
        <View style={[s.hero, { backgroundColor: accountVerified ? '#145228' : '#92400E' }]}>
          <Text style={s.heroEmoji}>{accountVerified ? '✅' : '⏳'}</Text>
          <Text style={s.heroTitle}>
            {accountVerified ? t('verification.accountVerified') : t('verification.accountPending')}
          </Text>
          <Text style={s.heroSub}>
            {accountVerified ? t('verification.accountVerifiedSub') : t('verification.accountPendingSub')}
          </Text>
        </View>

        {/* Verification items */}
        <View style={s.itemsCard}>
          {items.map((item, idx) => {
            const cfg = statusConfig(item.status);
            const isFirst = idx === 0;
            const isLast = idx === items.length - 1;
            const verifiedLabel =
              item.status === 'approved' && item.verifiedAt
                ? t('common.verifiedDate', { date: formatDisplayDate(item.verifiedAt) })
                : item.status === 'approved'
                ? t('common.verifiedDash')
                : item.status === 'rejected'
                ? t('common.rejected')
                : t('common.pending');

            return (
              <View
                key={item.labelKey}
                style={[
                  s.itemRow,
                  !isLast && s.itemRowBorder,
                  isFirst && s.itemRowFirst,
                  isLast && s.itemRowLast,
                ]}
              >
                <View style={[s.itemIconBox, { backgroundColor: cfg.iconBg }]}>
                  <AppIcon name={item.icon} size={16} color={cfg.iconColor} />
                </View>
                <View style={s.itemBody}>
                  <Text style={s.itemLabel}>{t(item.labelKey)}</Text>
                  <Text style={s.itemSub}>{verifiedLabel}</Text>
                </View>
                <View style={[s.statusBadge, { backgroundColor: cfg.badgeBg }]}>
                  <Text style={[s.statusText, { color: cfg.badgeColor }]}>{cfg.label}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={s.bottomSpacer} />
      </ScrollView>

      <AppLoader visible={loading} overlay message={t('common.loading')} />
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

  hero: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  heroEmoji: { fontSize: 40, marginBottom: 8 },
  heroTitle: { fontSize: 17, fontWeight: '800', color: '#FFFFFF' },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4, textAlign: 'center' },

  itemsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  itemRowFirst: { borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  itemRowLast: { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  itemRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },

  itemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemBody: { flex: 1 },
  itemLabel: { fontSize: 13, fontWeight: '600', color: '#111827' },
  itemSub: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },

  statusBadge: { borderRadius: 7, paddingHorizontal: 9, paddingVertical: 3 },
  statusText: { fontSize: 10, fontWeight: '700' },
});

export default VerificationStatusScreen;
