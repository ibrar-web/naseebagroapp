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
import { AppIcon } from '../../../assets/icons';
import MockStatusBar from '../../components/MockStatusBar';

type Props = NativeStackScreenProps<RootStackParamList, 'PostDetail'>;
type TabType = 'Post Details' | 'Offers Received';
type SellerOfferStatus = 'Awaiting' | 'Rejected' | 'Accepted';

const POSTS: Record<string, any> = {
  PD001: {
    id: 'DEM-001',
    name: 'Basmati Rice',
    qty: '150 bags',
    price: 'PKR 4,000/40kg',
    status: 'ACTIVE',
    image:
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&q=80',
    fallback: '#8A9A5B',
    details: {
      commodity: 'Basmati Rice',
      category: 'Grains & Rice',
      quantity: '150 bags (40kg each)',
      priceRange: 'PKR 3,800 - 4,200 / 40kg',
      deliveryCity: 'Lahore',
      deliveryDate: 'Within 7 days',
      paymentTerms: '30% advance, rest on delivery',
      quality: 'Grade A, 2024 harvest',
      notes:
        'Need clean, dry, free from impurities. Open to negotiation on bulk.',
      posted: 'Mar 28',
    },
    offers: [
      {
        id: 'SO-001',
        sellerId: 'SLR-1234',
        mill: 'Gujranwala Mill A',
        price: 'PKR 4,100/40kg',
        qty: '150 bags',
        payment: '30 Days',
        delivery: '5 Days',
        status: 'Awaiting',
        time: '2h ago',
        prompt: 'Tap to review and respond',
      },
      {
        id: 'SO-002',
        sellerId: 'SLR-5678',
        mill: 'Faisalabad Mill B',
        price: 'PKR 4,300/40kg',
        qty: '150 bags',
        payment: '30 Days',
        delivery: '5 Days',
        status: 'Rejected',
        time: '1d ago',
      },
      {
        id: 'SO-003',
        sellerId: 'SLR-9012',
        mill: 'Lahore Mill C',
        price: 'PKR 3,950/40kg',
        qty: '150 bags',
        payment: '30 Days',
        delivery: '5 Days',
        status: 'Accepted',
        time: '3d ago',
      },
    ],
  },
  PD002: {
    id: 'DEM-002',
    name: 'Punjab Wheat',
    qty: '300 bags',
    price: 'PKR 2,700/40kg',
    status: 'INACTIVE',
    image:
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=900&q=80',
    fallback: '#C29A4A',
    details: {
      commodity: 'Punjab Wheat',
      category: 'Grains',
      quantity: '300 bags (40kg each)',
      priceRange: 'PKR 2,600 - 2,800 / 40kg',
      deliveryCity: 'Faisalabad',
      deliveryDate: 'Within 10 days',
      paymentTerms: 'Full payment on delivery',
      quality: 'Clean grain, moisture below 12%',
      notes: 'Prefer nearby mills with quick dispatch.',
      posted: 'Mar 25',
    },
    offers: [],
  },
  PD003: {
    id: 'DEM-003',
    name: 'Desi Cotton',
    qty: '50 bales',
    price: 'PKR 8,200/40kg',
    status: 'AGING',
    image:
      'https://images.unsplash.com/photo-1594179047519-f347310d3322?w=900&q=80',
    fallback: '#D8D6C7',
    details: {
      commodity: 'Desi Cotton',
      category: 'Cotton',
      quantity: '50 bales',
      priceRange: 'PKR 8,000 - 8,500 / 40kg',
      deliveryCity: 'Multan',
      deliveryDate: 'Within 14 days',
      paymentTerms: '50% advance',
      quality: 'Grade A, manually picked',
      notes: 'For spinning mill use.',
      posted: 'Mar 24',
    },
    offers: [],
  },
  PD004: {
    id: 'DEM-004',
    name: 'Yellow Maize',
    qty: '300 bags',
    price: 'PKR 1,900/40kg',
    status: 'ACTIVE',
    image:
      'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=900&q=80',
    fallback: '#DCA640',
    details: {
      commodity: 'Yellow Maize',
      category: 'Grains',
      quantity: '300 bags (40kg each)',
      priceRange: 'PKR 1,850 - 1,950 / 40kg',
      deliveryCity: 'Okara',
      deliveryDate: 'Within 5 days',
      paymentTerms: 'Advance payment',
      quality: 'Machine cleaned',
      notes: 'Delivery required this week.',
      posted: 'Apr 8',
    },
    offers: [],
  },
};

