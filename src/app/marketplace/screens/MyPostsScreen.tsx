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
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&q=80',
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
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=900&q=80',
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
    image: 'https://images.unsplash.com/photo-1594179047519-f347310d3322?w=900&q=80',
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
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=900&q=80',
    fallback: '#DCA640',
  },
];

const MY_OFFERS: PostItem[] = [
  {
    id: 'PO001',
    demId: 'SUP-001',
    title: 'Basmati Rice',
    price: 'PKR 4,150/40kg',
    mills: 2,
    qty: '60 bags',
    date: 'Apr 1',
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&q=80',
    fallback: '#8A9A5B',
  },
  {
    id: 'PO002',
    demId: 'SUP-002',
    title: 'Mustard Seed',
    price: 'PKR 6,200/40kg',
    mills: 1,
    qty: '90 bags',
    date: 'Apr 3',
    status: 'Fresh',
    image: 'https://images.unsplash.com/photo-1535567465397-7523840f2ae9?w=900&q=80',
    fallback: '#D9A825',
  },
];

const TABS = ['My Demands', 'My Offers'] as const;
type TabType = (typeof TABS)[number];

const statusConfig = (status: PostStatus) => {
  switch (status) {
    case 'Active':
      return { bg: '#217A3C', dot: '#FFFFFF', text: '#FFFFFF', label: 'ACTIVE' };
    case 'Fresh':
      return { bg: '#217A3C', dot: '#FFFFFF', text: '#FFFFFF', label: 'ACTIVE' };
    case 'Inactive':
      return { bg: '#6B7280', dot: '#FFFFFF', text: '#FFFFFF', label: 'INACTIVE' };
    case 'Stale':
      return { bg: '#6B7280', dot: '#FFFFFF', text: '#FFFFFF', label: 'INACTIVE' };
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
      return { bg: '#F3F4F6', dot: '#9CA3AF', text: '#9CA3AF', label: 'Inactive' };
  }
};

const PostCard = ({ item, onPress }: { item: PostItem; onPress: () => void }) => {
  const sBadge = statusConfig(item.status);
  const sTag = tagConfig(item.status);

  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.88}>
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
          <Text style={[styles.statusText, { color: sBadge.text }]}>{sBadge.label}</Text>
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
          <View style={[styles.tag, { backgroundColor: sTag.bg, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
            <View style={[styles.tagDot, { backgroundColor: sTag.dot }]} />
            <Text style={[styles.tagText, { color: sTag.text, fontWeight: '700' }]}>{sTag.label}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const MyPostsScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<TabType>('My Demands');
  const data = activeTab === 'My Demands' ? MY_DEMANDS : MY_OFFERS;

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
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
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
        renderItem={({ item }) => (
          <PostCard
            item={item}
            onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptySub}>Tap + New to create your first post</Text>
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
    top: 0, left: 0, right: 0, bottom: 0,
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
  optionsDots: { fontSize: 18, color: '#FFFFFF', fontWeight: '900', lineHeight: 20 },
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
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, alignItems: 'center' },
  tag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  tagText: { fontSize: 11, color: '#4B5563' },
  tagDot: { width: 5, height: 5, borderRadius: 3 },
  empty: { alignItems: 'center', paddingTop: 64, gap: 12 },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
});

export default MyPostsScreen;
