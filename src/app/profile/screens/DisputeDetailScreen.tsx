import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { MockStatusBar } from '../../components';
import { AppIcon } from '../../../assets/icons';
import api from '../../../utils/api';
import { useAppSelector } from '../../../store';

type Props = NativeStackScreenProps<RootStackParamList, 'DisputeDetail'>;

interface TimelineStep {
  label: string;
  time: string;
  done: boolean;
}

interface DisputeData {
  id: string;
  code: string | null;
  type: string;
  description: string;
  status: string;
  admin_feedback: string | null;
  deal: {
    code?: string | null;
    commodity?: { name: string } | null;
    offer?: { quantity?: number } | null;
    total_amount?: number | null;
  } | null;
  resolved_by_admin: { first_name?: string; last_name?: string } | null;
  created_at: string;
  reviewed_at: string | null;
  resolved_at: string | null;
}

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  OPEN:         { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B', label: 'Open' },
  UNDER_REVIEW: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B', label: 'Under Review' },
  RESOLVED:     { bg: '#D1FAE5', text: '#065F46', dot: '#10B981', label: 'Resolved' },
};

const fmtDate = (iso?: string | null, full = false) => {
  if (!iso) return 'Pending';
  try {
    const d = new Date(iso);
    if (full) {
      return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
        + ' · '
        + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
};

const TYPE_LABEL: Record<string, string> = {
  QUANTITY_MISMATCH: 'Quantity Mismatch',
  QUALITY_DISPUTE: 'Quality Dispute',
  PAYMENT_DELAY: 'Payment Delay',
  OTHER: 'Other',
};

const DisputeDetailScreen = ({ navigation, route }: Props) => {
  const { disputeId } = route.params;
  const mode = useAppSelector(s => s.app.mode);
  const [dispute, setDispute] = useState<DisputeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data: any =
          mode === 'buyer'
            ? await api.buyer.getDisputeById(disputeId)
            : await api.seller.getDisputeById(disputeId);
        setDispute(data);
      } catch {
        // keep null
      } finally {
        setLoading(false);
      }
    })();
  }, [disputeId, mode]);

  if (loading) {
    return (
      <View style={d.container}>
        <MockStatusBar />
        <View style={d.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={d.backBtn} activeOpacity={0.7}>
            <AppIcon name="back" size={22} color="#111827" />
          </TouchableOpacity>
          <Text style={d.headerTitle}>Dispute Details</Text>
          <View style={{ width: 30 }} />
        </View>
        <View style={d.center}>
          <ActivityIndicator size="large" color="#217A3C" />
        </View>
      </View>
    );
  }

  if (!dispute) {
    return (
      <View style={d.container}>
        <MockStatusBar />
        <View style={d.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={d.backBtn} activeOpacity={0.7}>
            <AppIcon name="back" size={22} color="#111827" />
          </TouchableOpacity>
          <Text style={d.headerTitle}>Dispute Details</Text>
          <View style={{ width: 30 }} />
        </View>
        <View style={d.center}>
          <Text style={d.notFound}>Dispute not found.</Text>
        </View>
      </View>
    );
  }

  const st = STATUS_STYLE[dispute.status] ?? STATUS_STYLE['OPEN'];
  const typeLabel = TYPE_LABEL[dispute.type] ?? dispute.type?.replace(/_/g, ' ') ?? 'Dispute';
  const isMismatch = dispute.type?.includes('QUANTITY') || dispute.type?.includes('QUALITY');

  const timeline: TimelineStep[] = [
    { label: 'Ticket Submitted', time: fmtDate(dispute.created_at, true), done: true },
    {
      label: 'Under Review by Team',
      time: dispute.reviewed_at ? fmtDate(dispute.reviewed_at, true) : 'Pending',
      done: !!dispute.reviewed_at,
    },
    {
      label: 'Resolution',
      time: dispute.resolved_at ? fmtDate(dispute.resolved_at, true) : 'Pending',
      done: dispute.status === 'RESOLVED',
    },
  ];

  return (
    <View style={d.container}>
      <MockStatusBar />

      <View style={d.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={d.backBtn} activeOpacity={0.7}>
          <AppIcon name="back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={d.headerTitle}>Dispute Details</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={d.scroll} contentContainerStyle={d.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status hero */}
        <View style={[d.heroCard, { borderColor: st.dot }]}>
          <View style={d.heroTop}>
            <View style={[d.heroIconWrap, { backgroundColor: isMismatch ? '#FEF2F2' : '#FFFBEB' }]}>
              <AppIcon
                name={isMismatch ? 'alertTriangle' : 'alertCircle'}
                size={28}
                color={isMismatch ? '#EF4444' : '#F59E0B'}
              />
            </View>
            <View style={d.heroTextCol}>
              <Text style={d.heroType}>{typeLabel}</Text>
              <Text style={d.heroCode}>{dispute.code ?? disputeId.slice(0, 8)}</Text>
              <Text style={d.heroDate}>Submitted {fmtDate(dispute.created_at)}</Text>
            </View>
            <View style={[d.badge, { backgroundColor: st.bg }]}>
              <View style={[d.badgeDot, { backgroundColor: st.dot }]} />
              <Text style={[d.badgeText, { color: st.text }]}>{st.label}</Text>
            </View>
          </View>
          <Text style={d.heroDesc}>{dispute.description}</Text>
        </View>

        {/* Deal info */}
        {dispute.deal && (
          <View style={d.section}>
            <Text style={d.sectionTitle}>DEAL INFORMATION</Text>
            <View style={d.infoCard}>
              {dispute.deal.code && (
                <View style={d.infoRow}>
                  <AppIcon name="document" size={15} color="#9CA3AF" />
                  <Text style={d.infoLabel}>Deal Code</Text>
                  <Text style={d.infoValue}>{dispute.deal.code}</Text>
                </View>
              )}
              {dispute.deal.commodity?.name && (
                <View style={[d.infoRow, d.infoRowBorder]}>
                  <AppIcon name="crop" size={15} color="#9CA3AF" />
                  <Text style={d.infoLabel}>Commodity</Text>
                  <Text style={d.infoValue}>{dispute.deal.commodity.name}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Admin feedback */}
        {dispute.admin_feedback && (
          <View style={d.section}>
            <Text style={d.sectionTitle}>NOTES FROM SUPPORT</Text>
            <View style={d.notesCard}>
              <AppIcon name="document" size={16} color="#3B82F6" />
              <Text style={d.notesText}>{dispute.admin_feedback}</Text>
            </View>
          </View>
        )}

        {/* Timeline */}
        <View style={d.section}>
          <Text style={d.sectionTitle}>TIMELINE</Text>
          <View style={d.timelineCard}>
            {timeline.map((step, idx) => (
              <View key={idx} style={d.timelineRow}>
                <View style={d.timelineLeft}>
                  <View style={[d.timelineDot, step.done ? d.timelineDotDone : d.timelineDotPending]}>
                    {step.done && <AppIcon name="approved" size={10} color="#FFFFFF" />}
                  </View>
                  {idx < timeline.length - 1 && (
                    <View style={[d.timelineLine, step.done ? d.timelineLineDone : d.timelineLinePending]} />
                  )}
                </View>
                <View style={d.timelineContent}>
                  <Text style={[d.timelineLabel, !step.done && d.timelineLabelPending]}>{step.label}</Text>
                  <Text style={d.timelineTime}>{step.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const d = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { fontSize: 15, color: '#9CA3AF' },

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
  backBtn: { padding: 4, borderRadius: 8 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 48, gap: 0 },

  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  heroIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  heroTextCol: { flex: 1 },
  heroType: { fontSize: 15, fontWeight: '800', color: '#111827' },
  heroCode: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  heroDate: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, flexShrink: 0 },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  heroDesc: { fontSize: 13, color: '#6B7280', lineHeight: 19 },

  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1, marginBottom: 8, paddingLeft: 2 },

  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13, paddingHorizontal: 14 },
  infoRowBorder: { borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  infoLabel: { flex: 1, fontSize: 13, color: '#6B7280' },
  infoValue: { fontSize: 13, fontWeight: '700', color: '#111827', textAlign: 'right', flexShrink: 0, maxWidth: '55%' },

  notesCard: { backgroundColor: '#EFF6FF', borderRadius: 14, padding: 14, flexDirection: 'row', gap: 10 },
  notesText: { flex: 1, fontSize: 13, color: '#1D4ED8', lineHeight: 19 },

  timelineCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 },
  timelineRow: { flexDirection: 'row', gap: 12, minHeight: 52 },
  timelineLeft: { alignItems: 'center', width: 20, flexShrink: 0 },
  timelineDot: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  timelineDotDone: { backgroundColor: '#1A6B34' },
  timelineDotPending: { backgroundColor: '#F3F4F6', borderWidth: 2, borderColor: '#D1D5DB' },
  timelineLine: { flex: 1, width: 2, marginVertical: 2 },
  timelineLineDone: { backgroundColor: '#1A6B34' },
  timelineLinePending: { backgroundColor: '#E5E7EB' },
  timelineContent: { flex: 1, paddingBottom: 16 },
  timelineLabel: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 2 },
  timelineLabelPending: { color: '#9CA3AF' },
  timelineTime: { fontSize: 11, color: '#9CA3AF' },
});

export default DisputeDetailScreen;