const OFFER_DETAILS: Record<string, any> = {
  PO001: {
    id: 'OFF-001',
    title: 'Punjab Wheat',
    image:
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=900&q=80',
    fallback: '#C29A4A',
    myOffer: 'PKR 2,750/40kg',
    qty: '300 bags',
    mill: 'Faisalabad Mill A',
    payment: '30 days',
    alert: 'Counter Received — Respond Now',
    history: [
      {
        actor: '🛒 BYR-4821',
        badge: 'YOU',
        title: 'Initial Offer',
        time: 'Mar 27 · 10:15 AM',
        price: 'PKR 2,750',
      },
      {
        actor: '📦 SLR-7634',
        title: 'Counter Offer',
        time: 'Mar 27 · 02:30 PM',
        price: 'PKR 2,900',
      },
    ],
  },
  PO002: {
    id: 'OFF-002',
    title: 'Basmati Rice',
    image:
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&q=80',
    fallback: '#8A9A5B',
    myOffer: 'PKR 4,100/40kg',
    qty: '100 bags',
    mill: 'Gujranwala Mill B',
    payment: '30 days',
    alert: 'Pending seller response',
    history: [
      {
        actor: '🛒 BYR-4821',
        badge: 'YOU',
        title: 'Initial Offer',
        time: 'Mar 25 · 11:20 AM',
        price: 'PKR 4,100',
      },
    ],
  },
  PO003: {
    id: 'OFF-003',
    title: 'Desi Cotton',
    image:
      'https://images.unsplash.com/photo-1594179047519-f347310d3322?w=900&q=80',
    fallback: '#D8D6C7',
    myOffer: 'PKR 8,400/40kg',
    qty: '30 bales',
    mill: 'Multan Mill C',
    payment: '30 days',
    alert: 'Accepted offer',
    history: [
      {
        actor: '📦 SLR-5521',
        title: 'Seller Offer',
        time: 'Mar 22 · 09:05 AM',
        price: 'PKR 8,400',
      },
      {
        actor: '🛒 BYR-4821',
        badge: 'YOU',
        title: 'Accepted',
        time: 'Mar 22 · 02:10 PM',
        price: 'PKR 8,400',
      },
    ],
  },
  PO004: {
    id: 'OFF-004',
    title: 'Yellow Maize',
    image:
      'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=900&q=80',
    fallback: '#DCA640',
    myOffer: 'PKR 1,850/40kg',
    qty: '150 bags',
    mill: 'Okara Mill D',
    payment: '30 days',
    alert: 'Offer rejected',
    history: [
      {
        actor: '🛒 BYR-4821',
        badge: 'YOU',
        title: 'Initial Offer',
        time: 'Mar 20 · 01:40 PM',
        price: 'PKR 1,850',
      },
    ],
  },
};

const statusConfig = (status: string) => {
  if (status === 'AGING') {
    return { bg: '#D97706', text: '#FFFFFF', dot: '#FFFFFF' };
  }
  if (status === 'INACTIVE') {
    return { bg: '#6B7280', text: '#FFFFFF', dot: '#FFFFFF' };
  }
  return { bg: '#217A3C', text: '#FFFFFF', dot: '#FFFFFF' };
};

