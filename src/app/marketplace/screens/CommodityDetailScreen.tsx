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
import MockStatusBar from '../../components/MockStatusBar';

type Props = NativeStackScreenProps<RootStackParamList, 'CommodityDetail'>;

const COMMODITIES: Record<string, any> = {
  L001: {
    id: 'LST-2024-001',
    name: 'Basmati Rice',
    badge: 'PREMIUM',
    verified: true,
    category: 'Grains & Rice',
    grade: 'Grade A',
    totalStock: '500 bags',
    minOrder: '50 bags',
    deliveryOption: 'Delivered',
    startingPrice: 'PKR 4,200',
    paymentTerms: '30 Days after delivery',
    deliveryTerms: '3–5 business days',
    priceUpdated: '22 hours ago',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&q=80',
    fallback: '#8A9A5B',
    desc: 'Premium quality Basmati rice sourced directly from Gujranwala farms. Long grain, aromatic, and suitable for export and bulk domestic supply.',
    sellers: [
      { name: 'Gujranwala Mill A', location: 'Gujranwala, Punjab', price: 'PKR 4,200', unit: '/40kg', available: '200 bags' },
      { name: 'Faisalabad Mill B', location: 'Faisalabad, Punjab', price: 'PKR 4,150', unit: '/40kg', available: '150 bags' },
    ],
  },
  L002: {
    id: 'LST-2024-002',
    name: 'Punjab Wheat',
    badge: 'VERIFIED',
    verified: true,
    category: 'Grains & Wheat',
    grade: 'Grade B',
    totalStock: '1200 bags',
    minOrder: '100 bags',
    deliveryOption: 'Pick-up / Delivered',
    startingPrice: 'PKR 2,800',
    paymentTerms: '15 Days after delivery',
    deliveryTerms: '2–4 business days',
    priceUpdated: '5 hours ago',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=900&q=80',
    fallback: '#C29A4A',
    desc: 'High-yield Punjab wheat from central farms. Clean, dry, and free from impurities. Available for bulk purchase.',
    sellers: [
      { name: 'Faisalabad Mill B', location: 'Faisalabad, Punjab', price: 'PKR 2,800', unit: '/40kg', available: '500 bags' },
    ],
  },
};

const INFO_CARDS = [
  { key: 'category', label: 'Category' },
  { key: 'grade', label: 'Quality Grade' },
  { key: 'totalStock', label: 'Total Stock' },
  { key: 'minOrder', label: 'Min. Order' },
  { key: 'deliveryOption', label: 'Delivery Option' },
  { key: 'startingPrice', label: 'Starting Price', highlight: true },
];

