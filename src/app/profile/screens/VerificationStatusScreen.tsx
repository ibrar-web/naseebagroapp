import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, StyleSheet } from 'react-native';
import { AppIcon } from '../../../assets/icons';
import type { AppIconName } from '../../../assets/icons';
import { useTranslation } from '../../../localization';
import { AppLoader } from '../../components';
import MockStatusBar from '../../components/MockStatusBar';
import api from '../../../utils/api';
import { useAppSelector } from '../../../store';
import { formatDisplayDate, unwrapApiData } from '../utils/profileApi';

type ApprovalStatus = 'pending' | 'approved' | 'rejected';

type ScreenData = {
  kycStatus: ApprovalStatus;
  kycNotes: string | null;
  kycRejectionReason: string | null;
  kycReviewedAt: string | null;
  phoneVerified: boolean;
  phoneVerifiedAt: string | null;
  businessStatus: ApprovalStatus;
  businessNotes: string | null;
};

const DEFAULT_DATA: ScreenData = {
  kycStatus: 'pending',
  kycNotes: null,
  kycRejectionReason: null,
  kycReviewedAt: null,
  phoneVerified: false,
  phoneVerifiedAt: null,
  businessStatus: 'pending',
  businessNotes: null,
};

const toApprovalStatus = (value: any): ApprovalStatus => {
  const s = String(value ?? '').toLowerCase();
  if (['approved', 'verified', 'complete', 'true'].includes(s)) return 'approved';
  if (['rejected', 'failed', 'declined'].includes(s)) return 'rejected';
  return 'pending';
};

const nullableStr = (value: any): string | null => {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  return String(value);
};

const STATUS_CFG: Record<
  ApprovalStatus,
  { bg: string; color: string; label: string; iconBg: string; iconColor: string }
> = {
  approved: { bg: '#F0FDF4', color: '#217A3C', label: 'Approved',      iconBg: '#F2FBF5', iconColor: '#217A3C' },
  rejected: { bg: '#FEF2F2', color: '#EF4444', label: 'Rejected',      iconBg: '#FEE2E2', iconColor: '#EF4444' },
  pending:  { bg: '#FFFBEB', color: '#D97706', label: 'Pending Review', iconBg: '#FEF3C7', iconColor: '#92400E' },
};

// ── SectionCard ──────────────────────────────────────────────────────────────

type SectionCardProps = {
  iconName: AppIconName;
  iconColor?: string;
  iconBgColor?: string;
  title: string;
  status: ApprovalStatus;
  subtitle?: string | null;
  notes?: string | null;
  onPress?: () => void;
};

