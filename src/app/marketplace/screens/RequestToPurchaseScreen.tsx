import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import MockStatusBar from '../../components/MockStatusBar';

type Props = NativeStackScreenProps<RootStackParamList, 'RequestToPurchase'>;

const LISTINGS: Record<string, any> = {
  L001: {
    id: 'LST-2024-001',
    name: 'Basmati Rice',
    badge: 'PREMIUM',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&q=80',
    fallback: '#8A9A5B',
    mills: [
      { id: 'M1', name: 'Gujranwala Mill A', location: 'Gujranwala, Punjab', price: 'PKR 4,200', available: '200 bags' },
      { id: 'M2', name: 'Faisalabad Mill B', location: 'Faisalabad, Punjab', price: 'PKR 4,150', available: '150 bags' },
      { id: 'M3', name: 'Lahore Mill C', location: 'Lahore, Punjab', price: 'PKR 4,300', available: '80 bags' },
    ],
  },
  L002: {
    id: 'LST-2024-002',
    name: 'Punjab Wheat',
    badge: 'VERIFIED',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=900&q=80',
    fallback: '#C29A4A',
    mills: [
      { id: 'M1', name: 'Faisalabad Mill B', location: 'Faisalabad, Punjab', price: 'PKR 2,800', available: '500 bags' },
      { id: 'M2', name: 'Multan Mill D', location: 'Multan, Punjab', price: 'PKR 2,750', available: '200 bags' },
    ],
  },
};

const RequestToPurchaseScreen = ({ navigation, route }: Props) => {
  const { listingId } = route.params;
  const listing = LISTINGS[listingId] ?? LISTINGS['L001'];

  const [selectedMill, setSelectedMill] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  const selectedMillData = listing.mills.find((m: any) => m.id === selectedMill);

  const handleSubmit = () => {
    // Navigate back after submission
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <MockStatusBar backgroundColor="#FFFFFF" textColor="#111827" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request to Purchase</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Product preview card */}
        <View style={styles.previewCard}>
          <ImageBackground
            source={{ uri: listing.image }}
            style={styles.previewImage}
            resizeMode="cover"
            imageStyle={{ backgroundColor: listing.fallback }}
          >
            <View style={styles.previewOverlay} />
            <View style={styles.previewBottom}>
              <Text style={styles.previewId}>{listing.id}</Text>
              <View style={styles.previewNameRow}>
                <Text style={styles.previewName}>{listing.name}</Text>
                <View style={styles.previewBadge}>
                  <Text style={styles.previewBadgeText}>{listing.badge}</Text>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Select Mill */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            1. Select Mill <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.sectionSubtitle}>Your request will be tied to one mill</Text>

          {listing.mills.map((mill: any) => {
            const isSelected = selectedMill === mill.id;
            return (
              <TouchableOpacity
                key={mill.id}
                onPress={() => setSelectedMill(mill.id)}
                style={[styles.millRow, isSelected && styles.millRowSelected]}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.radioOuter,
                    isSelected && styles.radioOuterSelected,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.millName}>{mill.name}</Text>
                  <Text style={styles.millLocation}>{mill.location}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.millPrice}>{mill.price}<Text style={styles.millUnit}>/40kg</Text></Text>
                  <Text style={styles.millAvail}>{mill.available} available</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quantity */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            2. Quantity (bags) <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.sectionSubtitle}>
            Min order: 50 bags{selectedMillData ? ` · Max: ${selectedMillData.available}` : ''}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 100"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
            placeholderTextColor="#9CA3AF"
          />

          {quantity && selectedMillData ? (
            <View style={styles.calcBox}>
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>Unit Price</Text>
                <Text style={styles.calcValue}>{selectedMillData.price} / 40kg</Text>
              </View>
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>Quantity</Text>
                <Text style={styles.calcValue}>{quantity} bags</Text>
              </View>
              <View style={[styles.calcRow, { paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E5E7EB' }]}>
                <Text style={styles.calcTotalLabel}>Est. Total</Text>
                <Text style={styles.calcTotalValue}>
                  PKR {(parseInt(quantity || '0') * parseInt((selectedMillData.price.replace(/[^0-9]/g, '') || '0'))).toLocaleString()}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Notes */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>3. Additional Notes</Text>
          <Text style={styles.sectionSubtitle}>Any specific requirements or instructions</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="e.g. Need delivery by April 15..."
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Info note */}
        <View style={styles.infoNote}>
          <Text style={styles.infoNoteIcon}>✓</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoNoteTitle}>How it works</Text>
            <Text style={styles.infoNoteText}>
              Your request will be reviewed by the Naseeb team. We'll verify availability and contact you within 24 hours to confirm details.
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky submit bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.submitBtn,
            (!selectedMill || !quantity) && styles.submitBtnDisabled,
          ]}
          activeOpacity={0.88}
          onPress={handleSubmit}
          disabled={!selectedMill || !quantity}
        >
          <Text style={styles.submitBtnText}>Submit Request →</Text>
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
  backBtn: { padding: 4, borderRadius: 8 },
  backArrow: { fontSize: 22, color: '#111827', lineHeight: 24 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  scrollContent: { padding: 14, paddingBottom: 20 },
  previewCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  previewImage: { height: 90 },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  previewBottom: { position: 'absolute', bottom: 10, left: 14, zIndex: 2 },
  previewId: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  previewNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  previewName: { fontSize: 17, fontWeight: '900', color: '#FFFFFF' },
  previewBadge: {
    backgroundColor: '#F3CD03',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  previewBadgeText: { fontSize: 10, fontWeight: '800', color: '#0D3B1F' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#111827', marginBottom: 4 },
  required: { color: '#EF4444' },
  sectionSubtitle: { fontSize: 11, color: '#6B7280', marginBottom: 12 },
  millRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  millRowSelected: { borderColor: '#1A6B34', backgroundColor: '#F2FBF5' },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioOuterSelected: { borderColor: '#1A6B34' },
  radioInner: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#1A6B34' },
  millName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  millLocation: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  millPrice: { fontSize: 14, fontWeight: '900', color: '#1A6B34' },
  millUnit: { fontSize: 10, fontWeight: '500', color: '#9CA3AF' },
  millAvail: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FAFAFA',
  },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  calcBox: {
    marginTop: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4,
  },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between' },
  calcLabel: { fontSize: 12, color: '#6B7280' },
  calcValue: { fontSize: 12, fontWeight: '600', color: '#111827' },
  calcTotalLabel: { fontSize: 13, fontWeight: '700', color: '#111827' },
  calcTotalValue: { fontSize: 14, fontWeight: '800', color: '#1A6B34' },
  infoNote: {
    backgroundColor: '#F2FBF5',
    borderWidth: 1.5,
    borderColor: '#7FD4A0',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    gap: 11,
    alignItems: 'flex-start',
  },
  infoNoteIcon: { fontSize: 18, color: '#1A6B34', fontWeight: '700' },
  infoNoteTitle: { fontSize: 13, fontWeight: '700', color: '#1A6B34', marginBottom: 4 },
  infoNoteText: { fontSize: 12, color: '#374151', lineHeight: 18 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  submitBtn: {
    backgroundColor: '#1A6B34',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitBtnDisabled: { backgroundColor: '#9CA3AF' },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});

export default RequestToPurchaseScreen;
