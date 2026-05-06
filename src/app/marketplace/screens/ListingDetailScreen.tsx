import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { Colors as C, Spacing, Radius, Shadow } from '../../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ListingDetail'>;

const LISTINGS: Record<string, any> = {
  L001: { name: 'Premium Wheat',       emoji: '🌾', qty: '500 Tons',  price: '₨3,850/40kg', location: 'Lahore, Punjab',      seller: 'Asad Traders',    rating: 4.8, deals: 24, verified: true,  desc: 'High-quality wheat from central Punjab farms. Well-dried, free from impurities. Available immediately for bulk purchase.' },
  L002: { name: 'IRRI-6 Rice',         emoji: '🍚', qty: '200 Tons',  price: '₨4,200/40kg', location: 'Sheikhupura, Punjab', seller: 'Punjab Agri Co',  rating: 4.6, deals: 18, verified: true,  desc: 'Fresh harvest IRRI-6 paddy rice. 2024 crop. Moisture content below 14%. Bagged in 40kg standard sacks.' },
  L003: { name: 'Desi Cotton Grade A', emoji: '☁️', qty: '150 Tons',  price: '₨8,500/40kg', location: 'Multan, Punjab',      seller: 'Cotton King',     rating: 4.2, deals: 9,  verified: false, desc: 'Grade A desi cotton lint. Manually picked. Suitable for spinning mills and export.' },
  L004: { name: 'Yellow Maize',        emoji: '🌽', qty: '800 Tons',  price: '₨2,600/40kg', location: 'Faisalabad, Punjab',  seller: 'Farm Fresh Ltd',  rating: 4.7, deals: 31, verified: true,  desc: 'Dry yellow maize suitable for feed mills and flour production. Large quantity available at competitive rates.' },
};

const ListingDetailScreen = ({ navigation, route }: Props) => {
  const { listingId } = route.params;
  const item = LISTINGS[listingId] ?? LISTINGS['L001'];
  const [saved, setSaved] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.green900} />

      {/* Hero header */}
      <View style={styles.hero}>
        <View style={styles.orb} />
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 18, color: C.white }}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={() => setSaved(s => !s)}>
          <Text style={{ fontSize: 20 }}>{saved ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
        <View style={styles.heroEmoji}>
          <Text style={{ fontSize: 56 }}>{item.emoji}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Title row */}
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName}>{item.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
              {item.verified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ Verified</Text>
                </View>
              )}
              <Text style={styles.ratingText}>⭐ {item.rating} ({item.deals} deals)</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.price}>{item.price}</Text>
            <Text style={styles.qty}>{item.qty} available</Text>
          </View>
        </View>

        {/* Info cards */}
        <View style={styles.infoGrid}>
          {[
            { icon: '📍', label: 'Location',  val: item.location  },
            { icon: '🏢', label: 'Seller',    val: item.seller    },
            { icon: '📦', label: 'Quantity',  val: item.qty        },
            { icon: '💰', label: 'Price',     val: item.price      },
          ].map(info => (
            <View key={info.label} style={styles.infoCard}>
              <Text style={{ fontSize: 20 }}>{info.icon}</Text>
              <Text style={styles.infoLabel}>{info.label}</Text>
              <Text style={styles.infoVal}>{info.val}</Text>
            </View>
          ))}
        </View>

        {/* Description */}
        <View style={styles.descCard}>
          <Text style={styles.descTitle}>About this Listing</Text>
          <Text style={styles.descText}>{item.desc}</Text>
        </View>

        {/* Price breakdown */}
        <View style={styles.priceCard}>
          <Text style={styles.descTitle}>Price Breakdown</Text>
          {[
            { label: 'Unit Price',   val: item.price },
            { label: 'Commission',   val: '₨38/40kg' },
            { label: 'Est. Delivery',val: '₨85/40kg' },
          ].map(row => (
            <View key={row.label} style={styles.priceRow}>
              <Text style={styles.priceLabel}>{row.label}</Text>
              <Text style={styles.priceVal}>{row.val}</Text>
            </View>
          ))}
          <View style={[styles.priceRow, styles.priceTotalRow]}>
            <Text style={styles.priceTotalLabel}>Total (per 40kg)</Text>
            <Text style={styles.priceTotalVal}>₨3,973</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Action buttons — sticky bottom */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.chatBtn} activeOpacity={0.85}>
          <Text style={styles.chatBtnText}>💬 Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.interestBtn} activeOpacity={0.88}>
          <Text style={styles.interestBtnText}>Send Interest →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ListingDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.gray50 },

  hero: {
    backgroundColor: C.green900, height: 200,
    alignItems: 'center', justifyContent: 'flex-end',
    paddingBottom: 20, overflow: 'hidden',
  },
  orb: {
    position: 'absolute', top: -40, right: -40,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: C.green700, opacity: 0.3,
  },
  backBtn: {
    position: 'absolute', top: 48, left: Spacing.base,
    width: 38, height: 38, borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  saveBtn: {
    position: 'absolute', top: 48, right: Spacing.base,
    width: 38, height: 38, borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  heroEmoji: {
    width: 88, height: 88, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)',
  },

  body: { padding: Spacing.base },

  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  itemName: { fontSize: 20, fontWeight: '800', color: C.gray900 },
  verifiedBadge: { backgroundColor: C.green100, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  verifiedText:  { fontSize: 11, fontWeight: '700', color: C.green700 },
  ratingText:    { fontSize: 12, color: C.gray500 },
  price: { fontSize: 18, fontWeight: '800', color: C.green700 },
  qty:   { fontSize: 11, color: C.gray400, marginTop: 2 },

  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  infoCard: {
    flex: 1, minWidth: '45%', backgroundColor: C.white,
    borderRadius: Radius.xl, padding: 14, gap: 4, ...Shadow.sm,
  },
  infoLabel: { fontSize: 11, color: C.gray400, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoVal:   { fontSize: 13, fontWeight: '700', color: C.gray800 },

  descCard: { backgroundColor: C.white, borderRadius: Radius.xl, padding: Spacing.base, marginBottom: 14, ...Shadow.sm },
  descTitle: { fontSize: 14, fontWeight: '800', color: C.gray900, marginBottom: 10 },
  descText:  { fontSize: 13, color: C.gray600, lineHeight: 20 },

  priceCard: { backgroundColor: C.white, borderRadius: Radius.xl, padding: Spacing.base, marginBottom: 14, ...Shadow.sm },
  priceRow:  { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.gray100 },
  priceLabel:{ fontSize: 13, color: C.gray600 },
  priceVal:  { fontSize: 13, fontWeight: '700', color: C.gray800 },
  priceTotalRow:  { borderBottomWidth: 0, marginTop: 4 },
  priceTotalLabel:{ fontSize: 14, fontWeight: '800', color: C.gray900 },
  priceTotalVal:  { fontSize: 16, fontWeight: '800', color: C.green700 },

  actionBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 10,
    backgroundColor: C.white, padding: Spacing.base, paddingBottom: 28,
    borderTopWidth: 1, borderTopColor: C.gray100,
    ...Shadow.lg,
  },
  chatBtn: {
    flex: 1, paddingVertical: 14, borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: C.green700, alignItems: 'center',
  },
  chatBtnText: { fontSize: 14, fontWeight: '700', color: C.green700 },
  interestBtn: {
    flex: 2, paddingVertical: 14, borderRadius: Radius.lg,
    backgroundColor: C.green700, alignItems: 'center',
  },
  interestBtnText: { fontSize: 14, fontWeight: '700', color: C.white },
});
