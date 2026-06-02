import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { AppIcon } from '../../../assets/icons';
import MockStatusBar from '../../components/MockStatusBar';

type Props = NativeStackScreenProps<RootStackParamList, 'Negotiation'>;

interface NegotiationMessage {
  role: 'buyer' | 'seller';
  label: string;
  price: string;
  unit: string;
  payment: string;
  delivery: string;
  time: string;
  isCounter?: boolean;
}

interface NegotiationData {
  title: string;
  context: string;
  messages: NegotiationMessage[];
}

const NEGOTIATIONS: Record<string, NegotiationData> = {
  PO001: {
    title: 'Punjab Wheat',
    context: 'Faisalabad Mill A · 300 bags',
    messages: [
      {
        role: 'buyer',
        label: 'INITIAL OFFER',
        price: 'PKR 2,750',
        unit: 'per 40kg · 300 bags',
        payment: 'Full in 7 days',
        delivery: 'Deliver in 3d',
        time: 'Mar 27 · 10:15 AM',
      },
      {
        role: 'seller',
        label: 'COUNTER OFFER',
        price: 'PKR 2,900',
        unit: 'per 40kg · 300 bags',
        payment: 'Weekly 20%',
        delivery: 'Deliver in 5d',
        time: 'Mar 27 · 2:30 PM',
        isCounter: true,
      },
    ],
  },
  PO002: {
    title: 'Basmati Rice',
    context: 'Gujranwala Mill B · 100 bags',
    messages: [
      {
        role: 'buyer',
        label: 'INITIAL OFFER',
        price: 'PKR 4,100',
        unit: 'per 40kg · 100 bags',
        payment: '30 days',
        delivery: 'Deliver in 5d',
        time: 'Mar 25 · 11:20 AM',
      },
    ],
  },
  PO003: {
    title: 'Desi Cotton',
    context: 'Multan Mill C · 30 bales',
    messages: [
      {
        role: 'seller',
        label: 'SELLER OFFER',
        price: 'PKR 8,400',
        unit: 'per 40kg · 30 bales',
        payment: 'Full payment',
        delivery: 'Deliver in 7d',
        time: 'Mar 22 · 09:05 AM',
      },
      {
        role: 'buyer',
        label: 'ACCEPTED',
        price: 'PKR 8,400',
        unit: 'per 40kg · 30 bales',
        payment: 'Full payment',
        delivery: 'Deliver in 7d',
        time: 'Mar 22 · 02:10 PM',
      },
    ],
  },
  PO004: {
    title: 'Yellow Maize',
    context: 'Okara Mill D · 150 bags',
    messages: [
      {
        role: 'buyer',
        label: 'INITIAL OFFER',
        price: 'PKR 1,850',
        unit: 'per 40kg · 150 bags',
        payment: 'Advance',
        delivery: 'Deliver in 4d',
        time: 'Mar 20 · 01:40 PM',
      },
    ],
  },
};

