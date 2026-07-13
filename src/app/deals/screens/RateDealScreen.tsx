import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { MockStatusBar } from '../../components';
import { AppIcon } from '../../../assets/icons';
import api from '../../../utils/api';

type Props = NativeStackScreenProps<RootStackParamList, 'RateDeal'>;

const QUESTIONS: {
  key: string;
  apiKey: string;
  label: string;
  options: { label: string; value: string }[];
}[] = [
  {
    key: 'delivery',
    apiKey: 'delivery_rating',
    label: '1. Was delivery on time?',
    options: [
      { label: 'Yes, on time', value: 'on_time' },
      { label: 'Slightly delayed', value: 'slightly_delayed' },
      { label: 'Very delayed', value: 'very_delayed' },
    ],
  },
  {
    key: 'quantity',
    apiKey: 'quantity_rating',
    label: '2. Was the quantity accurate?',
    options: [
      { label: 'Yes, accurate', value: 'accurate' },
      { label: 'Minor difference', value: 'minor_difference' },
      { label: 'Significant difference', value: 'significant_difference' },
    ],
  },
  {
    key: 'quality',
    apiKey: 'quality_rating',
    label: '3. Was the commodity quality good?',
    options: [
      { label: 'Excellent', value: 'excellent' },
      { label: 'As expected', value: 'as_expected' },
      { label: 'Below expectation', value: 'below_expectation' },
    ],
  },
  {
    key: 'process',
    apiKey: 'process_rating',
    label: '4. Was the overall process smooth?',
    options: [
      { label: 'Very smooth', value: 'very_smooth' },
      { label: 'Minor issues', value: 'minor_issues' },
      { label: 'Difficult process', value: 'difficult_process' },
    ],
  },
  {
    key: 'support',
    apiKey: 'support_rating',
    label: '5. Was the Naseeb team helpful?',
    options: [
      { label: 'Very helpful', value: 'very_helpful' },
      { label: 'Somewhat helpful', value: 'somewhat_helpful' },
      { label: 'Not helpful', value: 'not_helpful' },
    ],
  },
];

const RateDealScreen = ({ navigation, route }: Props) => {
  const { dealId, dealCode, commodityName, dealSummary } = route.params;
  const [starRating, setStarRating] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const allAnswered =
    starRating > 0 && Object.keys(answers).length === QUESTIONS.length;

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setSubmitting(true);
    try {
      const payload: Parameters<typeof api.buyer.submitRating>[1] = {
        score: starRating,
      };
      for (const q of QUESTIONS) {
        if (answers[q.key]) {
          (payload as any)[q.apiKey] = answers[q.key];
        }
      }
      await api.buyer.submitRating(dealId, payload);
      Alert.alert('Thank you!', 'Your rating has been submitted.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Something went wrong. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={s.container}>
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
        {/* Deal summary banner */}
        <View style={s.dealBanner}>
          <Text style={s.dealCode}>
            {dealCode ?? dealId.slice(0, 8)} · {commodityName ?? 'Deal'}
          </Text>
          {dealSummary ? (
            <Text style={s.dealSummary}>{dealSummary}</Text>
          ) : null}
        </View>

        {/* Star rating card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Overall Rating</Text>
          <Text style={s.cardSub}>How would you rate this deal overall?</Text>
          <View style={s.starsRow}>
            {[1, 2, 3, 4, 5].map(n => (
              <TouchableOpacity
                key={n}
                onPress={() => setStarRating(n)}
                activeOpacity={0.75}
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
            <Text style={s.ratingLabel}>
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][starRating]}
            </Text>
          )}
        </View>

        <Text style={s.questionsHint}>
          Please also answer the questions below. Your responses help us improve.
        </Text>

        {/* Q&A cards */}
        {QUESTIONS.map(q => (
          <View key={q.key} style={s.card}>
            <Text style={s.questionLabel}>{q.label}</Text>
            <View style={s.optionsCol}>
              {q.options.map(opt => {
                const selected = answers[q.key] === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() =>
                      setAnswers(prev => ({ ...prev, [q.key]: opt.value }))
                    }
                    activeOpacity={0.75}
                    style={[s.optionRow, selected && s.optionRowSelected]}
                  >
                    <View
                      style={[s.radio, selected && s.radioSelected]}
                    >
                      {selected && <View style={s.radioDot} />}
                    </View>
                    <Text
                      style={[s.optionText, selected && s.optionTextSelected]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom action */}
      <View style={s.footer}>
        {!allAnswered && (
          <View style={s.warningRow}>
            <AppIcon name="alertTriangle" size={12} color="#D4AE02" />
            <Text style={s.warningText}>
              {starRating === 0
                ? 'Please add your star rating above'
                : 'Please answer all questions'}
            </Text>
          </View>
        )}
        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={allAnswered ? 0.85 : 1}
          style={[s.submitBtn, !allAnswered && s.submitBtnDisabled]}
          disabled={!allAnswered || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <AppIcon name="checkCircle" size={17} color="#FFFFFF" />
              <Text style={s.submitText}>
                {allAnswered ? 'Submit Rating' : 'Complete all 6 fields'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
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
  dealCode: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  dealSummary: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 18,
  },

  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  starBtn: { padding: 4 },
  starIcon: { fontSize: 40 },
  ratingLabel: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: '#1A6B34',
    marginTop: 4,
  },

  questionsHint: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 18,
  },

  questionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  optionsCol: { gap: 7 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 11,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  optionRowSelected: {
    borderColor: '#1A6B34',
    backgroundColor: '#F2FBF5',
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioSelected: { borderColor: '#1A6B34' },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#1A6B34',
  },
  optionText: { fontSize: 13, fontWeight: '500', color: '#374151' },
  optionTextSelected: { color: '#1A6B34', fontWeight: '700' },

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
