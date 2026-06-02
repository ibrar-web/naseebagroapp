import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import { AppIcon } from '../../../assets/icons';
import MockStatusBar from '../../components/MockStatusBar';

type PostStatus = 'Active' | 'Fresh' | 'Stale' | 'Aging' | 'Inactive';

interface PostItem {
  id: string;
  demId: string;
  title: string;
  price: string;
  mills: number;
  qty: string;
  date: string;
  status: PostStatus;
  image: string;
  fallback: string;
}

type OfferStatus = 'Counter Received' | 'Pending' | 'Accepted' | 'Rejected';
type OfferRole = 'YOUR OFFER' | 'SELLER OFFER';

interface OfferItem {
  id: string;
  offerId: string;
  title: string;
  mill: string;
  price: string;
  counterPrice?: string;
  qty: string;
  sentDate: string;
  status: OfferStatus;
  role: OfferRole;
  roleIcon: string;
  actionText: string;
}

const MY_DEMANDS: PostItem[] = [
  {
    id: 'PD001',
    demId: 'DEM-001',
    title: 'Basmati Rice',
    price: 'PKR 4,000/40kg',
    mills: 2,
    qty: '150 bags',
    date: 'Mar 28',
    status: 'Fresh',
    image:
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&q=80',
    fallback: '#8A9A5B',
  },
  {
    id: 'PD002',
    demId: 'DEM-002',
    title: 'Punjab Wheat',
    price: 'PKR 2,700/40kg',
    mills: 1,
    qty: '300 bags',
    date: 'Mar 25',
    status: 'Stale',
    image:
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=900&q=80',
    fallback: '#C29A4A',
  },
  {
    id: 'PD003',
    demId: 'DEM-003',
    title: 'Desi Cotton',
    price: 'PKR 8,200/40kg',
    mills: 3,
    qty: '50 bales',
    date: 'Mar 24',
    status: 'Aging',
    image:
      'https://images.unsplash.com/photo-1594179047519-f347310d3322?w=900&q=80',
    fallback: '#D8D6C7',
  },
  {
    id: 'PD004',
    demId: 'DEM-004',
    title: 'Yellow Maize',
    price: 'PKR 1,900/40kg',
    mills: 2,
    qty: '300 bags',
    date: 'Apr 8',
    status: 'Active',
    image:
      'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=900&q=80',
    fallback: '#DCA640',
  },
];

const MY_OFFERS: OfferItem[] = [
  {
    id: 'PO001',
    offerId: 'OFF-001',
    title: 'Punjab Wheat',
    mill: 'Faisalabad Mill A',
    price: 'PKR 2,750/40kg',
    counterPrice: 'PKR 2,900/40kg',
    qty: '300 bags',
    sentDate: 'Sent Mar 27',
    status: 'Counter Received',
    role: 'YOUR OFFER',
    roleIcon: '🛒',
    actionText: 'Counter received — respond',
  },
  {
    id: 'PO002',
    offerId: 'OFF-002',
    title: 'Basmati Rice',
    mill: 'Gujranwala Mill B',
    price: 'PKR 4,100/40kg',
    qty: '100 bags',
    sentDate: 'Sent Mar 25',
    status: 'Pending',
    role: 'YOUR OFFER',
    roleIcon: '🛒',
    actionText: 'View detail',
  },
  {
    id: 'PO003',
    offerId: 'OFF-003',
    title: 'Desi Cotton',
    mill: 'Multan Mill C',
    price: 'PKR 8,400/40kg',
    qty: '30 bales',
    sentDate: 'Sent Mar 22',
    status: 'Accepted',
    role: 'SELLER OFFER',
    roleIcon: '📦',
    actionText: 'View Deal →',
  },
  {
    id: 'PO004',
    offerId: 'OFF-004',
    title: 'Yellow Maize',
    mill: 'Okara Mill D',
    price: 'PKR 1,850/40kg',
    qty: '150 bags',
    sentDate: 'Sent Mar 20',
    status: 'Rejected',
    role: 'YOUR OFFER',
    roleIcon: '🛒',
    actionText: 'View detail',
  },
];

const TABS = ['My Demands', 'My Offers'] as const;
type TabType = (typeof TABS)[number];

const statusConfig = (status: PostStatus) => {
  switch (status) {
    case 'Active':
      return {
        bg: '#217A3C',
        dot: '#FFFFFF',
        text: '#FFFFFF',
        label: 'ACTIVE',
      };
    case 'Fresh':
      return {
        bg: '#217A3C',
        dot: '#FFFFFF',
        text: '#FFFFFF',
        label: 'ACTIVE',
      };
    case 'Inactive':
      return {
        bg: '#6B7280',
        dot: '#FFFFFF',
        text: '#FFFFFF',
        label: 'INACTIVE',
      };
    case 'Stale':
      return {
        bg: '#6B7280',
        dot: '#FFFFFF',
        text: '#FFFFFF',
        label: 'INACTIVE',
      };
    case 'Aging':
      return { bg: '#D97706', dot: '#FFFFFF', text: '#FFFFFF', label: 'AGING' };
  }
};

