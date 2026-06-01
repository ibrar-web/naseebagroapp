import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppIcon } from '../../../assets/icons';
import type { AppIconName } from '../../../assets/icons';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 3,
};

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  unread?: boolean;
  icon: AppIconName;
  iconBg: string;
  color: string;
};

type NotificationSection = {
  title: string;
  items: NotificationItem[];
};

const NOTIFICATION_SECTIONS: NotificationSection[] = [
  {
    title: 'TODAY',
    items: [
      {
        id: 'price-stale',
        title: 'Price Stale',
        body: 'Your Basmati Rice supply SUP-001 price is stale. Please refresh.',
        time: '2h ago',
        unread: true,
        icon: 'notificationWarning',
        iconBg: '#FFFDE6',
        color: '#F3CD03',
      },
      {
        id: 'offer-received',
        title: 'Offer Received',
        body: 'New offer on DEM-041 · Basmati Rice · PKR 4,100/40kg',
        time: '3h ago',
        unread: true,
        icon: 'currency',
        iconBg: '#EEF6FF',
        color: '#3B82F6',
      },
      {
        id: 'counter-offer',
        title: 'Counter Offer',
        body: 'Counter offer received on DEL-012 · PKR 2,450/40kg - respond now',
        time: '5h ago',
        unread: true,
        icon: 'farmSize',
        iconBg: '#EDE9FE',
        color: '#7C3AED',
      },
    ],
  },
  {
    title: 'YESTERDAY',
    items: [
      {
        id: 'offer-accepted',
        title: 'Offer Accepted',
        body: 'Your offer on DEM-038 has been accepted · Deal created',
        time: '1d ago',
        icon: 'approved',
        iconBg: '#E8F7EE',
        color: '#217A3C',
      },
      {
        id: 'document-approved',
        title: 'Document Approved',
        body: 'Payment proof for DEL-009 approved by Naseeb team',
        time: '1d ago',
        icon: 'shield',
        iconBg: '#F2FBF5',
        color: '#217A3C',
      },
      {
        id: 'deal-stage',
        title: 'Deal Stage Updated',
        body: 'DEL-007 is now In Transit · Track shipment',
        time: '1d ago',
        icon: 'notificationLogistics',
        iconBg: '#EDE9FE',
        color: '#7C3AED',
      },
    ],
  },
  {
    title: 'EARLIER',
    items: [
      {
        id: 'payment-pending',
        title: 'Payment Pending',
        body: 'Payment of PKR 840,000 pending for DEL-005 · Release after delivery',
        time: '2d ago',
        icon: 'bank',
        iconBg: '#E8F7EE',
        color: '#217A3C',
      },
      {
        id: 'payment-verified',
        title: 'Payment Verified',
        body: 'PKR 640,000 verified and payout initiated for DEL-003',
        time: '3d ago',
        icon: 'approved',
        iconBg: '#E8F7EE',
        color: '#217A3C',
      },
      {
        id: 'offer-rejected',
        title: 'Offer Rejected',
        body: 'Your offer on DEM-031 was not accepted. You may send a new offer.',
        time: '4d ago',
        icon: 'currency',
        iconBg: '#FEE2E2',
        color: '#EF4444',
      },
    ],
  },
];

const unreadCount = NOTIFICATION_SECTIONS.reduce(
  (total, section) =>
    total + section.items.filter(notification => notification.unread).length,
  0,
);

const NotificationsScreen = ({ navigation }: any) => (
  <View className="flex-1 bg-gray-50">
    <StatusBar
      barStyle="light-content"
      backgroundColor="rgb(13,59,31)"
      translucent={false}
    />

    <View className="px-5 pt-11 pb-4" style={styles.header}>
      <View style={styles.headerGlow} />
      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="rounded-xl items-center justify-center"
          style={styles.backButton}
          activeOpacity={0.75}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <AppIcon name="back" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <View>
          <Text className="text-white font-extrabold" style={styles.title}>
            Notifications
          </Text>
          <Text style={styles.subtitle}>{unreadCount} unread</Text>
        </View>

        <View className="ml-auto rounded-full px-2.5 py-1" style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount}</Text>
        </View>
      </View>
    </View>

    <ScrollView
      className="flex-1"
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {NOTIFICATION_SECTIONS.map(section => (
        <View key={section.title} className="mb-2">
          <Text className="text-gray-400 font-bold" style={styles.sectionTitle}>
            {section.title}
          </Text>
          <View className="bg-white rounded-2xl overflow-hidden" style={CARD_SHADOW}>
            {section.items.map((item, index) => {
              const isLast = index === section.items.length - 1;

              return (
                <TouchableOpacity
                  key={item.id}
                  className="flex-row"
                  style={[
                    styles.notificationRow,
                    !isLast && styles.notificationBorder,
                    item.unread && styles.unreadRow,
                  ]}
                  activeOpacity={0.82}
                >
                  {item.unread ? <View style={styles.unreadStrip} /> : null}

                  <View
                    className="items-center justify-center rounded-xl"
                    style={[
                      styles.iconBox,
                      {
                        backgroundColor: item.iconBg,
                        marginLeft: item.unread ? 6 : 0,
                      },
                    ]}
                  >
                    <AppIcon name={item.icon} size={17} color={item.color} />
                  </View>

                  <View className="flex-1">
                    <View className="flex-row justify-between items-start gap-2">
                      <Text
                        className="text-gray-900"
                        style={[
                          styles.itemTitle,
                          item.unread && styles.unreadTitle,
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text style={styles.itemTime}>{item.time}</Text>
                    </View>
                    <Text style={styles.itemBody}>{item.body}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}
    </ScrollView>
  </View>
);

export default NotificationsScreen;

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'rgb(13,59,31)',
    overflow: 'hidden',
  },
  headerGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    right: -80,
    top: -92,
    borderRadius: 110,
    backgroundColor: 'rgb(26,107,52)',
  },
  backButton: {
    width: 34,
    height: 34,
    backgroundColor: 'rgba(255,255,255,0.133)',
  },
  title: {
    fontSize: 19,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.467)',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#F3CD03',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgb(13,59,31)',
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 10,
    letterSpacing: 0.8,
    paddingTop: 10,
    paddingHorizontal: 2,
    paddingBottom: 6,
  },
  notificationRow: {
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    position: 'relative',
  },
  notificationBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  unreadRow: {
    backgroundColor: '#F2FBF5',
  },
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
    flexShrink: 0,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  unreadTitle: {
    fontWeight: '800',
  },
  itemTime: {
    fontSize: 10,
    color: '#9CA3AF',
    flexShrink: 0,
  },
  itemBody: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
    lineHeight: 17,
  },
});