const CommodityDetailScreen = ({ navigation, route }: Props) => {
  const { listingId } = route.params;
  const item = COMMODITIES[listingId] ?? COMMODITIES['L001'];
  const [saved, setSaved] = useState(false);

  return (
    <View style={styles.container}>
      {/* Hero Image */}
      <View style={styles.hero}>
        <MockStatusBar absolute backgroundColor="transparent" textColor="#FFFFFF" />
        <ImageBackground
          source={{ uri: item.image }}
          style={styles.heroImage}
          resizeMode="cover"
          imageStyle={{ backgroundColor: item.fallback }}
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

          {/* Heart button */}
          <TouchableOpacity
            onPress={() => setSaved(s => !s)}
            style={styles.heartBtn}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize: 16, color: saved ? '#EF4444' : '#6B7280' }}>
              {saved ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>

          {/* Product info at bottom */}
          <View style={styles.heroBottom}>
            <Text style={styles.heroId}>{item.id}</Text>
            <Text style={styles.heroName}>{item.name}</Text>
            <View style={styles.heroBadgeRow}>
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>{item.badge}</Text>
              </View>
              {item.verified && (
                <View style={styles.verifiedRow}>
                  <Text style={styles.verifiedDot}>✓</Text>
                  <Text style={styles.verifiedText}>Naseeb Verified</Text>
                </View>
              )}
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Price warning bar */}
      <View style={styles.warningBar}>
        <Text style={styles.warningIcon}>⚠</Text>
        <Text style={styles.warningText}>
          <Text style={{ fontWeight: '700' }}>Price may have changed.</Text>
          {'  '}Last updated {item.priceUpdated} ago.
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info grid */}
        <View style={styles.infoGrid}>
          {INFO_CARDS.map(card => (
            <View
              key={card.key}
              style={[
                styles.infoCard,
                card.highlight && styles.infoCardHighlight,
              ]}
            >
              <View
                style={[
                  styles.infoIconBox,
                  card.highlight && styles.infoIconBoxHighlight,
                ]}
              >
                <Text style={styles.infoIconEmoji}>
                  {card.key === 'category' ? '📦' :
                   card.key === 'grade' ? '🛡️' :
                   card.key === 'totalStock' ? '📊' :
                   card.key === 'minOrder' ? '📋' :
                   card.key === 'deliveryOption' ? '🚛' : '🏷️'}
                </Text>
              </View>
              <View>
                <Text
                  style={[
                    styles.infoValue,
                    card.highlight && styles.infoValueHighlight,
                  ]}
                >
                  {item[card.key]}
                </Text>
                <Text
                  style={[
                    styles.infoLabel,
                    card.highlight && styles.infoLabelHighlight,
                  ]}
                >
                  {card.label}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Payment & Delivery terms */}
        <View style={styles.termsRow}>
          <View style={styles.termCard}>
            <Text style={styles.termIcon}>💳  </Text>
            <Text style={styles.termTitle}>PAYMENT TERMS</Text>
            <Text style={styles.termValue}>{item.paymentTerms}</Text>
          </View>
          <View style={styles.termCard}>
            <Text style={styles.termIcon}>🚛  </Text>
            <Text style={styles.termTitle}>DELIVERY TERMS</Text>
            <Text style={styles.termValue}>{item.deliveryTerms}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About this Commodity</Text>
          <Text style={styles.descText}>{item.desc}</Text>
        </View>

        {/* Available sellers/mills */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Available Mills</Text>
          {item.sellers.map((seller: any, idx: number) => (
            <View
              key={idx}
              style={[
                styles.sellerRow,
                idx < item.sellers.length - 1 && styles.sellerRowBorder,
              ]}
            >
              <View style={styles.radioCircle} />
              <View style={{ flex: 1 }}>
                <Text style={styles.sellerName}>{seller.name}</Text>
                <Text style={styles.sellerLocation}>{seller.location}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.sellerPrice}>
                  {seller.price}
                  <Text style={styles.sellerPriceUnit}>{seller.unit}</Text>
                </Text>
                <Text style={styles.sellerAvail}>{seller.available} available</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky bottom action bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.chatBtn} activeOpacity={0.85}>
          <Text style={styles.chatBtnText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.purchaseBtn}
          activeOpacity={0.88}
          onPress={() =>
            navigation.navigate('RequestToPurchase', { listingId })
          }
        >
          <Text style={styles.purchaseBtnText}>Request to Purchase →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  hero: { height: 220, flexShrink: 0, overflow: 'hidden', position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  backBtn: {
    position: 'absolute',
    top: 44,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 10,
    padding: 8,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: 18, color: '#111827', lineHeight: 20 },
  heartBtn: {
    position: 'absolute',
    top: 44,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 8,
    padding: 8,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBottom: {
    position: 'absolute',
    bottom: 14,
    left: 18,
    zIndex: 2,
  },
  heroId: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  heroName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  heroBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  premiumBadge: {
    backgroundColor: '#F3CD03',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  premiumBadgeText: { fontSize: 9, fontWeight: '800', color: '#0D3B1F' },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  verifiedDot: { fontSize: 11, color: '#7FD4A0' },
  verifiedText: { fontSize: 10, color: '#7FD4A0', fontWeight: '700' },
  warningBar: {
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#FCD34D',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  warningIcon: { fontSize: 12, color: '#92400E' },
  warningText: { fontSize: 11, color: '#92400E', flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 20 },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '47%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoCardHighlight: { backgroundColor: '#145228' },
  infoIconBox: {
    width: 32,
    height: 32,
    backgroundColor: '#F2FBF5',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoIconBoxHighlight: { backgroundColor: 'rgba(255,255,255,0.15)' },
  infoIconEmoji: { fontSize: 14 },
  infoValue: { fontSize: 13, fontWeight: '700', color: '#111827' },
  infoValueHighlight: { color: '#FFFFFF' },
  infoLabel: { fontSize: 10, color: '#9CA3AF', marginTop: 1 },
  infoLabelHighlight: { color: 'rgba(255,255,255,0.6)' },
  termsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  termCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  termIcon: { fontSize: 10 },
  termTitle: { fontSize: 10, fontWeight: '600', color: '#9CA3AF', marginBottom: 4, marginTop: 4 },
  termValue: { fontSize: 12, fontWeight: '700', color: '#111827' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 8 },
  descText: { fontSize: 13, color: '#4B5563', lineHeight: 20 },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  sellerRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    flexShrink: 0,
  },
  sellerName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  sellerLocation: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  sellerPrice: { fontSize: 14, fontWeight: '900', color: '#1A6B34' },
  sellerPriceUnit: { fontSize: 10, fontWeight: '500', color: '#9CA3AF' },
  sellerAvail: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
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
  chatBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1A6B34',
  },
  chatBtnText: { fontSize: 14, fontWeight: '700', color: '#1A6B34' },
  purchaseBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#1A6B34',
  },
  purchaseBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});

export default CommodityDetailScreen;