const tagConfig = (status: PostStatus) => {
  switch (status) {
    case 'Fresh':
    case 'Active':
      return { bg: '#F2FBF5', dot: '#2E9E52', text: '#1A6B34', label: status };
    case 'Stale':
      return { bg: '#FEE2E2', dot: '#EF4444', text: '#EF4444', label: 'Stale' };
    case 'Aging':
      return { bg: '#FEF3C7', dot: '#E8A838', text: '#92400E', label: 'Aging' };
    case 'Inactive':
      return {
        bg: '#F3F4F6',
        dot: '#9CA3AF',
        text: '#9CA3AF',
        label: 'Inactive',
      };
  }
};

const offerStatusConfig = (status: OfferStatus) => {
  switch (status) {
    case 'Counter Received':
      return {
        cardBorder: '#F3CD03',
        shadow: '#F3CD03',
        headerBg: '#FEF3C7',
        dot: '#E8A838',
        text: '#92400E',
        actionColor: '#F3CD03',
        respond: true,
      };
    case 'Pending':
      return {
        cardBorder: 'transparent',
        shadow: '#000000',
        headerBg: '#F3F4F6',
        dot: '#9CA3AF',
        text: '#4B5563',
        actionColor: '#9CA3AF',
        respond: false,
      };
    case 'Accepted':
      return {
        cardBorder: 'transparent',
        shadow: '#000000',
        headerBg: '#E8F7EE',
        dot: '#2E9E52',
        text: '#1A6B34',
        actionColor: '#217A3C',
        respond: false,
      };
    case 'Rejected':
      return {
        cardBorder: 'transparent',
        shadow: '#000000',
        headerBg: '#FEE2E2',
        dot: '#EF4444',
        text: '#EF4444',
        actionColor: '#9CA3AF',
        respond: false,
      };
  }
};

