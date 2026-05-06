import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Colors as C, Spacing, Radius, Shadow } from '../../../constants/theme';
import { useAppSelector } from '../../../store';

const COMMODITIES = ['Wheat', 'Rice', 'Cotton', 'Maize', 'Mustard', 'Sugarcane', 'Other'];
const UNITS       = ['Tons', 'Maunds', 'Quintals', 'KGs'];

const PostScreen = () => {
  const mode = useAppSelector(s => s.app.mode);
  const isBuyer = mode === 'buyer';

  const [commodity, setCommodity] = useState('');
  const [qty, setQty]         = useState('');
  const [unit, setUnit]       = useState('Tons');
  const [price, setPrice]     = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes]     = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => { setSubmitted(true); };

  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <Text style={{ fontSize: 64 }}>✅</Text>
        <Text style={styles.successTitle}>
          {isBuyer ? 'Demand Posted!' : 'Listing Created!'}
        </Text>
        <Text style={styles.successSub}>
          {isBuyer
            ? 'Sellers will be notified and can submit offers.'
            : "Your listing is under review. You'll be notified once approved."}
        </Text>
        <TouchableOpacity style={styles.doneBtn} onPress={() => setSubmitted(false)} activeOpacity={0.88}>
          <Text style={styles.doneBtnText}>Post Another</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={C.green900} />

      <View style={styles.header}>
        <View style={styles.orb} />
        <Text style={styles.headerTitle}>
          {isBuyer ? '📋 Post a Demand' : '📦 Create Listing'}
        </Text>
        <Text style={styles.headerSub}>
          {isBuyer
            ? 'Let sellers know what you need'
            : 'List your commodity for buyers to discover'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {/* Commodity */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Commodity Details</Text>

          <Text style={styles.fieldLabel}>Select Commodity</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {COMMODITIES.map(c => (
              <TouchableOpacity
                key={c}
                onPress={() => setCommodity(c)}
                style={[styles.chip, commodity === c && styles.chipActive]}
              >
                <Text style={[styles.chipText, commodity === c && styles.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>Quantity</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 200"
                placeholderTextColor={C.gray400}
                value={qty}
                onChangeText={setQty}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>Unit</Text>
              <View style={styles.unitRow}>
                {UNITS.map(u => (
                  <TouchableOpacity
                    key={u}
                    onPress={() => setUnit(u)}
                    style={[styles.unitChip, unit === u && styles.unitChipActive]}
                  >
                    <Text style={[styles.unitChipText, unit === u && styles.unitChipTextActive]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <Text style={styles.fieldLabel}>{isBuyer ? 'Budget (per 40kg)' : 'Asking Price (per 40kg)'}</Text>
          <View style={styles.priceInput}>
            <Text style={styles.currencySymbol}>₨</Text>
            <TextInput
              style={styles.priceField}
              placeholder="e.g. 3850"
              placeholderTextColor={C.gray400}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Location */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Location</Text>
          <Text style={styles.fieldLabel}>City / Area</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Lahore, Punjab"
            placeholderTextColor={C.gray400}
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Notes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Additional Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={isBuyer ? 'Specify quality grade, delivery preference...' : 'Describe quality, packaging, availability...'}
            placeholderTextColor={C.gray400}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.submitBtn, (!commodity || !qty || !price || !location) && styles.submitBtnDisabled]}
          activeOpacity={0.88}
          disabled={!commodity || !qty || !price || !location}
        >
          <Text style={styles.submitBtnText}>
            {isBuyer ? '📋 Post Demand' : '📦 Submit Listing'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PostScreen;

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.gray50 },

  header: {
    backgroundColor: C.green900,
    paddingTop: 54,
    paddingBottom: 24,
    paddingHorizontal: Spacing.base,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute', top: -40, right: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: C.green700, opacity: 0.2,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.white },
  headerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 6 },

  body: { padding: Spacing.base, gap: 14 },

  card: { backgroundColor: C.white, borderRadius: Radius.xl, padding: Spacing.base, ...Shadow.sm },
  cardTitle: { fontSize: 14, fontWeight: '800', color: C.gray900, marginBottom: 14 },

  fieldLabel: { fontSize: 12, fontWeight: '700', color: C.gray600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },

  chips: { gap: 8, paddingBottom: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: C.gray200, backgroundColor: C.gray50 },
  chipActive: { backgroundColor: C.green700, borderColor: C.green700 },
  chipText: { fontSize: 12, color: C.gray600, fontWeight: '600' },
  chipTextActive: { color: C.white, fontWeight: '700' },

  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },

  input: {
    borderWidth: 1, borderColor: C.gray200,
    borderRadius: Radius.md, padding: 12,
    fontSize: 14, color: C.gray900, backgroundColor: C.gray50,
  },
  textArea: { minHeight: 100, marginTop: 0 },

  unitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  unitChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.md, borderWidth: 1, borderColor: C.gray200, backgroundColor: C.gray50 },
  unitChipActive: { backgroundColor: C.green700, borderColor: C.green700 },
  unitChipText: { fontSize: 11, color: C.gray600, fontWeight: '600' },
  unitChipTextActive: { color: C.white },

  priceInput: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: C.gray200,
    borderRadius: Radius.md, backgroundColor: C.gray50, overflow: 'hidden',
  },
  currencySymbol: {
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 16, fontWeight: '800', color: C.green700,
    backgroundColor: C.green50, borderRightWidth: 1, borderRightColor: C.gray200,
  },
  priceField: { flex: 1, padding: 12, fontSize: 16, fontWeight: '700', color: C.gray900 },

  submitBtn: {
    backgroundColor: C.green700, borderRadius: Radius.lg,
    paddingVertical: 16, alignItems: 'center',
    ...Shadow.md,
  },
  submitBtnDisabled: { opacity: 0.45 },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: C.white },

  successContainer: { flex: 1, backgroundColor: C.gray50, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: 16 },
  successTitle:     { fontSize: 24, fontWeight: '800', color: C.gray900 },
  successSub:       { fontSize: 14, color: C.gray500, textAlign: 'center', lineHeight: 22 },
  doneBtn: { marginTop: 8, backgroundColor: C.green700, borderRadius: Radius.lg, paddingVertical: 14, paddingHorizontal: 40 },
  doneBtnText: { fontSize: 15, fontWeight: '700', color: C.white },
});