const sellerOfferConfig = (status: SellerOfferStatus) => {
  switch (status) {
    case 'Awaiting':
      return {
        bg: '#FEF3C7',
        dot: '#92400E',
        text: '#92400E',
        border: 'rgba(46,158,82,0.2)',
        footerBg: 'rgba(46,158,82,0.05)',
        footerBorder: 'rgba(46,158,82,0.13)',
      };
    case 'Rejected':
      return {
        bg: '#FEE2E2',
        dot: '#EF4444',
        text: '#EF4444',
        border: '#F3F4F6',
        footerBg: '#FFFFFF',
        footerBorder: '#FFFFFF',
      };
    case 'Accepted':
      return {
        bg: '#E8F7EE',
        dot: '#1A6B34',
        text: '#1A6B34',
        border: '#F3F4F6',
        footerBg: '#FFFFFF',
        footerBorder: '#FFFFFF',
      };
  }
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const OfferStat = ({
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
  <View style={[styles.offerStat, { backgroundColor: bg }]}>
    <Text style={[styles.offerStatValue, { color }]}>{value}</Text>
    <Text style={styles.offerStatLabel}>{label}</Text>
  </View>
);

const SellerOfferCard = ({ offer }: { offer: any }) => {
  const config = sellerOfferConfig(offer.status);

  return (
    <TouchableOpacity
      style={[styles.sellerOfferCard, { borderColor: config.border }]}
      activeOpacity={0.88}
    >
      <View style={[styles.sellerOfferHeader, { backgroundColor: config.bg }]}>
        <View
          style={[styles.sellerOfferDot, { backgroundColor: config.dot }]}
        />
        <Text style={[styles.sellerOfferStatus, { color: config.text }]}>
          {offer.status}
        </Text>
        <Text style={styles.sellerOfferTime}>{offer.time}</Text>
      </View>

      <View style={styles.sellerOfferBody}>
        <View style={styles.sellerOfferMainRow}>
          <View style={styles.sellerOfferLeft}>
            <Text style={styles.sellerOfferId}>
              {offer.sellerId} · {offer.id}
            </Text>
            <Text style={styles.sellerOfferMill}>{offer.mill}</Text>
            <Text style={styles.sellerOfferPrice}>{offer.price}</Text>
          </View>
          <View style={styles.sellerOfferRight}>
            <Text style={styles.sellerOfferQty}>{offer.qty}</Text>
            <AppIcon name="chevronRight" size={18} color="#D1D5DB" />
          </View>
        </View>

        <View style={styles.offerChipsRow}>
          <View style={styles.offerChip}>
            <AppIcon name="bank" size={10} color="#9CA3AF" />
            <Text style={styles.offerChipText}>{offer.payment}</Text>
          </View>
          <View style={styles.offerChip}>
            <AppIcon name="notificationLogistics" size={10} color="#9CA3AF" />
            <Text style={styles.offerChipText}>{offer.delivery}</Text>
          </View>
        </View>
      </View>

      {offer.prompt ? (
        <View
          style={[
            styles.sellerOfferFooter,
            {
              backgroundColor: config.footerBg,
              borderTopColor: config.footerBorder,
            },
          ]}
        >
          <AppIcon name="notificationWarning" size={12} color="#217A3C" />
          <Text style={styles.sellerOfferPrompt}>{offer.prompt}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const PostDetailScreen = ({ navigation, route }: Props) => {
  const { postId } = route.params;
  const offerDetail = OFFER_DETAILS[postId];
  const post = POSTS[postId] ?? POSTS.PD001;
  const [activeTab, setActiveTab] = useState<TabType>('Offers Received');

  if (offerDetail) {
    return (
      <View style={styles.container}>
        <MockStatusBar backgroundColor="#FFFFFF" textColor="#111827" />
        <View style={styles.offerDetailHeader}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.offerBackBtn}
            activeOpacity={0.8}
          >
            <AppIcon name="back" size={22} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.offerDetailTitle}>Offer Detail</Text>
          <View style={styles.offerHeaderSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.offerDetailContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.offerHeroCard}>
            <ImageBackground
              source={{ uri: offerDetail.image }}
              resizeMode="cover"
              style={styles.offerHeroImage}
              imageStyle={{ backgroundColor: offerDetail.fallback }}
            >
              <View style={styles.compactHeroOverlay} />
              <View style={styles.compactHeroBottom}>
                <Text style={styles.compactHeroId}>{offerDetail.id}</Text>
                <Text style={styles.compactHeroTitle}>{offerDetail.title}</Text>
              </View>
              <View style={styles.anonymousPill}>
                <AppIcon
                  name="shield"
                  size={10}
                  color="rgba(255,255,255,0.8)"
                />
                <Text style={styles.anonymousText}>Anonymous</Text>
              </View>
            </ImageBackground>

            <View style={styles.offerSummaryBar}>
              {[
                ['YOUR OFFER', offerDetail.myOffer],
                ['QTY', offerDetail.qty],
                ['MILL', offerDetail.mill],
                ['PAYMENT', offerDetail.payment],
              ].map(([label, value], index) => (
                <View
                  key={label}
                  style={[
                    styles.offerSummaryItem,
                    index > 0 && styles.offerSummaryItemBorder,
                  ]}
                >
                  <Text style={styles.offerSummaryLabel}>{label}</Text>
                  <Text
                    style={[
                      styles.offerSummaryValue,
                      index === 0 && styles.offerSummaryPrice,
                    ]}
                    numberOfLines={1}
                  >
                    {value}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.counterNotice}>
            <View style={styles.counterNoticeDot} />
            <Text style={styles.counterNoticeText}>{offerDetail.alert}</Text>
          </View>

          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>Offer History</Text>
            {offerDetail.history.map((event: any, index: number) => (
              <View
                key={`${event.title}-${index}`}
                style={[
                  styles.historyRow,
                  index < offerDetail.history.length - 1 &&
                    styles.historyBorder,
                ]}
              >
                <View style={styles.historyLeft}>
                  <Text style={styles.historyActor}>
                    {event.actor}{' '}
                    {event.badge ? (
                      <Text style={styles.historyBadge}>{event.badge}</Text>
                    ) : null}
                  </Text>
                  <Text style={styles.historyEvent}>{event.title}</Text>
                  <Text style={styles.historyTime}>{event.time}</Text>
                </View>
                <Text style={styles.historyPrice}>{event.price}</Text>
              </View>
            ))}
          </View>

          <View style={styles.offerDetailActions}>
            <TouchableOpacity style={styles.negotiateBtn} activeOpacity={0.86}>
              <AppIcon name="notificationWarning" size={17} color="#0D3B1F" />
              <Text style={styles.negotiateBtnText}>Open Negotiation</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptDealBtn} activeOpacity={0.86}>
              <AppIcon name="approved" size={16} color="#FFFFFF" />
              <Text style={styles.acceptDealText}>Accept Deal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelOfferBtn}
              activeOpacity={0.84}
            >
              <Text style={styles.cancelOfferText}>Cancel Offer</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  const status = statusConfig(post.status);
  const offerStats = {
    total: String(post.offers.length),
    new: String(
      post.offers.filter((offer: any) => offer.status === 'Awaiting').length,
    ),
    accepted: String(
      post.offers.filter((offer: any) => offer.status === 'Accepted').length,
    ),
    rejected: String(
      post.offers.filter((offer: any) => offer.status === 'Rejected').length,
    ),
  };

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
      <View style={styles.offerStatsRow}>
        <OfferStat
          value={offerStats.total}
          label="TOTAL"
          bg="#F9FAFB"
          color="#374151"
        />
        <OfferStat
          value={offerStats.new}
          label="NEW"
          bg="#EEF6FF"
          color="#3B82F6"
        />
        <OfferStat
          value={offerStats.accepted}
          label="ACCEPTED"
          bg="#E8F7EE"
          color="#1A6B34"
        />
        <OfferStat
          value={offerStats.rejected}
          label="REJECTED"
          bg="#FEE2E2"
          color="#EF4444"
        />
      </View>

      {post.offers.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyTitle}>No offers yet</Text>
          <Text style={styles.emptySubtitle}>
            Mills will respond to your demand soon
          </Text>
        </View>
      ) : (
        <View style={styles.sellerOfferList}>
          {post.offers.map((offer: any) => (
            <SellerOfferCard key={offer.id} offer={offer} />
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <MockStatusBar
          absolute
          backgroundColor="transparent"
          textColor="#FFFFFF"
        />
        <ImageBackground
          source={{ uri: post.image }}
          style={styles.heroImage}
          resizeMode="cover"
          imageStyle={{ backgroundColor: post.fallback }}
        >
          <View style={styles.heroOverlay} />

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.85}
          >
            <AppIcon name="back" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.heroRightActions}>
            <View
              style={[styles.heroStatusBadge, { backgroundColor: status.bg }]}
            >
              <View
                style={[styles.heroStatusDot, { backgroundColor: status.dot }]}
              />
              <Text style={[styles.heroStatusText, { color: status.text }]}>
                {post.status}
              </Text>
            </View>
            <View style={styles.optionsBtn}>
              <Text style={styles.optionsDots}>⋮</Text>
            </View>
          </View>

          <View style={styles.heroBottom}>
            <Text style={styles.heroId}>{post.id}</Text>
            <Text style={styles.heroName}>{post.name}</Text>
            <Text style={styles.heroMeta}>
              {post.qty} · {post.price}
            </Text>
          </View>
        </ImageBackground>
      </View>

      <View style={styles.tabBar}>
        {(['Post Details', 'Offers Received'] as TabType[]).map(tab => {
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
                {tab === 'Offers Received'
                  ? `Offers Received (${post.offers.length})`
                  : tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'Post Details' ? renderPostDetails() : renderOffers()}
      </ScrollView>

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
  scroll: { flex: 1 },
  hero: { height: 180, flexShrink: 0, overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.62)',
  },
  backBtn: {
    position: 'absolute',
    top: 44,
    left: 14,
    zIndex: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRightActions: {
    position: 'absolute',
    top: 44,
    right: 14,
    zIndex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroStatusBadge: {
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroStatusDot: { width: 5, height: 5, borderRadius: 3 },
  heroStatusText: { fontSize: 10, fontWeight: '800' },
  optionsBtn: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(0,0,0,0.45)',
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
  heroBottom: { position: 'absolute', bottom: 14, left: 16, zIndex: 3 },
  heroId: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'monospace',
    marginBottom: 3,
  },
  heroName: { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
  heroMeta: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
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
  scrollContent: { padding: 14, paddingBottom: 118 },
  offerStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  offerStat: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  offerStatValue: { fontSize: 18, fontWeight: '900' },
  offerStatLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 2,
  },
  sellerOfferList: { gap: 10 },
  sellerOfferCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  sellerOfferHeader: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  sellerOfferDot: { width: 6, height: 6, borderRadius: 3 },
  sellerOfferStatus: { flex: 1, fontSize: 10, fontWeight: '700' },
  sellerOfferTime: { fontSize: 10, color: '#9CA3AF' },
  sellerOfferBody: { paddingHorizontal: 14, paddingVertical: 12 },
  sellerOfferMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  sellerOfferLeft: { flex: 1 },
  sellerOfferId: {
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: 'monospace',
    marginBottom: 3,
  },
  sellerOfferMill: { fontSize: 13, fontWeight: '700', color: '#111827' },
  sellerOfferPrice: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1A6B34',
    marginTop: 2,
  },
  sellerOfferRight: { alignItems: 'flex-end', gap: 4 },
  sellerOfferQty: { fontSize: 12, color: '#6B7280' },
  offerChipsRow: { flexDirection: 'row', gap: 7, flexWrap: 'wrap' },
  offerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F9FAFB',
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  offerChipText: { fontSize: 11, color: '#4B5563' },
  sellerOfferFooter: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sellerOfferPrompt: { fontSize: 11, fontWeight: '600', color: '#1A6B34' },
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
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  detailLabel: { fontSize: 12, color: '#6B7280', flex: 1 },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'right',
  },
  notesText: { fontSize: 13, color: '#4B5563', lineHeight: 20 },
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
  offerDetailHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  offerBackBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerDetailTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  offerHeaderSpacer: { width: 30 },
  offerDetailContent: { padding: 14, paddingBottom: 100 },
  offerHeroCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  offerHeroImage: { height: 90, width: '100%' },
  compactHeroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  compactHeroBottom: {
    position: 'absolute',
    bottom: 10,
    left: 14,
    zIndex: 2,
  },
  compactHeroId: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'monospace',
    marginBottom: 1,
  },
  compactHeroTitle: { fontSize: 16, fontWeight: '900', color: '#FFFFFF' },
  anonymousPill: {
    position: 'absolute',
    top: 10,
    right: 12,
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  anonymousText: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
  },
  offerSummaryBar: {
    backgroundColor: '#145228',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
  },
  offerSummaryItem: { flex: 1 },
  offerSummaryItemBorder: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.13)',
    paddingLeft: 8,
  },
  offerSummaryLabel: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.33)',
    marginBottom: 2,
  },
  offerSummaryValue: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  offerSummaryPrice: { color: '#F7DB4A' },
  counterNotice: {
    backgroundColor: '#FFFDE6',
    borderWidth: 1,
    borderColor: 'rgba(243,205,3,0.27)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 16,
  },
  counterNoticeDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#F3CD03',
  },
  counterNoticeText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  historyBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  historyLeft: { flex: 1 },
  historyActor: { fontSize: 11, color: '#6B7280', marginBottom: 2 },
  historyBadge: {
    backgroundColor: '#F2FBF5',
    color: '#1A6B34',
    fontSize: 9,
    fontWeight: '700',
  },
  historyEvent: { fontSize: 12, fontWeight: '600', color: '#374151' },
  historyTime: { fontSize: 10, color: '#9CA3AF', marginTop: 1 },
  historyPrice: { fontSize: 16, fontWeight: '900', color: '#1A6B34' },
  offerDetailActions: { gap: 10 },
  negotiateBtn: {
    backgroundColor: '#F3CD03',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#F3CD03',
    shadowOpacity: 0.33,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  negotiateBtnText: { fontSize: 15, fontWeight: '600', color: '#0D3B1F' },
  acceptDealBtn: {
    backgroundColor: '#217A3C',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#2E9E52',
    shadowOpacity: 0.27,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  acceptDealText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  cancelOfferBtn: {
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  cancelOfferText: { fontSize: 13, fontWeight: '700', color: '#EF4444' },
});

export default PostDetailScreen;
