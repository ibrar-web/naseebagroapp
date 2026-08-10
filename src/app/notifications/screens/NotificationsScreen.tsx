import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MockStatusBar from '../../components/MockStatusBar';
import { AppIcon } from '../../../assets/icons';
import type { AppIconName } from '../../../assets/icons';
import { useAppSelector } from '../../../store';
import api from '../../../utils/api';
import { navigationRef } from '../../../navigation/AppNavigator';

type ApiNotification = {
  id: string;
  title: string;
  body: string;
  type: string;
  entity_type: string | null;
  entity_id: string | null;
  recipient_role: 'buyer' | 'seller' | null;
  is_read: boolean;
  created_at: string;
};

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 3,
};

const iconForType = (type: string): { icon: AppIconName; iconBg: string; color: string } => {
  if (type.includes('accepted')) return { icon: 'approved', iconBg: '#E8F7EE', color: '#217A3C' };
  if (type.includes('rejected')) return { icon: 'currency', iconBg: '#FEE2E2', color: '#EF4444' };
  if (type.includes('counter')) return { icon: 'farmSize', iconBg: '#EDE9FE', color: '#7C3AED' };
  if (type.includes('created') || type.includes('offer')) return { icon: 'currency', iconBg: '#EEF6FF', color: '#3B82F6' };
  return { icon: 'notificationWarning', iconBg: '#FFFDE6', color: '#F3CD03' };
};

