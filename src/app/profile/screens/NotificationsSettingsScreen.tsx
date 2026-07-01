import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useTranslation } from '../../../localization';
import type { TranslationKey } from '../../../localization';
import { AppLoader, MockStatusBar } from '../../components';
import { AppIcon } from '../../../assets/icons';
import api from '../../../utils/api';
import { toBoolean, unwrapApiData } from '../utils/profileApi';
import { useAppSelector } from '../../../store';

type ToggleKey = 'deals' | 'offers' | 'payments' | 'delivery' | 'promotions' | 'sms';

type ToggleRow = {
  key: ToggleKey;
  apiKey: string;
  fallbackKeys?: string[];
  labelKey: TranslationKey;
  subKey: TranslationKey;
};

const TOGGLES: ToggleRow[] = [
  { key: 'deals', apiKey: 'deal_alerts', labelKey: 'notifications.newDealAlerts', subKey: 'notifications.newDealAlertsSub' },
  { key: 'offers', apiKey: 'offer_updates', labelKey: 'notifications.offerUpdates', subKey: 'notifications.offerUpdatesSub' },
  { key: 'payments', apiKey: 'payment_alerts', fallbackKeys: ['payment_dispatch_alerts'], labelKey: 'notifications.paymentAlerts', subKey: 'notifications.paymentAlertsSub' },
  { key: 'delivery', apiKey: 'dispatch_delivery_alerts', fallbackKeys: ['payment_dispatch_alerts'], labelKey: 'notifications.dispatchDelivery', subKey: 'notifications.dispatchDeliverySub' },
  { key: 'promotions', apiKey: 'promotion_alerts', labelKey: 'notifications.promotions', subKey: 'notifications.promotionsSub' },
  { key: 'sms', apiKey: 'sms_alerts', labelKey: 'notifications.sms', subKey: 'notifications.smsSub' },
];

const Toggle = ({
  value,
  onPress,
  disabled,
}: {
  value: boolean;
  onPress: () => void;
  disabled: boolean;
}) => (
  <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.85}>
    <View style={[s.track, value ? s.trackOn : s.trackOff]}>
      <View style={[s.thumb, value ? s.thumbOn : s.thumbOff]} />
    </View>
  </TouchableOpacity>
);

const NotificationsSettingsScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const token = useAppSelector(s => s.auth.token);
  const [prefs, setPrefs] = useState<Record<ToggleKey, boolean>>({
    deals: false, offers: false, payments: false, delivery: false, promotions: false, sms: false,
  });
  const [loading, setLoading] = useState(false);
  const [updatingKey, setUpdatingKey] = useState<ToggleKey | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const readToggleValue = useCallback((data: any, item: ToggleRow) => {
    const candidates = [item.apiKey, ...(item.fallbackKeys ?? [])];
    const value = candidates.map(k => data?.[k]).find(v => v !== undefined && v !== null);
    return toBoolean(value, false);
  }, []);

  const loadNotifications = useCallback(
    async (isRefresh = false) => {
      if (!token) return;
      if (!isRefresh) setLoading(true);
      try {
        const response = await api.profile.notifications.get();
        const payload = unwrapApiData(response);
        const data = payload?.notifications ?? payload?.settings ?? payload?.preferences ?? payload;
        setPrefs(
          TOGGLES.reduce(
            (acc, item) => ({ ...acc, [item.key]: readToggleValue(data, item) }),
            {} as Record<ToggleKey, boolean>,
          ),
        );
      } catch {
        // keep existing
      } finally {
        if (!isRefresh) setLoading(false);
      }
    },
    [readToggleValue, token],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await loadNotifications(true); } finally { setRefreshing(false); }
  }, [loadNotifications]);

  useFocusEffect(useCallback(() => { loadNotifications(); }, [loadNotifications]));

  const toggle = async (item: ToggleRow) => {
    if (updatingKey) return;
    const nextValue = !prefs[item.key];
    setPrefs(cur => ({ ...cur, [item.key]: nextValue }));
    if (!token) return;
    setUpdatingKey(item.key);
    try {
      await api.profile.notifications.update({ [item.apiKey]: nextValue });
    } catch {
      setPrefs(cur => ({ ...cur, [item.key]: !nextValue }));
    } finally {
      setUpdatingKey(null);
    }
  };

  return (
    <View style={s.container}>
      <MockStatusBar backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <AppIcon name="chevronRight" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t('notifications.title')}</Text>
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
        <View style={s.card}>
          {TOGGLES.map((item, idx) => (
            <View key={item.key} style={[s.row, idx < TOGGLES.length - 1 && s.rowBorder]}>
              <View style={s.rowText}>
                <Text style={s.rowLabel}>{t(item.labelKey)}</Text>
                <Text style={s.rowSub}>{t(item.subKey)}</Text>
              </View>
              <Toggle
                value={prefs[item.key]}
                onPress={() => toggle(item).catch(() => undefined)}
                disabled={updatingKey !== null}
              />
            </View>
          ))}
        </View>

        <View style={s.bottomSpacer} />
      </ScrollView>

      <AppLoader
        visible={loading || updatingKey !== null}
        overlay
        message={updatingKey ? t('common.updating') : t('common.loading')}
      />
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
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 13, fontWeight: '600', color: '#111827' },
  rowSub: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },

  // Custom toggle
  track: { width: 44, height: 24, borderRadius: 12, flexShrink: 0 },
  trackOn: { backgroundColor: '#2E9E52' },
  trackOff: { backgroundColor: '#E5E7EB' },
  thumb: {
    position: 'absolute',
    top: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  thumbOn: { left: 22 },
  thumbOff: { left: 2 },
});

export default NotificationsSettingsScreen;
