import React from 'react';
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

type Props = NativeStackScreenProps<RootStackParamList, 'OfferDetail'>;

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

const OfferDetailScreen = ({ navigation, route }: Props) => {
  const { offerId } = route.params;
  const offerDetail = OFFER_DETAILS[offerId];

  if (!offerDetail) return null;

  return (
    <View style={styles.container}>
      <MockStatusBar backgroundColor="#FFFFFF" textColor="#111827" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <AppIcon name="back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offer Detail</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <ImageBackground
            source={{ uri: offerDetail.image }}
            resizeMode="cover"
            style={styles.heroImage}
            imageStyle={{ backgroundColor: offerDetail.fallback }}
          >
            <View style={styles.heroOverlay} />
            <View style={styles.heroBottom}>
              <Text style={styles.heroId}>{offerDetail.id}</Text>
              <Text style={styles.heroTitle}>{offerDetail.title}</Text>
            </View>
            <View style={styles.anonymousPill}>
              <AppIcon name="shield" size={10} color="rgba(255,255,255,0.8)" />
              <Text style={styles.anonymousText}>Anonymous</Text>
            </View>
          </ImageBackground>

          <View style={styles.summaryBar}>
            {[
              ['YOUR OFFER', offerDetail.myOffer],
              ['QTY', offerDetail.qty],
              ['MILL', offerDetail.mill],
              ['PAYMENT', offerDetail.payment],
            ].map(([label, value], index) => (
              <View
                key={label}
                style={[styles.summaryItem, index > 0 && styles.summaryItemBorder]}
              >
                <Text style={styles.summaryLabel}>{label}</Text>
                <Text
                  style={[styles.summaryValue, index === 0 && styles.summaryPrice]}
                  numberOfLines={1}
                >
                  {value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.alertBanner}>
          <View style={styles.alertDot} />
          <Text style={styles.alertText}>{offerDetail.alert}</Text>
        </View>

        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>Offer History</Text>
          {offerDetail.history.map((event: any, index: number) => (
            <View
              key={`${event.title}-${index}`}
              style={[
                styles.historyRow,
                index < offerDetail.history.length - 1 && styles.historyBorder,
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

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.negotiateBtn}
            activeOpacity={0.86}
            onPress={() => navigation.navigate('Negotiation', { offerId })}
          >
            <AppIcon name="notificationWarning" size={17} color="#0D3B1F" />
            <Text style={styles.negotiateBtnText}>Open Negotiation</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptBtn} activeOpacity={0.86}>
            <AppIcon name="approved" size={16} color="#FFFFFF" />
            <Text style={styles.acceptBtnText}>Accept Deal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.84}>
            <Text style={styles.cancelBtnText}>Cancel Offer</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { flex: 1 },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  headerSpacer: { width: 30 },
  content: { padding: 14, paddingBottom: 100 },
  heroCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  heroImage: { height: 90, width: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  heroBottom: { position: 'absolute', bottom: 10, left: 14, zIndex: 2 },
  heroId: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'monospace',
    marginBottom: 1,
  },
  heroTitle: { fontSize: 16, fontWeight: '900', color: '#FFFFFF' },
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
  anonymousText: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  summaryBar: {
    backgroundColor: '#145228',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
  },
  summaryItem: { flex: 1 },
  summaryItemBorder: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.13)',
    paddingLeft: 8,
  },
  summaryLabel: { fontSize: 8, color: 'rgba(255,255,255,0.33)', marginBottom: 2 },
  summaryValue: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  summaryPrice: { color: '#F7DB4A' },
  alertBanner: {
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
  alertDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#F3CD03',
  },
  alertText: { flex: 1, fontSize: 12, fontWeight: '700', color: '#92400E' },
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
  historyTitle: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 12 },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  historyBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
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
  actions: { gap: 10 },
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
  acceptBtn: {
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
  acceptBtnText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  cancelBtn: {
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 13, fontWeight: '700', color: '#EF4444' },
});

export default OfferDetailScreen;
