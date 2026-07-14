import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppIcon } from '../../../assets/icons';
import MockStatusBar from '../../components/MockStatusBar';
import { AppLoader } from '../../components';
import api from '../../../utils/api';
import { useAppSelector } from '../../../store';

type ApprovalStatus = 'pending' | 'approved' | 'rejected';

const STATUS_CFG: Record<ApprovalStatus, { bg: string; color: string; label: string }> = {
  approved: { bg: '#F0FDF4', color: '#217A3C', label: 'Approved' },
  rejected: { bg: '#FEF2F2', color: '#EF4444', label: 'Rejected' },
  pending:  { bg: '#FFFBEB', color: '#D97706', label: 'Pending Review' },
};

const toStatus = (value: any): ApprovalStatus => {
  const s = String(value ?? '').toLowerCase();
  if (['approved', 'verified', 'complete'].includes(s)) return 'approved';
  if (['rejected', 'failed', 'declined'].includes(s)) return 'rejected';
  return 'pending';
};

type BusinessData = {
  business_name: string | null;
  business_type: string | null;
  business_registration_number: string | null;
  primary_crop: string | null;
  farm_size: string | null;
  business_status: ApprovalStatus;
  business_notes: string | null;
  business_approved_at: string | null;
  business_approved_by: { id: string; fullName: string } | null;
};

const BusinessDocsScreen = ({ navigation }: any) => {
  const token = useAppSelector(s => s.auth.token);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<BusinessData | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!token) return;
    if (!isRefresh) setLoading(true);
    try {
      const res = await api.profile.business.get() as any;
      const p = res?.profile ?? res;
      setData({
        business_name: p?.business_name ?? null,
        business_type: p?.business_type ?? null,
        business_registration_number: p?.business_registration_number ?? null,
        primary_crop: p?.primary_crop ?? null,
        farm_size: p?.farm_size ?? null,
        business_status: toStatus(p?.business_status),
        business_notes: p?.business_notes ?? null,
        business_approved_at: p?.business_approved_at ?? null,
        business_approved_by: p?.business_approved_by ?? null,
      });
    } finally {
      if (!isRefresh) setLoading(false);
    }
  }, [token]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await load(true); } finally { setRefreshing(false); }
  }, [load]);

  const status = data?.business_status ?? 'pending';
  const cfg = STATUS_CFG[status];

  return (
    <View style={s.container}>
      <MockStatusBar backgroundColor="#FFFFFF" />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <AppIcon name="chevronRight" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Business Documents</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#217A3C" colors={['#217A3C']} />
        }
      >
        {/* Status card */}
        <View style={[s.statusCard, { backgroundColor: cfg.bg }]}>
          <View style={s.statusRow}>
            <Text style={s.statusLabel}>Verification Status</Text>
            <View style={[s.chip, { backgroundColor: cfg.color + '22' }]}>
              <Text style={[s.chipText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
          </View>
          {data?.business_approved_at ? (
            <Text style={[s.reviewedAt, { color: cfg.color + 'aa' }]}>
              Reviewed:{' '}
              {new Date(data.business_approved_at).toLocaleDateString('en-PK', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          ) : null}
          {data?.business_approved_by ? (
            <Text style={[s.reviewedAt, { color: cfg.color + 'aa' }]}>
              By: {data.business_approved_by.fullName}
            </Text>
          ) : null}
          {data?.business_notes ? (
            <View style={s.notesBox}>
              <Text style={s.notesLabel}>Remarks</Text>
              <Text style={[s.notesText, { color: cfg.color }]}>{data.business_notes}</Text>
            </View>
          ) : null}
        </View>

        {/* Business details */}
        <Text style={s.sectionHeading}>Business Information</Text>

        <View style={s.detailsCard}>
          {[
            { label: 'Business Name', value: data?.business_name },
            { label: 'Business Type', value: data?.business_type },
            { label: 'Registration Number', value: data?.business_registration_number },
            { label: 'Primary Crop', value: data?.primary_crop },
            { label: 'Farm Size', value: data?.farm_size },
          ].map(row =>
            row.value ? (
              <View key={row.label} style={s.detailRow}>
                <Text style={s.detailLabel}>{row.label}</Text>
                <Text style={s.detailValue}>{row.value}</Text>
              </View>
            ) : null,
          )}

          {!data?.business_name && !data?.business_type ? (
            <Text style={s.emptyText}>No business information on file.</Text>
          ) : null}
        </View>

        {/* Edit CTA */}
        <TouchableOpacity
          style={s.editBtn}
          onPress={() => navigation.navigate('BusinessProfile')}
          activeOpacity={0.85}
        >
          <AppIcon name="edit" size={16} color="#217A3C" />
          <Text style={s.editBtnText}>Update Business Details</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <AppLoader visible={loading} overlay message="Loading..." />
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

  scroll: { padding: 16, paddingBottom: 40 },

  statusCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusLabel: { fontSize: 13, fontWeight: '700', color: '#374151' },
  chip: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  chipText: { fontSize: 11, fontWeight: '700' },
  reviewedAt: { fontSize: 11, marginTop: 4 },
  notesBox: { marginTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)', paddingTop: 10 },
  notesLabel: { fontSize: 11, fontWeight: '700', color: '#6B7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.4 },
  notesText: { fontSize: 13, fontWeight: '500', lineHeight: 18 },

  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },

  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500', flex: 1 },
  detailValue: { fontSize: 13, color: '#111827', fontWeight: '700', flex: 1, textAlign: 'right' },
  emptyText: { fontSize: 13, color: '#9CA3AF', paddingVertical: 20, textAlign: 'center' },

  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#217A3C',
    borderRadius: 12,
    paddingVertical: 13,
    backgroundColor: 'transparent',
  },
  editBtnText: { fontSize: 14, fontWeight: '600', color: '#217A3C' },
});

export default BusinessDocsScreen;
