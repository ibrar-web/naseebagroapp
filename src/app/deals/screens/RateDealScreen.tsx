import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { MockStatusBar } from '../../components';
import { AppIcon } from '../../../assets/icons';
import api from '../../../utils/api';
import { showAlert } from '../../components/toastConfig';

type Props = NativeStackScreenProps<RootStackParamList, 'RateDeal'>;

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

const RateDealScreen = ({ navigation, route }: Props) => {
  const { dealId, dealCode, commodityName, dealSummary, raterRole, existingRating, onRatingSubmitted } = route.params;
  const isReadOnly = !!existingRating;
  const [starRating, setStarRating] = useState(existingRating?.score ?? 0);
  const [note, setNote] = useState(existingRating?.note ?? '');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = starRating > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const submitFn = raterRole === 'seller' ? api.seller.submitRating : api.buyer.submitRating;
      await submitFn(dealId, {
        score: starRating,
        note: note.trim() || undefined,
      });
      onRatingSubmitted?.(starRating, note.trim() || undefined);
      showAlert('success', 'Thank you!', 'Your rating has been submitted.', { confirmText: 'OK', onConfirm: () => navigation.goBack() });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? 'Something went wrong. Please try again.';
      showAlert('error', 'Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <MockStatusBar />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
          activeOpacity={0.7}
        >
          <AppIcon name="back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Rate this Deal</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Deal banner */}
        <View style={s.dealBanner}>
          <Text style={s.dealCode}>
            {dealCode ?? dealId.slice(0, 8)} · {commodityName ?? 'Deal'}
          </Text>
          {dealSummary ? (
            <Text style={s.dealSummary}>{dealSummary}</Text>
          ) : null}
        </View>

        {/* Stars card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Overall Rating</Text>
          <Text style={s.cardSub}>
            {isReadOnly ? 'Your submitted rating' : 'How would you rate this deal?'}
          </Text>
          <View style={s.starsRow}>
            {[1, 2, 3, 4, 5].map(n => (
              <TouchableOpacity
                key={n}
                onPress={() => !isReadOnly && setStarRating(n)}
                activeOpacity={isReadOnly ? 1 : 0.75}
                style={s.starBtn}
              >
                <Text
                  style={[
                    s.starIcon,
                    { color: n <= starRating ? '#F3CD03' : '#D1D5DB' },
                  ]}
                >
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {starRating > 0 && (
            <Text style={s.ratingLabel}>{STAR_LABELS[starRating]}</Text>
          )}
        </View>

        {/* Comment */}
        <View style={s.card}>
          <Text style={s.cardTitle}>
            {isReadOnly ? 'Your Comment' : 'Leave a Comment'}
          </Text>
          <Text style={s.cardSub}>
            {isReadOnly ? (note ? undefined : 'No comment provided') : 'Optional — share your experience'}
          </Text>
          <View style={[s.textAreaWrap, isReadOnly && s.textAreaReadOnly]}>
            <TextInput
              style={s.textArea}
              placeholder="Write something about this deal..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              value={note}
              onChangeText={isReadOnly ? undefined : setNote}
              maxLength={1000}
              editable={!isReadOnly}
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={s.footer}>
        {isReadOnly ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
            style={s.submitBtn}
          >
            <AppIcon name="back" size={17} color="#FFFFFF" />
            <Text style={s.submitText}>Go Back</Text>
          </TouchableOpacity>
        ) : (
          <>
            {!canSubmit && (
              <View style={s.warningRow}>
                <AppIcon name="alertTriangle" size={12} color="#D4AE02" />
                <Text style={s.warningText}>Please select a star rating</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={canSubmit ? 0.85 : 1}
              style={[s.submitBtn, !canSubmit && s.submitBtnDisabled]}
              disabled={!canSubmit || submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <AppIcon name="checkCircle" size={17} color="#FFFFFF" />
                  <Text style={s.submitText}>Submit Rating</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
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
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 120 },

  dealBanner: {
    backgroundColor: '#145228',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  dealCode: { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', marginBottom: 4 },
  dealSummary: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 4 },
  cardSub: { fontSize: 12, color: '#6B7280', textAlign: 'center', marginBottom: 18 },

  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  starBtn: { padding: 4 },
  starIcon: { fontSize: 44 },
  ratingLabel: { textAlign: 'center', fontSize: 13, fontWeight: '700', color: '#1A6B34', marginTop: 4 },

  textAreaWrap: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, overflow: 'hidden' },
  textAreaReadOnly: { backgroundColor: '#F9FAFB', borderColor: '#F3F4F6' },
  textArea: { padding: 12, fontSize: 14, color: '#111827', minHeight: 110 },

  footer: {
    padding: 14,
    paddingBottom: 28,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginBottom: 8,
  },
  warningText: { fontSize: 11, color: '#D4AE02' },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#217A3C',
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: '#2E9E52',
    shadowOpacity: 0.27,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
});

export default RateDealScreen;