const timeAgo = (dateStr: string): string => {
  const ms = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const groupByDay = (items: ApiNotification[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const groups: { title: string; items: ApiNotification[] }[] = [];
  const map: Record<string, ApiNotification[]> = {};

  for (const item of items) {
    const d = new Date(item.created_at);
    d.setHours(0, 0, 0, 0);
    let key: string;
    if (d.getTime() === today.getTime()) key = 'TODAY';
    else if (d.getTime() === yesterday.getTime()) key = 'YESTERDAY';
    else key = 'EARLIER';
    if (!map[key]) map[key] = [];
    map[key].push(item);
  }

  for (const key of ['TODAY', 'YESTERDAY', 'EARLIER']) {
    if (map[key]?.length) groups.push({ title: key, items: map[key] });
  }
  return groups;
};

const NotificationsScreen = ({ navigation }: any) => {
  const user = useAppSelector(s => s.auth.user);
  const mode = user?.role ?? 'buyer';

  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res: any = await api.profile.notificationList({ limit: 50, offset: 0 });
      const data = res?.data ?? res;
      setNotifications(data?.items ?? []);
      setUnread(data?.unread ?? 0);
    } catch (e) {
      console.log('[Notifications] fetch error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markRead = async (id: string) => {
    try {
      await api.profile.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n),
      );
      setUnread(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleTap = (item: ApiNotification) => {
    console.log('[Notifications] handleTap item:', JSON.stringify({
      id: item.id,
      type: item.type,
      entity_type: item.entity_type,
      entity_id: item.entity_id,
      recipient_role: item.recipient_role,
    }));
    if (!item.is_read) markRead(item.id);
    if (item.entity_type === 'offer' && item.entity_id) {
      const offerMode = item.recipient_role ?? mode;
      console.log('[Notifications] → navigate Negotiation offerId:', item.entity_id, 'mode:', offerMode);
      navigation.navigate('Negotiation', { offerId: item.entity_id, mode: offerMode });
    } else if (item.entity_type === 'listing' && item.entity_id) {
      const postType: 'supply' | 'demand' = item.recipient_role === 'seller' ? 'supply' : 'demand';
      console.log('[Notifications] → navigate PostDetail postId:', item.entity_id, 'post_type:', postType);
      navigation.navigate('PostDetail', { postId: item.entity_id, post_type: postType });
    } else if (item.entity_type === 'dispute' && item.entity_id) {
      console.log('[Notifications] → navigate DisputeDetail disputeId:', item.entity_id);
      navigation.navigate('DisputeDetail', { disputeId: item.entity_id });
    } else if (item.entity_type === 'deal' && item.entity_id) {
      console.log('[Notifications] → navigate DealDetail dealId:', item.entity_id, 'mode:', item.recipient_role);
      navigation.navigate('DealDetail', { dealId: item.entity_id, ...(item.recipient_role ? { mode: item.recipient_role } : {}) });
    } else {
      console.log('[Notifications] handleTap: no navigation — entity_type:', item.entity_type, 'entity_id:', item.entity_id);
    }
  };

  const markAllRead = async () => {
    try {
      await api.profile.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnread(0);
    } catch {}
  };

  const sections = groupByDay(notifications);

  return (
    <View style={styles.container}>
      <MockStatusBar backgroundColor="#0D3B1F" textColor="#FFFFFF" />

      <View style={styles.header}>
        <View style={styles.headerGlow} />
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.75}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <AppIcon name="back" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.subtitle}>{unread} unread</Text>
          </View>

          {unread > 0 ? (
            <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead} activeOpacity={0.8}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unread}</Text>
            </View>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator color="#217A3C" size="large" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centerWrap}>
          <AppIcon name="notificationWarning" size={36} color="#D1D5DB" />
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchNotifications(); }}
              tintColor="#217A3C"
            />
          }
        >
          {sections.map(section => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={[styles.card, CARD_SHADOW]}>
                {section.items.map((item, index) => {
                  const { icon, iconBg, color } = iconForType(item.type);
                  const isLast = index === section.items.length - 1;
                  const tappable = !!item.entity_id && (item.entity_type === 'offer' || item.entity_type === 'listing' || item.entity_type === 'dispute' || item.entity_type === 'deal');

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.row,
                        !isLast && styles.rowBorder,
                        !item.is_read && styles.unreadRow,
                      ]}
                      activeOpacity={tappable ? 0.82 : 1}
                      onPress={() => handleTap(item)}
                    >
                      {!item.is_read && <View style={styles.unreadStrip} />}

                      <View style={[styles.iconBox, { backgroundColor: iconBg }, !item.is_read && styles.unreadIconOffset]}>
                        <AppIcon name={icon} size={17} color={color} />
                      </View>

                      <View style={styles.textWrap}>
                        <View style={styles.topRow}>
                          <Text style={[styles.itemTitle, !item.is_read && styles.unreadTitle]} numberOfLines={1}>
                            {item.title}
                          </Text>
                          <Text style={styles.itemTime}>{timeAgo(item.created_at)}</Text>
                        </View>
                        <Text style={styles.itemBody} numberOfLines={2}>{item.body}</Text>
                        {tappable && (
                          <View style={styles.tapHintRow}>
                            <Text style={styles.tapHint}>Tap to open</Text>
                            <AppIcon name="arrowRight" size={10} color="#217A3C" />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    backgroundColor: '#0D3B1F',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    overflow: 'hidden',
  },
  headerGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    right: -80,
    top: -92,
    borderRadius: 110,
    backgroundColor: '#1A6B34',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.13)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  title: { fontSize: 19, fontWeight: '800', color: '#FFFFFF' },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.47)', marginTop: 2 },
  badge: {
    backgroundColor: '#F3CD03',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '800', color: '#0D3B1F' },
  markAllBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  markAllText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 14, color: '#9CA3AF', fontWeight: '500' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 24 },
  section: { marginBottom: 8 },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.8,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    position: 'relative',
    alignItems: 'flex-start',
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  unreadRow: { backgroundColor: '#F2FBF5' },
  unreadStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#F3CD03',
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 11,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadIconOffset: { marginLeft: 6 },
  textWrap: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' },
  itemTitle: { fontSize: 13, fontWeight: '600', color: '#111827', flex: 1 },
  unreadTitle: { fontWeight: '800' },
  itemTime: { fontSize: 10, color: '#9CA3AF', flexShrink: 0, marginTop: 1 },
  itemBody: { fontSize: 12, color: '#6B7280', marginTop: 3, lineHeight: 17 },
  tapHintRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  tapHint: { fontSize: 10, color: '#217A3C', fontWeight: '600' },
});
