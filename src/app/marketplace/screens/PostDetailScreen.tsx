import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PostDetail'>;

const POSTS: Record<string, any> = {
  PD001: {
    id: 'DEM-001',
    name: 'Basmati Rice',
    qty: '150 bags',
    price: 'PKR 4,000/40kg',
    status: 'Fresh',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&q=80',
    fallback: '#8A9A5B',
    stats: { views: '47', offers: '3', matches: '12', daysLeft: '9' },
    details: {
      commodity: 'Basmati Rice',
      category: 'Grains & Rice',
      quantity: '150 bags (40kg each)',
      priceRange: 'PKR 3,800 – 4,200 / 40kg',
      deliveryCity: 'Lahore',
      deliveryDate: 'Within 7 days',
      paymentTerms: '30% advance, rest on delivery',
      quality: 'Grade A, 2024 harvest',
      notes: 'Need clean, dry, free from impurities. Open to negotiation on bulk.',
      posted: 'Mar 28',
    },
    offers: [
      {
        id: 'OFF-001',
        mill: 'Gujranwala Mill A',
        location: 'Gujranwala, Punjab',
        price: 'PKR 4,100/40kg',
        qty: '150 bags',
        delivery: '3 days',
        status: 'New',
        time: '2h ago',
      },
      {
        id: 'OFF-002',
        mill: 'Faisalabad Mill B',
        location: 'Faisalabad, Punjab',
        price: 'PKR 3,950/40kg',
        qty: '150 bags',
        delivery: '5 days',
        status: 'New',
        time: '5h ago',
      },
      {
        id: 'OFF-003',
        mill: 'Sahiwal Mill A',
        location: 'Sahiwal, Punjab',
        price: 'PKR 4,050/40kg',
        qty: '100 bags',
        delivery: '4 days',
        status: 'Viewed',
        time: '1d ago',
      },
    ],
  },
  PD002: {
    id: 'DEM-002',
    name: 'IRRI-6 Rice',
    qty: '80 bags',
    price: 'PKR 4,200/40kg',
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&q=80',
    fallback: '#8A9A5B',
    stats: { views: '28', offers: '2', matches: '7', daysLeft: '12' },
    details: {
      commodity: 'IRRI-6 Rice',
      category: 'Grains & Rice',
      quantity: '80 bags (40kg each)',
      priceRange: 'PKR 4,000 – 4,400 / 40kg',
      deliveryCity: 'Lahore',
      deliveryDate: 'Within 5 days',
      paymentTerms: 'Full payment on delivery',
      quality: 'Grade A',
      notes: 'Moisture content below 14%.',
      posted: 'Apr 2',
    },
    offers: [
      {
        id: 'OFF-004',
        mill: 'Sheikhupura Mill A',
        location: 'Sheikhupura, Punjab',
        price: 'PKR 4,200/40kg',
        qty: '80 bags',
        delivery: '3 days',
        status: 'New',
        time: '3h ago',
      },
      {
        id: 'OFF-005',
        mill: 'Hafizabad Mill A',
        location: 'Hafizabad, Punjab',
        price: 'PKR 4,100/40kg',
        qty: '80 bags',
        delivery: '4 days',
        status: 'New',
        time: '8h ago',
      },
    ],
  },
  PD003: {
    id: 'DEM-003',
    name: 'Desi Cotton',
    qty: '50 bags',
    price: 'PKR 8,500/40kg',
    status: 'Fresh',
    image: 'https://images.unsplash.com/photo-1594179047519-f347310d3322?w=900&q=80',
    fallback: '#D8D6C7',
    stats: { views: '19', offers: '1', matches: '4', daysLeft: '14' },
    details: {
      commodity: 'Desi Cotton',
      category: 'Cotton',
      quantity: '50 bags (40kg each)',
      priceRange: 'PKR 8,000 – 9,000 / 40kg',
      deliveryCity: 'Faisalabad',
      deliveryDate: 'Within 10 days',
      paymentTerms: '50% advance',
      quality: 'Grade A, manually picked',
      notes: 'For spinning mill use.',
      posted: 'Apr 5',
    },
    offers: [
      {
        id: 'OFF-006',
        mill: 'Multan Mill A',
        location: 'Multan, Punjab',
        price: 'PKR 8,400/40kg',
        qty: '50 bags',
        delivery: '7 days',
        status: 'New',
        time: '1d ago',
      },
    ],
  },
};

