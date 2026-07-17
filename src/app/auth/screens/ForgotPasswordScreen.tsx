import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import api from '../../../utils/api';

const WINDOW_HEIGHT = Dimensions.get('window').height;

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = email.includes('@') && email.includes('.');

  const handleSubmit = async () => {
    if (!canSubmit || loading || sent) {
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.auth.forgotPassword({ email: email.trim().toLowerCase() });
      setSent(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.root}
    >
      <StatusBar barStyle="light-content" backgroundColor="white" />

      {/* Green hero */}
      <View style={styles.hero}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>{'← Back'}</Text>
        </TouchableOpacity>

        <View style={styles.logoCircle}>
          <Text style={styles.logoUrdu}>نصیب</Text>
          <Text style={styles.logoAgri}>AGRI</Text>
        </View>
        <Text style={styles.heroTitle}>Forgot Password</Text>
        <Text style={styles.heroSubtitle}>
          Enter your email address and we'll send you a reset link
        </Text>
      </View>

      {/* White card */}
      <View style={styles.card}>
        <ScrollView
          contentContainerStyle={styles.cardScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.cardTitle}>Reset Password</Text>

          <Text style={styles.inputLabel}>Email Address</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputText}
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={v => {
                setEmail(v);
                if (error) {
                  setError('');
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!sent}
            />
          </View>

          {/* Error text */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Success state */}
          {sent ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>
                Check your email for the reset link
              </Text>
            </View>
          ) : null}

          {/* Submit button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canSubmit || loading || sent}
            style={[
              styles.submitBtn,
              (!canSubmit || loading || sent) && styles.submitBtnDisabled,
            ]}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>
                {sent ? 'Link Sent' : 'Send Reset Link'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Back to login */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backToLogin}
            activeOpacity={0.7}
          >
            <Text style={styles.backToLoginText}>Back to Sign In</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    backgroundColor: 'rgb(13, 59, 31)',
    flex: 1,
    justifyContent: 'space-between',
  },
  hero: {
    paddingTop: 56,
    paddingBottom: 48,
    alignItems: 'center',
    backgroundColor: 'rgb(13, 59, 31)',
  },
  backBtn: {
    position: 'absolute',
    top: 56,
    left: 20,
    padding: 8,
  },
  backText: {
    color: '#86EFAC',
    fontSize: 14,
    fontWeight: '600',
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  logoUrdu: {
    fontSize: 20,
    fontWeight: '800',
    color: '#145228',
    lineHeight: 26,
  },
  logoAgri: {
    fontSize: 8,
    fontWeight: '700',
    color: '#1A6B34',
    letterSpacing: 2,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  heroSubtitle: {
    color: '#86EFAC',
    textAlign: 'center',
    fontSize: 13,
    marginTop: 8,
    paddingHorizontal: 32,
  },
  card: {
    height: WINDOW_HEIGHT * 0.58,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  cardScroll: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40 },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  inputRow: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
    marginBottom: 12,
  },
  inputText: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    marginBottom: 12,
    fontWeight: '500',
  },
  successBox: {
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  successText: {
    color: '#15803D',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: '#15803D',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#1A6B34',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  submitBtnDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  backToLogin: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  backToLoginText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;
