import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { MockStatusBar } from '../../components';
import { AppIcon } from '../../../assets/icons';

type Props = NativeStackScreenProps<RootStackParamList, 'DisputeDetail'>;

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  'Under Review': { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
  'Open':         { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
  'Resolved':     { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
  'Closed':       { bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF' },
};

const MOCK_DISPUTE = {
  id: 'd1',
  type: 'Quality Mismatch',
  description:
    'Buyer received 180 bags, expected 200. Shortfall of 20 bags worth Rs38,000.',
  status: 'Under Review' as const,
  dealCode: 'Deal - 001',
  commodityName: 'Basmati Rice',
  dealSummary: '200 bags · Karachi · PKR 840,000',
  createdAt: 'Mar 12, 2024',
  notes:
    'Please provide photographic evidence of the delivery to help us investigate the shortfall.',
  timeline: [
    { label: 'Ticket Submitted', time: 'Mar 12, 2024 · 10:30 AM', done: true },
    { label: 'Under Review by Team', time: 'Mar 12, 2024 · 11:15 AM', done: true },
    { label: 'Evidence Requested', time: 'Mar 13, 2024 · 9:00 AM', done: true },
    { label: 'Resolution', time: 'Pending', done: false },
  ],
};

const DisputeDetailScreen = ({ navigation, route }: Props) => {
  const { disputeId } = route.params;
  const dispute = MOCK_DISPUTE;

  const st = STATUS_STYLE[dispute.status] ?? STATUS_STYLE['Closed'];
  const isMismatch = dispute.type.toLowerCase().includes('mismatch');

  return (
    <View style={d.container}>
      <MockStatusBar />

      {/* Header */}
      <View style={d.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={d.backBtn}
          activeOpacity={0.7}
        >
          <AppIcon name="back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={d.headerTitle}>Dispute Details</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        style={d.scroll}
        contentContainerStyle={d.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status hero */}
        <View style={[d.heroCard, { borderColor: st.dot }]}>
          <View style={d.heroTop}>
            <View
              style={[
                d.heroIconWrap,
                { backgroundColor: isMismatch ? '#FEF2F2' : '#FFFBEB' },
              ]}
            >
              <AppIcon
                name={isMismatch ? 'alertTriangle' : 'alertCircle'}
                size={28}
                color={isMismatch ? '#EF4444' : '#F59E0B'}
              />
            </View>
            <View style={d.heroTextCol}>
              <Text style={d.heroType}>{dispute.type}</Text>
              <Text style={d.heroDate}>Submitted {dispute.createdAt}</Text>
            </View>
            <View style={[d.badge, { backgroundColor: st.bg }]}>
              <View style={[d.badgeDot, { backgroundColor: st.dot }]} />
              <Text style={[d.badgeText, { color: st.text }]}>
                {dispute.status}
              </Text>
            </View>
          </View>
          <Text style={d.heroDesc}>{dispute.description}</Text>
        </View>

        {/* Deal info */}
        {(dispute.dealCode || dispute.commodityName) && (
          <View style={d.section}>
            <Text style={d.sectionTitle}>DEAL INFORMATION</Text>
            <View style={d.infoCard}>
              {dispute.dealCode && (
                <View style={d.infoRow}>
                  <AppIcon name="document" size={15} color="#9CA3AF" />
                  <Text style={d.infoLabel}>Deal Code</Text>
                  <Text style={d.infoValue}>{dispute.dealCode}</Text>
                </View>
              )}
              {dispute.commodityName && (
                <View style={[d.infoRow, { borderTopWidth: 1, borderTopColor: '#F3F4F6', marginTop: 0 }]}>
                  <AppIcon name="crop" size={15} color="#9CA3AF" />
                  <Text style={d.infoLabel}>Commodity</Text>
                  <Text style={d.infoValue}>{dispute.commodityName}</Text>
                </View>
              )}
              {dispute.dealSummary && (
                <View style={[d.infoRow, { borderTopWidth: 1, borderTopColor: '#F3F4F6', marginTop: 0 }]}>
                  <AppIcon name="listing" size={15} color="#9CA3AF" />
                  <Text style={d.infoLabel}>Summary</Text>
                  <Text style={d.infoValue}>{dispute.dealSummary}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Notes from support */}
        {dispute.notes && (
          <View style={d.section}>
            <Text style={d.sectionTitle}>NOTES FROM SUPPORT</Text>
            <View style={d.notesCard}>
              <AppIcon name="document" size={16} color="#3B82F6" />
              <Text style={d.notesText}>{dispute.notes}</Text>
            </View>
          </View>
        )}

        {/* Timeline */}
        <View style={d.section}>
          <Text style={d.sectionTitle}>TIMELINE</Text>
          <View style={d.timelineCard}>
            {dispute.timeline.map((step, idx) => (
              <View key={idx} style={d.timelineRow}>
                <View style={d.timelineLeft}>
                  <View
                    style={[
                      d.timelineDot,
                      step.done ? d.timelineDotDone : d.timelineDotPending,
                    ]}
                  >
                    {step.done && (
                      <AppIcon name="approved" size={10} color="#FFFFFF" />
                    )}
                  </View>
                  {idx < dispute.timeline.length - 1 && (
                    <View
                      style={[
                        d.timelineLine,
                        step.done ? d.timelineLineDone : d.timelineLinePending,
                      ]}
                    />
                  )}
                </View>
                <View style={d.timelineContent}>
                  <Text
                    style={[
                      d.timelineLabel,
                      !step.done && d.timelineLabelPending,
                    ]}
                  >
                    {step.label}
                  </Text>
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
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  heroTextCol: { flex: 1 },
  heroType: { fontSize: 15, fontWeight: '800', color: '#111827' },
  heroDate: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    flexShrink: 0,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  heroDesc: { fontSize: 13, color: '#6B7280', lineHeight: 19 },

  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 8,
    paddingLeft: 2,
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 13,
    paddingHorizontal: 14,
  },
  infoLabel: { flex: 1, fontSize: 13, color: '#6B7280' },
  infoValue: { fontSize: 13, fontWeight: '700', color: '#111827', textAlign: 'right', flexShrink: 0, maxWidth: '55%' },

  notesCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
  },
  notesText: { flex: 1, fontSize: 13, color: '#1D4ED8', lineHeight: 19 },

  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
    minHeight: 52,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 20,
    flexShrink: 0,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotDone: { backgroundColor: '#1A6B34' },
  timelineDotPending: {
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  timelineLine: {
    flex: 1,
    width: 2,
    marginVertical: 2,
  },
  timelineLineDone: { backgroundColor: '#1A6B34' },
  timelineLinePending: { backgroundColor: '#E5E7EB' },
  timelineContent: { flex: 1, paddingBottom: 16 },
  timelineLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  timelineLabelPending: { color: '#9CA3AF' },
  timelineTime: { fontSize: 11, color: '#9CA3AF' },
});

export default DisputeDetailScreen;
