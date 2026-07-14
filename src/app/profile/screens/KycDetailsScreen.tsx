import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
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

const KycDetailsScreen = ({ navigation }: any) => {
  const token = useAppSelector(s => s.auth.token);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cnic, setCnic] = useState<string | null>(null);
  const [frontUrl, setFrontUrl] = useState<string | null>(null);
  const [backUrl, setBackUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<ApprovalStatus>('pending');
  const [notes, setNotes] = useState<string | null>(null);
  const [reviewedAt, setReviewedAt] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!token) return;
    if (!isRefresh) setLoading(true);
    try {
      const [profileRes, verRes] = await Promise.allSettled([
        api.profile.personal.get() as any,
        api.profile.verificationStatus.get() as any,
      ]);

      const p = profileRes.status === 'fulfilled'
        ? ((profileRes.value as any)?.profile ?? profileRes.value)
        : null;
      const v = verRes.status === 'fulfilled'
        ? ((verRes.value as any)?.verification_status ?? verRes.value)
        : null;

      setCnic(p?.cnic ?? null);
      setFrontUrl(p?.cnic_front_image_url ?? null);
      setBackUrl(p?.cnic_back_image_url ?? null);

      // Prefer KycDocument-level status (from personal profile), fall back to user-level
      const resolvedStatus = p?.kyc_status ?? v?.kyc_status;
      setStatus(toStatus(resolvedStatus));
      setNotes(p?.kyc_notes ?? v?.kyc_notes ?? v?.kyc_rejection_reason ?? null);
      setReviewedAt(v?.kyc_reviewed_at ?? null);
    } finally {
      if (!isRefresh) setLoading(false);
    }
  }, [token]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await load(true); } finally { setRefreshing(false); }
  }, [load]);

  const cfg = STATUS_CFG[status];

  return (
    <View style={s.container}>
      <MockStatusBar backgroundColor="#FFFFFF" />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <AppIcon name="chevronRight" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>CNIC Verification</Text>
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
          {reviewedAt ? (
            <Text style={[s.reviewedAt, { color: cfg.color + 'aa' }]}>
              Reviewed: {new Date(reviewedAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          ) : null}
          {notes ? (
            <View style={s.notesBox}>
              <Text style={s.notesLabel}>Remarks</Text>
              <Text style={[s.notesText, { color: cfg.color }]}>{notes}</Text>
            </View>
          ) : null}
        </View>

        {/* CNIC number */}
        {cnic ? (
          <View style={s.infoCard}>
            <Text style={s.infoLabel}>CNIC Number</Text>
            <Text style={s.infoValue}>{cnic}</Text>
          </View>
        ) : (
          <View style={s.emptyCard}>
            <Text style={s.emptyText}>No CNIC number on file</Text>
          </View>
        )}

        {/* CNIC Images */}
        <Text style={s.sectionHeading}>CNIC Documents</Text>

        <DocImageCard label="Front Side" url={frontUrl} />
        <DocImageCard label="Back Side" url={backUrl} />

        <View style={{ height: 40 }} />
      </ScrollView>

      <AppLoader visible={loading} overlay message="Loading..." />
    </View>
  );
};

const DocImageCard = ({ label, url }: { label: string; url: string | null }) => {
  const [imgLoading, setImgLoading] = useState(false);

  return (
    <View style={s.docCard}>
      <Text style={s.docLabel}>{label}</Text>
      {url ? (
        <View style={s.imgBox}>
          {imgLoading && (
            <ActivityIndicator
              style={StyleSheet.absoluteFill}
              color="#217A3C"
            />
          )}
          <Image
            source={{ uri: url }}
            style={s.docImg}
            resizeMode="contain"
            onLoadStart={() => setImgLoading(true)}
            onLoadEnd={() => setImgLoading(false)}
          />
        </View>
      ) : (
        <View style={s.imgPlaceholder}>
          <Text style={s.imgPlaceholderText}>Not uploaded</Text>
        </View>
      )}
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
    marginBottom: 12,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusLabel: { fontSize: 13, fontWeight: '700', color: '#374151' },
  chip: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  chipText: { fontSize: 11, fontWeight: '700' },
  reviewedAt: { fontSize: 11, marginTop: 4 },
  notesBox: { marginTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)', paddingTop: 10 },
  notesLabel: { fontSize: 11, fontWeight: '700', color: '#6B7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.4 },
  notesText: { fontSize: 13, fontWeight: '500', lineHeight: 18 },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  infoLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 },
  infoValue: { fontSize: 15, fontWeight: '700', color: '#111827', letterSpacing: 1 },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  emptyText: { fontSize: 13, color: '#9CA3AF' },

  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 4,
  },

  docCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  docLabel: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 10 },
  imgBox: { borderRadius: 10, overflow: 'hidden', backgroundColor: '#F9FAFB', height: 180, justifyContent: 'center', alignItems: 'center' },
  docImg: { width: '100%', height: 180 },
  imgPlaceholder: {
    height: 100,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgPlaceholderText: { fontSize: 13, color: '#9CA3AF' },
});

export default KycDetailsScreen;
