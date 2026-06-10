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
import { AppIcon } from '../../../assets/icons';
import { RootStackParamList } from '../../../navigation/types';
import MockStatusBar from '../../components/MockStatusBar';

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
  { key: 'code', label: 'Post Code' },
  { key: 'commodity', label: 'Commodity' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'units', label: 'Units' },
  { key: 'location', label: 'Location' },
  { key: 'price', label: 'Price' },
  { key: 'grades', label: 'Grades' },
  { key: 'payment_terms', label: 'Payment Terms' },
  { key: 'mills', label: 'Mill' },
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
  const { mode, postData, categoryName } = route.params;
  const isBuyer = mode === 'buyer';
  const item = normalizePostItem(postData);

  const rows = item
    ? DISPLAY_KEYS.flatMap(({ key, label }) => {
        const value = item[key];
        if (value === null || value === undefined || value === '') return [];
        return [{ label, value: formatValue(value) }];
      })
    : [];

  const postCode = item?.code ?? item?.id ?? '';

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

  const createAnother = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'PrePost' }],
      }),
    );
  };

  return (
    <View style={styles.container}>
      <MockStatusBar backgroundColor="#FFFFFF" textColor="#111827" />

      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>
          {isBuyer ? 'Demand Posted' : 'Supply Posted'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.successCard}>
          <View style={styles.iconWrap}>
            <AppIcon name="approved" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.successTitle}>
            {isBuyer
              ? 'Demand Created Successfully!'
              : 'Supply Listed Successfully!'}
          </Text>
          {postCode ? (
            <Text style={styles.successCode}>{postCode}</Text>
          ) : null}
          {categoryName ? (
            <View style={styles.categoryChip}>
              <Text style={styles.categoryChipText}>{categoryName}</Text>
            </View>
          ) : null}
        </View>

        {rows.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {isBuyer ? 'Demand Summary' : 'Supply Summary'}
            </Text>
            {rows.map((row, index) => (
              <View
                key={row.label}
                style={[
                  styles.summaryRow,
                  index < rows.length - 1 && styles.summaryRowBorder,
                ]}
              >
                <Text style={styles.summaryLabel}>{row.label}</Text>
                <Text style={styles.summaryValue} numberOfLines={2}>
                  {row.value}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.noteBox}>
          <AppIcon name="shield" size={16} color="#217A3C" />
          <Text style={styles.noteText}>
            {isBuyer
              ? 'Your demand is now visible to sellers. You will be notified when offers arrive.'
              : 'Your supply is now visible to buyers. You will be notified when offers arrive.'}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={createAnother}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryBtnText}>Create Another</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={goMyPosts}
          activeOpacity={0.88}
        >
          <Text style={styles.primaryBtnText}>
            {isBuyer ? 'My Demands' : 'My Supplies'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  headerSpacer: { width: 34 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 116 },
  successCard: {
    backgroundColor: '#1A6B34',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  successCode: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  categoryChipText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    gap: 16,
  },
  summaryRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  summaryLabel: { fontSize: 12, color: '#6B7280', flex: 1 },
  summaryValue: {
    flex: 1.2,
    fontSize: 12,
    color: '#111827',
    fontWeight: '800',
    textAlign: 'right',
  },
  noteBox: {
    backgroundColor: '#F2FBF5',
    borderWidth: 1,
    borderColor: '#7FD4A0',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: '#145228',
    lineHeight: 18,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#217A3C',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: { fontSize: 13, color: '#217A3C', fontWeight: '800' },
  primaryBtn: {
    flex: 1.2,
    backgroundColor: '#F3CD03',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: { fontSize: 13, color: '#0D3B1F', fontWeight: '900' },
});

export default PostCreatedScreen;