const TABS = ['Post Details', 'Offers Received'] as const;
type TabType = (typeof TABS)[number];

const StatCard = ({
  value,
  label,
  bg,
  color,
}: {
  value: string;
  label: string;
  bg: string;
  color: string;
}) => (
  <View style={[styles.statCard, { backgroundColor: bg, borderColor: bg }]}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const PostDetailScreen = ({ navigation, route }: Props) => {
  const { postId } = route.params;
  const post = POSTS[postId] ?? POSTS['PD001'];
  const [activeTab, setActiveTab] = useState<TabType>('Offers Received');

  const renderPostDetails = () => (
    <View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Demand Details</Text>
        <DetailRow label="Commodity" value={post.details.commodity} />
        <DetailRow label="Category" value={post.details.category} />
        <DetailRow label="Quantity" value={post.details.quantity} />
        <DetailRow label="Price Range" value={post.details.priceRange} />
        <DetailRow label="Delivery City" value={post.details.deliveryCity} />
        <DetailRow label="Delivery Date" value={post.details.deliveryDate} />
        <DetailRow label="Payment Terms" value={post.details.paymentTerms} />
        <DetailRow label="Quality Required" value={post.details.quality} />
        <DetailRow label="Posted" value={post.details.posted} />
      </View>

      {post.details.notes ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Additional Notes</Text>
          <Text style={styles.notesText}>{post.details.notes}</Text>
        </View>
      ) : null}
    </View>
  );

  const renderOffers = () => (
    <View>
      {post.offers.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyTitle}>No offers yet</Text>
          <Text style={styles.emptySubtitle}>Mills will respond to your demand soon</Text>
        </View>
      ) : (
        post.offers.map((offer: any) => (
          <View key={offer.id} style={styles.offerCard}>
            <View style={styles.offerHeader}>
              <View style={styles.offerMillIcon}>
                <Text style={{ fontSize: 18 }}>🏭</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.offerMillName}>{offer.mill}</Text>
                <Text style={styles.offerLocation}>{offer.location}</Text>
              </View>
              <View style={styles.offerRight}>
                <View
                  style={[
                    styles.offerStatusBadge,
                    offer.status === 'New' ? styles.statusNew : styles.statusViewed,
                  ]}
                >
                  <Text
                    style={[
                      styles.offerStatusText,
                      offer.status === 'New' ? styles.statusNewText : styles.statusViewedText,
                    ]}
                  >
                    {offer.status}
                  </Text>
                </View>
                <Text style={styles.offerTime}>{offer.time}</Text>
              </View>
            </View>

            <View style={styles.offerDetails}>
              <View style={styles.offerDetailItem}>
                <Text style={styles.offerDetailLabel}>Price</Text>
                <Text style={styles.offerPrice}>{offer.price}</Text>
              </View>
              <View style={styles.offerDetailDivider} />
              <View style={styles.offerDetailItem}>
                <Text style={styles.offerDetailLabel}>Quantity</Text>
                <Text style={styles.offerDetailValue}>{offer.qty}</Text>
              </View>
              <View style={styles.offerDetailDivider} />
              <View style={styles.offerDetailItem}>
                <Text style={styles.offerDetailLabel}>Delivery</Text>
                <Text style={styles.offerDetailValue}>{offer.delivery}</Text>
              </View>
            </View>

            <View style={styles.offerActions}>
              <TouchableOpacity style={styles.rejectBtn} activeOpacity={0.85}>
                <Text style={styles.rejectBtnText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptBtn} activeOpacity={0.85}>
                <Text style={styles.acceptBtnText}>Accept Offer →</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        <ImageBackground
          source={{ uri: post.image }}
          style={styles.heroImage}
          resizeMode="cover"
          imageStyle={{ backgroundColor: post.fallback }}
        >
          <View style={styles.heroOverlay} />

          {/* Back button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          {/* Options button */}
          <View style={styles.optionsBtn}>
            <Text style={styles.optionsDots}>⋮</Text>
          </View>

          {/* Product info */}
          <View style={styles.heroBottom}>
            <Text style={styles.heroId}>{post.id}</Text>
            <Text style={styles.heroName}>{post.name}</Text>
            <Text style={styles.heroMeta}>{post.qty} · {post.price}</Text>
          </View>
        </ImageBackground>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatCard value={post.stats.views} label="Views" bg="#F9FAFB" color="#374151" />
        <StatCard value={post.stats.offers} label="Offers" bg="#EEF6FF" color="#3B82F6" />
        <StatCard value={post.stats.matches} label="Matches" bg="#F2FBF5" color="#1A6B34" />
        <StatCard value={post.stats.daysLeft} label="Days Left" bg="#FEE2E2" color="#EF4444" />
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
                {tab === 'Offers Received'
                  ? `Offers Received (${post.offers.length})`
                  : tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'Post Details' && renderPostDetails()}
        {activeTab === 'Offers Received' && renderOffers()}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.editBtn} activeOpacity={0.85}>
          <Text style={styles.editBtnText}>Edit Demand</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeBtn} activeOpacity={0.85}>
          <Text style={styles.closeBtnText}>Close Demand</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  hero: { height: 180, flexShrink: 0, overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.62)',
  },
  backBtn: {
    position: 'absolute',
    top: 44,
    left: 14,
    zIndex: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    padding: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: 18, color: '#FFFFFF', lineHeight: 20 },
  optionsBtn: {
    position: 'absolute',
    top: 44,
    right: 14,
    zIndex: 3,
    width: 32,
    height: 32,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsDots: { fontSize: 18, color: '#FFFFFF', fontWeight: '900', lineHeight: 20 },
  heroBottom: { position: 'absolute', bottom: 14, left: 16, zIndex: 3 },
  heroId: { fontSize: 9, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', marginBottom: 3 },
  heroName: { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
  heroMeta: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexShrink: 0,
  },
  statCard: {
    flex: 1,
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: { fontSize: 18, fontWeight: '900' },
  statLabel: { fontSize: 9, fontWeight: '600', color: '#9CA3AF', marginTop: 2 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexShrink: 0,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: '#217A3C' },
  tabLabel: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
  tabLabelActive: { fontWeight: '700', color: '#1A6B34' },
  scrollContent: { padding: 14, paddingBottom: 20 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 10 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: { fontSize: 12, color: '#6B7280', flex: 1 },
  detailValue: { fontSize: 12, fontWeight: '600', color: '#111827', flex: 1, textAlign: 'right' },
  notesText: { fontSize: 13, color: '#4B5563', lineHeight: 20 },
  offerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  offerMillIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F2FBF5',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  offerMillName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  offerLocation: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  offerRight: { alignItems: 'flex-end', gap: 3 },
  offerStatusBadge: { borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3 },
  offerStatusText: { fontSize: 10, fontWeight: '700' },
  statusNew: { backgroundColor: '#EEF6FF' },
  statusNewText: { color: '#3B82F6' },
  statusViewed: { backgroundColor: '#F3F4F6' },
  statusViewedText: { color: '#6B7280' },
  offerTime: { fontSize: 10, color: '#9CA3AF' },
  offerDetails: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: '#F9FAFB',
  },
  offerDetailItem: { flex: 1, alignItems: 'center' },
  offerDetailLabel: { fontSize: 9, fontWeight: '600', color: '#9CA3AF', marginBottom: 3, textTransform: 'uppercase' },
  offerPrice: { fontSize: 13, fontWeight: '800', color: '#1A6B34' },
  offerDetailValue: { fontSize: 12, fontWeight: '700', color: '#111827' },
  offerDetailDivider: { width: 1, backgroundColor: '#E5E7EB' },
  offerActions: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  rejectBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  rejectBtnText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  acceptBtn: {
    flex: 2,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#1A6B34',
  },
  acceptBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  emptyState: { alignItems: 'center', paddingTop: 48, gap: 10 },
  emptyEmoji: { fontSize: 36 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#374151' },
  emptySubtitle: { fontSize: 12, color: '#9CA3AF' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
    elevation: 8,
  },
  editBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1A6B3499',
  },
  editBtnText: { fontSize: 13, fontWeight: '700', color: '#1A6B34' },
  closeBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EF444499',
  },
  closeBtnText: { fontSize: 13, fontWeight: '700', color: '#EF4444' },
});

export default PostDetailScreen;