const SectionCard = ({ iconName, iconColor, iconBgColor, title, status, subtitle, notes, onPress }: SectionCardProps) => {
  const cfg = STATUS_CFG[status];
  return (
    <TouchableOpacity
      style={s.sectionCard}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
      disabled={!onPress}
    >
      <View style={s.sectionCardTop}>
        <View style={[s.sectionIconBox, { backgroundColor: iconBgColor ?? cfg.iconBg }]}>
          <AppIcon name={iconName} size={18} color={iconColor ?? cfg.iconColor} />
        </View>
        <View style={s.sectionBody}>
          <Text style={s.sectionTitle}>{title}</Text>
          {subtitle ? <Text style={s.sectionSub}>{subtitle}</Text> : null}
        </View>
        <View style={s.sectionChipRow}>
          <View style={[s.statusChip, { backgroundColor: cfg.bg }]}>
            <Text style={[s.statusChipText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
          {onPress ? <AppIcon name="chevronRight" size={14} color="#D1D5DB" /> : null}
        </View>
      </View>
      {notes ? (
        <View style={[s.notesBox, { backgroundColor: cfg.bg }]}>
          <Text style={[s.notesText, { color: cfg.color }]}>{notes}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

// ── Screen ───────────────────────────────────────────────────────────────────

const VerificationStatusScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const token = useAppSelector(s => s.auth.token);
  const profileCompletion = useAppSelector(s => s.auth.user?.profile_completion ?? 30);
  const [data, setData] = useState<ScreenData>(DEFAULT_DATA);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!token) return;
      if (!isRefresh) setLoading(true);
      try {
        const [verRes, bizRes] = await Promise.allSettled([
          api.profile.verificationStatus.get(),
          api.profile.business.get(),
        ]);

        const ver = verRes.status === 'fulfilled' ? unwrapApiData(verRes.value) : null;
        const biz = bizRes.status === 'fulfilled' ? unwrapApiData(bizRes.value) : null;

        setData({
          kycStatus: toApprovalStatus(ver?.kyc_status),
          kycNotes: nullableStr(ver?.kyc_notes),
          kycRejectionReason: nullableStr(ver?.kyc_rejection_reason),
          kycReviewedAt: nullableStr(ver?.kyc_reviewed_at),
          phoneVerified: Boolean(ver?.phone_verified),
          phoneVerifiedAt: nullableStr(ver?.phone_verified_at),
          businessStatus: toApprovalStatus(biz?.business_status),
          businessNotes: nullableStr(biz?.business_notes),
        });
      } catch {
        setData(DEFAULT_DATA);
      } finally {
        if (!isRefresh) setLoading(false);
      }
    },
    [token],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await load(true); } finally { setRefreshing(false); }
  }, [load]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const isFullyVerified =
    data.kycStatus === 'approved' &&
    data.businessStatus === 'approved' &&
    data.phoneVerified;

  const kycSubtitle =
    data.kycStatus === 'approved' && data.kycReviewedAt
      ? `Reviewed ${formatDisplayDate(data.kycReviewedAt)}`
      : null;

  const phoneSubtitle =
    data.phoneVerified && data.phoneVerifiedAt
      ? `Verified ${formatDisplayDate(data.phoneVerifiedAt)}`
      : null;

  const kycNotes = data.kycNotes ?? data.kycRejectionReason;

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
        <View style={[s.hero, { backgroundColor: isFullyVerified ? '#145228' : '#92400E' }]}>
          <Text style={s.heroEmoji}>{isFullyVerified ? '✅' : '⏳'}</Text>
          <Text style={s.heroTitle}>
            {isFullyVerified ? t('verification.accountVerified') : t('verification.accountPending')}
          </Text>
          <Text style={s.heroSub}>
            {isFullyVerified ? t('verification.accountVerifiedSub') : t('verification.accountPendingSub')}
          </Text>
          {/* Profile completion bar */}
          <View style={s.progressRow}>
            <View style={s.progressTrack}>
              <View style={[s.progressFill, { width: `${profileCompletion}%` as any }]} />
            </View>
            <Text style={s.progressLabel}>{profileCompletion}%</Text>
          </View>
        </View>

        {/* KYC / Identity */}
        <SectionCard
          iconName="verificationId"
          title={t('verification.cnic')}
          status={data.kycStatus}
          subtitle={kycSubtitle}
          notes={kycNotes}
          onPress={() => navigation.navigate('KycDetails')}
        />

        {/* Business Profile */}
        <SectionCard
          iconName="verificationBusiness"
          title={t('verification.businessDocs')}
          status={data.businessStatus}
          notes={data.businessNotes}
          onPress={() => navigation.navigate('BusinessProfile')}
        />

        {/* Phone */}
        <SectionCard
          iconName="profilePhone"
          title={t('verification.phone')}
          status={data.phoneVerified ? 'approved' : 'pending'}
          subtitle={phoneSubtitle}
        />

        {/* Banking — summary card with navigation */}
        <View style={s.bankCard}>
          <View style={s.bankCardLeft}>
            <View style={[s.sectionIconBox, { backgroundColor: '#EEF6FF' }]}>
              <AppIcon name="verificationBank" size={18} color="#3B82F6" />
            </View>
            <View style={s.sectionBody}>
              <Text style={s.sectionTitle}>{t('verification.bankAccount')}</Text>
              <Text style={s.sectionSub}>Manage your linked bank accounts</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('PaymentMethods')}
            style={s.viewBtn}
            activeOpacity={0.8}
          >
            <Text style={s.viewBtnText}>View</Text>
            <AppIcon name="chevronRight" size={14} color="#1A6B34" />
          </TouchableOpacity>
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
    marginBottom: 14,
    alignItems: 'center',
  },
  heroEmoji: { fontSize: 40, marginBottom: 8 },
  heroTitle: { fontSize: 17, fontWeight: '800', color: '#FFFFFF' },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4, textAlign: 'center' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, width: '100%' },
  progressTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.25)', overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
  progressLabel: { fontSize: 12, fontWeight: '700', color: '#FFFFFF', minWidth: 34, textAlign: 'right' },

  // Shared section card
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    paddingHorizontal: 16,
  },
  sectionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sectionBody: { flex: 1 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#111827' },
  sectionSub: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },

  sectionChipRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 },

  statusChip: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexShrink: 0,
  },
  statusChipText: { fontSize: 11, fontWeight: '700' },

  notesBox: {
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  notesText: { fontSize: 12, fontWeight: '500', lineHeight: 17 },

  // Banking summary card
  bankCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  bankCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexShrink: 0,
  },
  viewBtnText: { fontSize: 13, fontWeight: '700', color: '#1A6B34' },
});

export default VerificationStatusScreen;
