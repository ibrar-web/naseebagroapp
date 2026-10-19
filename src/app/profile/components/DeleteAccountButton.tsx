import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppIcon } from '../../../assets/icons';
import { useTranslation } from '../../../localization';
import api from '../../../utils/api/index';
import { showConfirm } from '../../components/toastConfig';
import { forceLogout } from '../../auth/utils/forceLogout';

// Long enough to read the warning before the alert closes itself.
const CONFIRM_DURATION_MS = 12000;

// Let the dialog finish closing before another modal (the logout alert) opens;
// iOS cannot present two modals at once.
const MODAL_CLOSE_DELAY_MS = 350;

/**
 * "Delete Account" under Log Out: confirm alert → password → permanent delete.
 * Errors (wrong password, open deals) are shown inside the password dialog.
 */
export const DeleteAccountButton = () => {
  const { t } = useTranslation();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const askConfirm = () => {
    showConfirm(
      'warning',
      t('profile.deleteConfirmTitle'),
      t('profile.deleteConfirmBody'),
      () => setPasswordVisible(true),
      undefined,
      CONFIRM_DURATION_MS,
    );
  };

  const closePassword = () => {
    setPasswordVisible(false);
    setPassword('');
    setShowPassword(false);
    setError(null);
  };

  const onChangePassword = (value: string) => {
    setPassword(value);
    setError(null);
  };

  const submit = async () => {
    setDeleting(true);
    setError(null);
    try {
      await api.profile.personal.deleteAccount(password);
      closePassword();
      setTimeout(
        () =>
          forceLogout(
            t('profile.deleteDoneTitle'),
            t('profile.deleteDoneBody'),
          ),
        MODAL_CLOSE_DELAY_MS,
      );
    } catch (err: any) {
      // 401 is handled globally (session ended); just close the dialog.
      if (err?.response?.status === 401) {
        closePassword();
        return;
      }
      // Keep the typed password so the user can reveal and fix it.
      setError(err?.response?.data?.message || t('profile.deleteFailed'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={askConfirm}
        activeOpacity={0.7}
        style={styles.deleteBtn}
      >
        <AppIcon name="trash" size={18} color="#DC2626" />
        <Text style={styles.deleteText}>{t('profile.deleteAccount')}</Text>
      </TouchableOpacity>

      <Modal
        transparent
        visible={passwordVisible}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => !deleting && closePassword()}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.overlay}
        >
          <View style={styles.card}>
            <Text style={styles.title}>{t('profile.deletePasswordTitle')}</Text>
            <Text style={styles.hint}>{t('profile.deletePasswordHint')}</Text>
            <View style={[styles.inputRow, !!error && styles.inputRowError]}>
              <TextInput
                value={password}
                onChangeText={onChangePassword}
                placeholder={t('profile.deletePasswordPlaceholder')}
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                autoFocus
                autoCapitalize="none"
                autoCorrect={false}
                editable={!deleting}
                style={styles.input}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(v => !v)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.eyeBtn}
              >
                <AppIcon
                  name={showPassword ? 'eyeOff' : 'eye'}
                  size={18}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
            {!!error && <Text style={styles.errorText}>{error}</Text>}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={closePassword}
                disabled={deleting}
                activeOpacity={0.7}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>
                  {t('profile.deleteCancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={submit}
                disabled={!password || deleting}
                activeOpacity={0.85}
                style={[styles.submitBtn, !password && styles.submitDisabled]}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitText}>
                    {t('profile.deleteSubmit')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  deleteBtn: {
    marginTop: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#DC2626',
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteText: { fontSize: 15, fontWeight: '700', color: '#DC2626' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
  },
  title: { fontSize: 16, fontWeight: '700', color: '#111827' },
  hint: { fontSize: 13, color: '#6B7280', marginTop: 6 },
  inputRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
  },
  inputRowError: { borderColor: '#DC2626' },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  eyeBtn: { paddingHorizontal: 12, paddingVertical: 10 },
  errorText: { marginTop: 6, fontSize: 12, color: '#DC2626' },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  cancelText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  submitBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#EF4444',
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});
