import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import MockStatusBar from '../../components/MockStatusBar';
import { AppIcon } from '../../../assets/icons';

type Props = NativeStackScreenProps<RootStackParamList, 'PostCreated'>;

const normalizePostItem = (postData: any): Record<string, any> | null => {
  const item =
    postData?.data?.item ??
    postData?.item ??
    postData?.data ??
    postData;
  if (!item || typeof item !== 'object') return null;
  return item;
};

const DISPLAY_KEYS: Array<{ key: string; label: string }> = [
  { key: 'code', label: 'Request ID' },
  { key: 'id', label: 'Post ID' },
  { key: 'commodity', label: 'Commodity' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'units', label: 'Units' },
  { key: 'location', label: 'Location' },
  { key: 'price', label: 'Price' },
  { key: 'grades', label: 'Grades' },
  { key: 'payment_terms', label: 'Payment Terms' },
  { key: 'delivery_options', label: 'Delivery Options' },
  { key: 'delivery_terms', label: 'Delivery Terms' },
  { key: 'status', label: 'Status' },
];

const formatValue = (value: any): string => {
  if (value === null || value === undefined) return '—';
  if (Array.isArray(value)) return value.join(', ') || '—';
  if (typeof value === 'object') {
    if (value.type === 'FIXED' && value.fixed_days != null) {
      return `Fixed ${value.fixed_days} days`;
    }
    if (value.type === 'WEEKLY' && value.weekly_percent != null) {
      return `Weekly ${value.weekly_percent}%`;
    }
    return JSON.stringify(value);
  }
  return String(value);
};

const PostCreatedScreen = ({ navigation, route }: Props) => {
  const { mode, postData, categoryName, totalCount } = route.params;
  const isBuyer = mode === 'buyer';
  const item = normalizePostItem(postData);

  // Only show rows that have a non-empty value, skip 'id' if 'code' already shown
  const rows = item
    ? DISPLAY_KEYS.flatMap(({ key, label }) => {
        if (key === 'id' && item.code) return [];
        const value = item[key];
        if (value === null || value === undefined || value === '') return [];
        return [{ label, value: formatValue(value) }];
      })
    : [];

  // Default fallback row
  const displayRows =
    rows.length > 0
      ? rows
      : [{ label: 'Status', value: 'Submitted' }];

  const goMyPosts = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'MainTabs',
            params: {
              screen: 'Post',
              params: { initialTab: isBuyer ? 'My Demands' : 'My Supplies' },
            },
          },
        ],
      }),
    );
  };

  const goMarket = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainTabs', params: { screen: 'Market' } }],
      }),
    );
  };

  const goHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
      }),
    );
  };

  const multiLabel =
    totalCount && totalCount > 1
      ? `${totalCount} ${isBuyer ? 'demands' : 'supplies'} submitted`
      : null;

  return (
    <View style={styles.container}>
      <MockStatusBar backgroundColor="#FFFFFF" textColor="#111827" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goMyPosts} style={styles.backBtn} activeOpacity={0.8}>
          <AppIcon name="back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isBuyer ? 'Demand Submitted' : 'Supply Submitted'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success icon */}
        <View style={styles.iconWrap}>
          <View style={styles.iconRing}>
            <View style={styles.iconCircle}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.successTitle}>
          {isBuyer ? 'Demand Submitted!' : 'Supply Submitted!'}
        </Text>

        {multiLabel ? (
          <View style={styles.multiBadge}>
            <Text style={styles.multiBadgeText}>{multiLabel}</Text>
          </View>
        ) : null}

        {categoryName ? (
          <View style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>{categoryName}</Text>
          </View>
        ) : null}

        <Text style={styles.successSubtitle}>
          The Naseeb team will review and respond within{' '}
          <Text style={styles.subtitleBold}>2–4 hours</Text>.
        </Text>

        {/* Summary card */}
        <View style={styles.summaryCard}>
          {displayRows.map((row, index) => (
            <View
              key={row.label}
              style={[
                styles.summaryRow,
                index < displayRows.length - 1 && styles.summaryRowBorder,
              ]}
            >
              <Text style={styles.summaryLabel}>{row.label}</Text>
              <Text style={styles.summaryValue} numberOfLines={2}>
                {row.value}
              </Text>
            </View>
          ))}

          {/* Status row always present */}
          {!displayRows.some(r => r.label === 'Status') ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Status</Text>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusBadgeText}>Submitted</Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Actions */}
        <View style={styles.actionsWrap}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={goMyPosts}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryBtnIcon}>☰</Text>
            <Text style={styles.primaryBtnText}>
              {isBuyer ? 'Track My Demand' : 'Track My Supply'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={goMarket}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnIcon}>🛒</Text>
            <Text style={styles.secondaryBtnText}>Browse More Listings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.ghostBtn}
            onPress={goHome}
            activeOpacity={0.85}
          >
            <Text style={styles.ghostBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

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
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  headerSpacer: { width: 34 },

  scroll: { flex: 1 },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
    paddingBottom: 40,
  },

  // Success icon
  iconWrap: { marginTop: 12, marginBottom: 16 },
  iconRing: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: '#F2FBF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#E8F7EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: { fontSize: 44, color: '#2E9E52', lineHeight: 52 },

  // Title + subtitle
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
  },
  multiBadge: {
    marginBottom: 6,
    backgroundColor: '#E8F7EE',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  multiBadgeText: { fontSize: 12, fontWeight: '700', color: '#1A6B34' },
  categoryChip: {
    marginBottom: 6,
    backgroundColor: '#E8F7EE',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  categoryChipText: { fontSize: 12, fontWeight: '700', color: '#1A6B34' },
  successSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 18,
  },
  subtitleBold: { fontWeight: '700', color: '#374151' },

  // Summary card
  summaryCard: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  summaryRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  summaryLabel: { fontSize: 13, color: '#6B7280' },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
  },
  statusBadgeText: { fontSize: 11, fontWeight: '600', color: '#4B5563' },

  // Action buttons
  actionsWrap: { width: '100%', gap: 10 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#217A3C',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 20,
    shadowColor: '#2E9E52',
    shadowOpacity: 0.27,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryBtnIcon: { fontSize: 16, color: '#FFFFFF' },
  primaryBtnText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#2E9E52',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  secondaryBtnIcon: { fontSize: 16 },
  secondaryBtnText: { fontSize: 14, fontWeight: '600', color: '#1A6B34' },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  ghostBtnText: { fontSize: 14, fontWeight: '600', color: '#4B5563' },
});

export default PostCreatedScreen;
