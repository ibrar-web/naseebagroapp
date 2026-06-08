import React from 'react';
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppIcon } from '../../../assets/icons';
import { RootStackParamList } from '../../../navigation/types';
import MockStatusBar from '../../components/MockStatusBar';

type Props = NativeStackScreenProps<RootStackParamList, 'OfferSent'>;

const OfferSentScreen = ({ navigation, route }: Props) => {
  const {
    mode,
    listingId,
    title,
    code,
    image,
    primaryLabel,
    subtitle,
    summary,
  } = route.params;

  const isBuyer = mode === 'buyer';
  const heroImage =
    image ??
    `https://placehold.co/600x400?text=${encodeURIComponent(
      title ?? (isBuyer ? 'Purchase Request' : 'Offer'),
    )}`;
  const rows = summary?.length
    ? summary
    : [
        {
          label: isBuyer ? 'Request ID' : 'Offer ID',
          value: code ?? listingId,
        },
        {
          label: 'Status',
          value: isBuyer ? 'Sent to seller' : 'Sent to buyer',
        },
      ];

  const goMarket = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainTabs', params: { screen: 'Market' } }],
      }),
    );
  };

  const goPosts = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'MainTabs',
            params: { screen: 'Post', params: { initialTab: 'My Offers' } },
          },
        ],
      }),
    );
  };

  return (
    <View style={styles.container}>
      <MockStatusBar backgroundColor="#FFFFFF" textColor="#111827" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={goMarket}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <AppIcon name="back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isBuyer ? 'Request Sent' : 'Offer Sent'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.previewCard}>
          <ImageBackground
            source={{ uri: heroImage }}
            style={styles.previewImage}
            resizeMode="cover"
          >
            <View style={styles.previewOverlay} />
            <View style={styles.previewBottom}>
              <Text style={styles.previewCode}>{code ?? listingId}</Text>
              <Text style={styles.previewTitle} numberOfLines={1}>
                {title ?? (isBuyer ? 'Purchase Request' : 'Demand Offer')}
              </Text>
            </View>
          </ImageBackground>
          <View style={styles.successStrip}>
            <View style={styles.successIconBox}>
              <AppIcon name="approved" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.successTextWrap}>
              <Text style={styles.successTitle}>
                {primaryLabel ??
                  (isBuyer
                    ? 'Purchase Request Sent Successfully!'
                    : 'Offer Sent Successfully!')}
              </Text>
              <Text style={styles.successSubtitle}>
                {subtitle ??
                  (isBuyer
                    ? 'Seller will respond with acceptance, rejection or counter.'
                    : 'Buyer will respond with acceptance, rejection or counter.')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {isBuyer ? 'Request Summary' : 'Offer Summary'}
          </Text>
          {rows.map((row, index) => (
            <View
              key={`${row.label}-${index}`}
              style={[
                styles.summaryRow,
                index < rows.length - 1 && styles.summaryRowBorder,
              ]}
            >
              <Text style={styles.summaryLabel}>{row.label}</Text>
              <Text style={styles.summaryValue} numberOfLines={2}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.noteBox}>
          <AppIcon name="shield" size={16} color="#217A3C" />
          <Text style={styles.noteText}>
            Naseeb keeps the negotiation protected. You can track updates from
            your posts and offers tab.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={goMarket}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryBtnText}>Back to Market</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={goPosts}
          activeOpacity={0.88}
        >
          <Text style={styles.primaryBtnText}>Track Offer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  headerSpacer: { width: 34 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 116 },
  previewCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 18,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  previewImage: { height: 110 },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.48)',
  },
  previewBottom: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    zIndex: 2,
  },
  previewCode: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.55)',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  previewTitle: { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },
  successStrip: {
    backgroundColor: '#1A6B34',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  successIconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTextWrap: { flex: 1 },
  successTitle: { fontSize: 14, fontWeight: '900', color: '#FFFFFF' },
  successSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    gap: 16,
  },
  summaryRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  summaryLabel: { fontSize: 12, color: '#6B7280', flex: 1 },
  summaryValue: {
    flex: 1.2,
    fontSize: 12,
    color: '#111827',
    fontWeight: '800',
    textAlign: 'right',
  },
  noteBox: {
    backgroundColor: '#F2FBF5',
    borderWidth: 1,
    borderColor: '#7FD4A0',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: '#145228',
    lineHeight: 18,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
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
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#217A3C',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: { fontSize: 13, color: '#217A3C', fontWeight: '800' },
  primaryBtn: {
    flex: 1.2,
    backgroundColor: '#F3CD03',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: { fontSize: 13, color: '#0D3B1F', fontWeight: '900' },
});

export default OfferSentScreen;