const PostCard = ({
  item,
  onPress,
}: {
  item: PostItem;
  onPress: () => void;
}) => {
  const sBadge = statusConfig(item.status);
  const sTag = tagConfig(item.status);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.card}
      activeOpacity={0.88}
    >
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.cardImage}
        resizeMode="cover"
        imageStyle={{ backgroundColor: item.fallback }}
      >
        <View style={styles.imageOverlay} />

        {/* Status badge — top left */}
        <View style={[styles.statusBadge, { backgroundColor: sBadge.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: sBadge.dot }]} />
          <Text style={[styles.statusText, { color: sBadge.text }]}>
            {sBadge.label}
          </Text>
        </View>

        {/* Options — top right */}
        <View style={styles.optionsBtn}>
          <Text style={styles.optionsDots}>⋮</Text>
        </View>

        {/* Product info — bottom left */}
        <View style={styles.imageBottom}>
          <Text style={styles.imageId}>{item.demId}</Text>
          <Text style={styles.imageTitle}>{item.title}</Text>
        </View>
      </ImageBackground>

      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <Text style={styles.priceText}>{item.price}</Text>
          <Text style={styles.millsText}>
            {item.mills} {item.mills === 1 ? 'mill' : 'mills'}
          </Text>
        </View>

        <View style={styles.tagsRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.qty}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Posted {item.date}</Text>
          </View>
          <View
            style={[
              styles.tag,
              {
                backgroundColor: sTag.bg,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              },
            ]}
          >
            <View style={[styles.tagDot, { backgroundColor: sTag.dot }]} />
            <Text
              style={[styles.tagText, { color: sTag.text, fontWeight: '700' }]}
            >
              {sTag.label}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const OfferCard = ({
  item,
  onPress,
}: {
  item: OfferItem;
  onPress: () => void;
}) => {
  const config = offerStatusConfig(item.status);
  const roleColor = item.role === 'YOUR OFFER' ? '#3B82F6' : '#217A3C';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.offerListCard,
        {
          borderColor: config.cardBorder,
          shadowColor: config.shadow,
          shadowOpacity: config.respond ? 0.2 : 0.07,
        },
      ]}
      activeOpacity={0.88}
    >
      <View
        style={[styles.offerListHeader, { backgroundColor: config.headerBg }]}
      >
        <View
          style={[styles.offerStatusDot, { backgroundColor: config.dot }]}
        />
        <Text style={[styles.offerListStatus, { color: config.text }]}>
          {item.status}
        </Text>
        <View style={styles.offerRolePill}>
          <Text style={styles.offerRoleIcon}>{item.roleIcon}</Text>
          <Text style={[styles.offerRoleText, { color: roleColor }]}>
            {item.role}
          </Text>
        </View>
        {config.respond ? (
          <View style={styles.respondPill}>
            <Text style={styles.respondPillText}>RESPOND</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.offerListBody}>
        <View style={styles.offerMainRow}>
          <View style={styles.offerLeft}>
            <Text style={styles.offerId}>{item.offerId}</Text>
            <Text style={styles.offerTitle}>{item.title}</Text>
            <View style={styles.offerMillRow}>
              <AppIcon name="business" size={10} color="#9CA3AF" />
              <Text style={styles.offerMillText}>{item.mill}</Text>
            </View>
          </View>
          <View style={styles.offerRight}>
            <Text style={styles.offerPrice}>{item.price}</Text>
            {item.counterPrice ? (
              <Text style={styles.offerCounterPrice}>
                ↔ {item.counterPrice}
              </Text>
            ) : null}
            <Text style={styles.offerQty}>{item.qty}</Text>
          </View>
        </View>

        <View style={styles.offerFooterRow}>
          <Text style={styles.offerSent}>{item.sentDate}</Text>
          <View style={styles.offerActionRow}>
            <AppIcon
              name={
                item.status === 'Accepted' ? 'approved' : 'notificationWarning'
              }
              size={12}
              color={config.actionColor}
            />
            <Text
              style={[styles.offerActionText, { color: config.actionColor }]}
            >
              {item.actionText}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const MyPostsScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<TabType>('My Demands');
  const isOffersTab = activeTab === 'My Offers';
  const data: Array<PostItem | OfferItem> = isOffersTab
    ? MY_OFFERS
    : MY_DEMANDS;

  return (
    <View style={styles.screen}>
      <MockStatusBar backgroundColor="#145228" textColor="#FFFFFF" />
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Posts</Text>
          <Text style={styles.headerSub}>Your demands &amp; offers</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('PrePost')}
          style={styles.newButton}
          activeOpacity={0.82}
        >
          <AppIcon name="tabPost" size={16} color="#0D3B1F" />
          <Text style={styles.newButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map(tab => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              activeOpacity={0.75}
            >
              <Text
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={data}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) =>
          isOffersTab ? (
            <OfferCard
              item={item as OfferItem}
              onPress={() =>
                navigation.navigate('OfferDetail', { offerId: item.id })
              }
            />
          ) : (
            <PostCard
              item={item as PostItem}
              onPress={() =>
                navigation.navigate('PostDetail', { postId: item.id })
              }
            />
          )
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptySub}>
              Tap + New to create your first post
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    backgroundColor: '#145228',
    paddingTop: 6,
    paddingBottom: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.53)', marginTop: 2 },
  newButton: {
    backgroundColor: '#F3CD03',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  newButtonText: { fontSize: 12, fontWeight: '700', color: '#0D3B1F' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: '#217A3C' },
  tabLabel: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
  tabLabelActive: { fontWeight: '700', color: '#1A6B34' },
  listContent: { padding: 14, paddingBottom: 100, gap: 14 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  cardImage: { width: '100%', height: 110 },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    left: 12,
    zIndex: 3,
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 9, fontWeight: '800' },
  optionsBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 15,
    width: 32,
    height: 32,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsDots: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '900',
    lineHeight: 20,
  },
  imageBottom: { position: 'absolute', bottom: 10, left: 12, zIndex: 3 },
  imageId: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.55)',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  imageTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  cardBody: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 14 },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceText: { fontSize: 14, fontWeight: '800', color: '#1A6B34' },
  millsText: { fontSize: 11, color: '#6B7280' },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    alignItems: 'center',
  },
  tag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  tagText: { fontSize: 11, color: '#4B5563' },
  tagDot: { width: 5, height: 5, borderRadius: 3 },
  offerListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  offerListHeader: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  offerStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    flexShrink: 0,
  },
  offerListStatus: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
  },
  offerRolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  offerRoleIcon: { fontSize: 14 },
  offerRoleText: { fontSize: 9, fontWeight: '700' },
  respondPill: {
    backgroundColor: '#F3CD03',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  respondPillText: { fontSize: 9, fontWeight: '800', color: '#0D3B1F' },
  offerListBody: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  offerMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 10,
  },
  offerLeft: { flex: 1 },
  offerId: {
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  offerTitle: { fontSize: 15, fontWeight: '800', color: '#111827' },
  offerMillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  offerMillText: { fontSize: 11, color: '#6B7280' },
  offerRight: { alignItems: 'flex-end' },
  offerPrice: { fontSize: 14, fontWeight: '900', color: '#1A6B34' },
  offerCounterPrice: {
    fontSize: 11,
    color: '#F3CD03',
    marginTop: 2,
    fontWeight: '700',
  },
  offerQty: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  offerFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  offerSent: { fontSize: 10, color: '#9CA3AF' },
  offerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  offerActionText: { fontSize: 11, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 64, gap: 12 },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
});

export default MyPostsScreen;
