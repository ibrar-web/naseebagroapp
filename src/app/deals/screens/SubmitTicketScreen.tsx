import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { MockStatusBar } from '../../components';
import { AppIcon } from '../../../assets/icons';

type Props = NativeStackScreenProps<RootStackParamList, 'SubmitTicket'>;

const DISPUTE_REASONS = [
  'Quality Mismatch',
  'Quantity Shortage',
  'Delayed Delivery',
  'Payment Issue',
  'Product Not Delivered',
  'Wrong Commodity',
  'Other',
];

const SubmitTicketScreen = ({ navigation, route }: Props) => {
  const { dealId, dealCode, commodityName, dealSummary, imageUrl } =
    route.params;

  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = reason.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      // TODO: wire up API call
      await new Promise(r => setTimeout(r, 900));
      Alert.alert(
        'Ticket Submitted',
        'Your dispute ticket has been submitted. Our team will review it within 24 hours.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
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
        <Text style={s.headerTitle}>Submit a Ticket</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero deal banner */}
        <View style={s.heroWrap}>
          <ImageBackground
            source={imageUrl ? { uri: imageUrl } : undefined}
            style={s.hero}
            imageStyle={s.heroImg}
          >
            {!imageUrl && <View style={s.heroFallback} />}
            <View style={s.heroOverlay} />
            <View style={s.heroContent}>
              <Text style={s.heroCode}>
                {dealCode ?? `Deal - ${dealId.slice(0, 6)}`}
              </Text>
              <Text style={s.heroCommodity}>
                {commodityName ?? 'Deal'}
              </Text>
              {dealSummary ? (
                <Text style={s.heroSummary}>{dealSummary}</Text>
              ) : null}
            </View>
          </ImageBackground>
        </View>

        {/* Dispute Reason */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Dispute Reason</Text>
          <TouchableOpacity
            style={s.picker}
            onPress={() => setPickerVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={[s.pickerText, !reason && s.pickerPlaceholder]}>
              {reason || 'Select Option...'}
            </Text>
            <AppIcon name="chevronDown" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Additional Note */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Additional Note</Text>
          <View style={s.textAreaWrap}>
            <TextInput
              style={s.textArea}
              placeholder="Text...."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={note}
              onChangeText={setNote}
            />
          </View>
        </View>
      </ScrollView>

      {/* Submit button */}
      <View style={s.footer}>
        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={canSubmit ? 0.85 : 1}
          style={[s.submitBtn, !canSubmit && s.submitBtnDisabled]}
          disabled={!canSubmit || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={s.submitText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Reason picker modal */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <TouchableOpacity
          style={s.modalOverlay}
          activeOpacity={1}
          onPress={() => setPickerVisible(false)}
        />
        <View style={s.modalSheet}>
          <View style={s.modalHandle} />
          <Text style={s.modalTitle}>Select Dispute Reason</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {DISPUTE_REASONS.map(r => (
              <TouchableOpacity
                key={r}
                style={[s.modalOption, reason === r && s.modalOptionSelected]}
                onPress={() => {
                  setReason(r);
                  setPickerVisible(false);
                }}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    s.modalOptionText,
                    reason === r && s.modalOptionTextSelected,
                  ]}
                >
                  {r}
                </Text>
                {reason === r && (
                  <AppIcon name="approved" size={16} color="#1A6B34" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },

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
  scrollContent: { paddingBottom: 120 },

  heroWrap: { height: 200, overflow: 'hidden' },
  hero: { flex: 1 },
  heroImg: { resizeMode: 'cover' },
  heroFallback: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#145228',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  heroCode: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  heroCommodity: { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
  heroSummary: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  pickerText: { fontSize: 14, color: '#111827', flex: 1 },
  pickerPlaceholder: { color: '#9CA3AF' },
  textAreaWrap: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    overflow: 'hidden',
  },
  textArea: {
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 120,
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: 'transparent',
  },
  submitBtn: {
    backgroundColor: '#217A3C',
    borderRadius: 12,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2E9E52',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  submitBtnDisabled: { opacity: 0.55 },
  submitText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 14,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalOptionSelected: { backgroundColor: '#F2FBF5', borderRadius: 8, paddingHorizontal: 8 },
  modalOptionText: { fontSize: 14, color: '#374151' },
  modalOptionTextSelected: { color: '#1A6B34', fontWeight: '700' },
});

export default SubmitTicketScreen;