const MessageBubble = ({ message }: { message: NegotiationMessage }) => {
  const isBuyer = message.role === 'buyer';

  return (
    <View
      style={[
        styles.messageRow,
        isBuyer ? styles.messageRowReverse : styles.messageRowNormal,
      ]}
    >
      <View
        style={[
          styles.avatar,
          { backgroundColor: isBuyer ? '#E8F7EE' : '#DBEAFE' },
        ]}
      >
        <Text style={styles.avatarEmoji}>{isBuyer ? '🛒' : '📦'}</Text>
      </View>

      <View style={styles.bubbleWrapper}>
        <Text
          style={[
            styles.bubbleTimestamp,
            { textAlign: isBuyer ? 'right' : 'left' },
          ]}
        >
          {isBuyer ? 'You' : 'Seller'} · {message.time}
        </Text>
        <View
          style={[
            styles.bubble,
            isBuyer ? styles.bubbleBuyer : styles.bubbleSeller,
            message.isCounter && styles.bubbleCounter,
          ]}
        >
          <Text
            style={[
              styles.bubbleLabel,
              { color: isBuyer ? 'rgba(255,255,255,0.53)' : '#9CA3AF' },
            ]}
          >
            {message.isCounter ? '⏳ AWAITING YOUR RESPONSE' : message.label}
          </Text>
          <Text style={styles.bubblePrice}>{message.price}</Text>
          <Text style={styles.bubbleUnit}>{message.unit}</Text>

          <View style={styles.bubbleChips}>
            <View
              style={[
                styles.chip,
                {
                  backgroundColor: isBuyer
                    ? 'rgba(255,255,255,0.15)'
                    : '#F9FAFB',
                },
              ]}
            >
              <AppIcon
                name="bank"
                size={10}
                color={isBuyer ? 'rgba(255,255,255,0.8)' : '#6B7280'}
              />
              <Text
                style={[
                  styles.chipText,
                  { color: isBuyer ? 'rgba(255,255,255,0.9)' : '#374151' },
                ]}
              >
                {message.payment}
              </Text>
            </View>
            <View
              style={[
                styles.chip,
                {
                  backgroundColor: isBuyer
                    ? 'rgba(255,255,255,0.15)'
                    : '#F9FAFB',
                },
              ]}
            >
              <AppIcon
                name="notificationLogistics"
                size={10}
                color={isBuyer ? 'rgba(255,255,255,0.8)' : '#6B7280'}
              />
              <Text
                style={[
                  styles.chipText,
                  { color: isBuyer ? 'rgba(255,255,255,0.9)' : '#374151' },
                ]}
              >
                {message.delivery}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const NegotiationScreen = ({ navigation, route }: Props) => {
  const { offerId } = route.params;
  const negotiation = NEGOTIATIONS[offerId] ?? NEGOTIATIONS.PO001;

  return (
    <View style={styles.container}>
      <MockStatusBar backgroundColor="#0D3B1F" textColor="#FFFFFF" />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.8}
          >
            <AppIcon name="back" size={17} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Negotiation</Text>
            <Text style={styles.headerSub}>{negotiation.context}</Text>
          </View>

          <View style={styles.anonymousBadge}>
            <Text style={styles.anonymousText}>🔒 Anonymous</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.mediateBtn} activeOpacity={0.85}>
          <AppIcon name="shield" size={14} color="#FFFFFF" />
          <Text style={styles.mediateBtnText}>Contact Admin to Mediate</Text>
        </TouchableOpacity>

        <View style={styles.proofRow}>
          <TouchableOpacity style={styles.proofBtn} activeOpacity={0.85}>
            <Text style={styles.proofEmoji}>📸</Text>
            <Text style={styles.proofBtnText}>Request Proof of Product</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.chat}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {negotiation.messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Text style={styles.disclaimer}>
          Accepting creates a Deal instantly
        </Text>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.rejectBtn} activeOpacity={0.85}>
            <Text style={styles.rejectBtnText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.counterBtn} activeOpacity={0.85}>
            <Text style={styles.counterBtnText}>Counter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptBtn} activeOpacity={0.85}>
            <Text style={styles.acceptBtnText}>Accept → Deal ✓</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEF2EE' },
  header: {
    background: 'transparent',
    paddingHorizontal: 14,
    paddingBottom: 14,
    backgroundColor: '#0D3B1F',
    flexShrink: 0,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 10,
    padding: 8,
  },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  headerSub: { fontSize: 10, color: 'rgba(255,255,255,0.33)', marginTop: 1 },
  anonymousBadge: {
    backgroundColor: 'rgba(255,255,255,0.094)',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  anonymousText: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.53)',
  },
  mediateBtn: {
    width: '100%',
    paddingVertical: 9,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  mediateBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  proofRow: { flexDirection: 'row', gap: 8 },
  proofBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  proofEmoji: { fontSize: 13 },
  proofBtnText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  chat: { flex: 1 },
  chatContent: { padding: 14, paddingBottom: 24, gap: 16 },
  messageRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  messageRowReverse: { flexDirection: 'row-reverse' },
  messageRowNormal: { flexDirection: 'row' },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    flexShrink: 0,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 15 },
  bubbleWrapper: { maxWidth: '80%' },
  bubbleTimestamp: {
    fontSize: 9,
    color: '#9CA3AF',
    marginBottom: 3,
  },
  bubble: {
    borderRadius: 16,
    padding: 12,
    minWidth: 200,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  bubbleBuyer: {
    backgroundColor: '#1A6B34',
    borderTopRightRadius: 4,
  },
  bubbleSeller: {
    backgroundColor: '#145228',
    borderTopLeftRadius: 4,
  },
  bubbleCounter: {
    borderWidth: 2,
    borderColor: '#F7DB4A',
  },
  bubbleLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  bubblePrice: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bubbleUnit: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.47)',
    marginBottom: 6,
  },
  bubbleChips: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: {
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chipText: { fontSize: 10, fontWeight: '600' },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  disclaimer: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 8,
  },
  actionRow: { flexDirection: 'row', gap: 8 },
  rejectBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 11,
    alignItems: 'center',
  },
  rejectBtnText: { fontSize: 12, fontWeight: '700', color: '#EF4444' },
  counterBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#FFFDE6',
    borderWidth: 1,
    borderColor: 'rgba(243,205,3,0.33)',
    borderRadius: 11,
    alignItems: 'center',
  },
  counterBtnText: { fontSize: 12, fontWeight: '700', color: '#92400E' },
  acceptBtn: {
    flex: 2,
    paddingVertical: 12,
    backgroundColor: '#1A6B34',
    borderRadius: 11,
    alignItems: 'center',
    shadowColor: '#1A6B34',
    shadowOpacity: 0.33,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  acceptBtnText: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
});

export default NegotiationScreen;
