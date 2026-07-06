import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useAppDispatch } from '../../../store';
import { setRegisterIdInfo } from '../../../store/slices/registerSlice';
import { AppIcon } from '../../../assets/icons';
import { Feather } from '../../../assets/icons/feather';
import AuthStatusBar from '../components/AuthStatusBar';

type Props = NativeStackScreenProps<RootStackParamList, 'IdVerify'>;
type UploadState = { uri: string; name: string } | null;

const GREEN = '#217A3C';
const DARK_GREEN = '#145228';
const STEP_ACTIVE = 2;
const STEP_TOTAL = 5;

const pickImage = (onPick: (uri: string, name: string) => void) => {
  Alert.alert(
    'Select Photo',
    'Choose how to upload your CNIC photo',
    [
      {
        text: 'Camera',
        onPress: () =>
          launchCamera({ mediaType: 'photo', quality: 0.8 }, res => {
            const asset = res.assets?.[0];
            if (asset?.uri) onPick(asset.uri, asset.fileName ?? 'cnic.jpg');
          }),
      },
      {
        text: 'Gallery',
        onPress: () =>
          launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, res => {
            const asset = res.assets?.[0];
            if (asset?.uri) onPick(asset.uri, asset.fileName ?? 'cnic.jpg');
          }),
      },
      { text: 'Cancel', style: 'cancel' },
    ],
  );
};

const IdVerifyScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const [cnic, setCnic] = useState('');
  const [front, setFront] = useState<UploadState>(null);
  const [back, setBack] = useState<UploadState>(null);

  const canContinue = cnic.length >= 13 && front !== null && back !== null;

  const handleContinue = () => {
    dispatch(setRegisterIdInfo({ cnic, cnicFront: front!, cnicBack: back! }));
    navigation.navigate('PaymentSetup');
  };

  const UploadBox = ({
    label,
    data,
    onPress,
    onRemove,
    isCamera,
  }: {
    label: string;
    data: UploadState;
    onPress: () => void;
    onRemove: () => void;
    isCamera?: boolean;
  }) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      {data ? (
        <View style={[styles.uploadBox, styles.uploadBoxFilled]}>
          <Image source={{ uri: data.uri }} style={styles.preview} resizeMode="cover" />
          <Text style={styles.uploadedName} numberOfLines={1}>
            ✓ {data.name}
          </Text>
          <TouchableOpacity onPress={onRemove} style={styles.removeBtn} activeOpacity={0.8}>
            <Feather name="x" size={13} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={onPress} style={styles.uploadBox} activeOpacity={0.8}>
          <Text style={styles.uploadIcon}>{isCamera ? '📷' : '⬆'}</Text>
          <Text style={styles.uploadText}>Tap to upload or take photo</Text>
          <Text style={styles.uploadHint}>JPG, PNG up to 5MB</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <AuthStatusBar />
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <AppIcon name="back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Identity Verification</Text>
        <Text style={styles.headerSubtitle}>Step 3 of 5 — Required by SECP</Text>
        <View style={styles.dotsRow}>
          {Array.from({ length: STEP_TOTAL }).map((_, i) => (
            <Text
              key={i}
              style={[
                styles.dot,
                i <= STEP_ACTIVE ? styles.dotActive : styles.dotInactive,
              ]}
            >
              {i <= STEP_ACTIVE ? '●' : '○'}
            </Text>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* CNIC */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>CNIC Number</Text>
          <TextInput
            style={styles.input}
            placeholder="XXXXX-XXXXXXX-X"
            placeholderTextColor="#9CA3AF"
            value={cnic}
            onChangeText={setCnic}
            keyboardType="numbers-and-punctuation"
            maxLength={15}
          />
          <Text style={styles.hint}>13-digit National ID number</Text>
        </View>

        <UploadBox
          label="Upload CNIC (Front)"
          data={front}
          onPress={() => pickImage((uri, name) => setFront({ uri, name }))}
          onRemove={() => setFront(null)}
        />

        <UploadBox
          label="Upload CNIC (Back)"
          data={back}
          onPress={() => pickImage((uri, name) => setBack({ uri, name }))}
          onRemove={() => setBack(null)}
          isCamera
        />

        {/* Security note */}
        <View style={styles.securityCard}>
          <Text style={styles.securityIcon}>🛡</Text>
          <Text style={styles.securityText}>
            Your documents are encrypted and only used for identity verification.
            Required by SECP for financial transactions.
          </Text>
        </View>

        <View style={styles.spacer} />

        <TouchableOpacity
          onPress={handleContinue}
          style={[styles.ctaBtn, !canContinue && styles.ctaDisabled]}
          disabled={!canContinue}
          activeOpacity={0.88}
        >
          <Text style={styles.ctaText}>→ Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: DARK_GREEN,
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 28,
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    top: 44,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    padding: 8,
  },
  dotsRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  dot: { fontSize: 14 },
  dotActive: { color: '#F3CD03' },
  dotInactive: { color: 'rgba(255,255,255,0.267)', fontSize: 10 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 50 },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.533)',
    marginTop: 4,
  },
  scroll: { padding: 24, paddingTop: 24, paddingBottom: 40, flexGrow: 1 },
  fieldGroup: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
  },
  hint: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
  uploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    gap: 6,
  },
  uploadBoxFilled: {
    borderStyle: 'solid',
    borderColor: GREEN,
    backgroundColor: '#F0FDF4',
  },
  uploadIcon: { fontSize: 24, color: '#9CA3AF' },
  uploadText: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  uploadHint: { fontSize: 11, color: '#9CA3AF' },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadedName: {
    fontSize: 12,
    color: GREEN,
    fontWeight: '600',
    marginTop: 6,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  preview: { width: '100%', height: 120, borderRadius: 12 },
  securityCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  securityIcon: { fontSize: 18 },
  securityText: { flex: 1, fontSize: 12, color: '#92400E', lineHeight: 18 },
  spacer: { flex: 1, minHeight: 16 },
  ctaBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: '#2E9E52',
    shadowOpacity: 0.27,
    shadowRadius: 12,
    elevation: 4,
  },
  ctaDisabled: { opacity: 0.5, shadowOpacity: 0, elevation: 0 },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});

export default IdVerifyScreen;
