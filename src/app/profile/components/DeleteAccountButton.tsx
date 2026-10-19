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

/**
 * "Delete Account" under Log Out: confirm alert → password → permanent delete.
 * Errors (wrong password, open deals) are shown by the global HTTP alert.
 */
export const DeleteAccountButton = () => {
  const { t } = useTranslation();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const askConfirm = () => {
    showConfirm(
      'warning',
      t('profile.deleteConfirmTitle'),
      t('profile.deleteConfirmBody'),
      () => setPasswordVisible(true),
    );
  };

  const closePassword = () => {
    setPasswordVisible(false);
    setPassword('');
  };

  const submit = async () => {
    const entered = password;
    // Close first: two modals at once do not present on iOS, and the global
    // error alert is a modal too.
    closePassword();
    setDeleting(true);
    try {
      await api.profile.personal.deleteAccount(entered);
      forceLogout(t('profile.deleteDoneTitle'), t('profile.deleteDoneBody'));
    } catch {
      // Already shown by the HTTP error handler.
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={askConfirm}
        disabled={deleting}
        activeOpacity={0.7}
        style={styles.deleteBtn}
      >
        {deleting ? (
          <ActivityIndicator size="small" color="#9CA3AF" />
        ) : (
          <AppIcon name="trash" size={15} color="#9CA3AF" />
        )}
        <Text style={styles.deleteText}>{t('profile.deleteAccount')}</Text>
      </TouchableOpacity>

      <Modal
        transparent
        visible={passwordVisible}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closePassword}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.overlay}
        >
          <View style={styles.card}>
            <Text style={styles.title}>{t('profile.deletePasswordTitle')}</Text>
            <Text style={styles.hint}>{t('profile.deletePasswordHint')}</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder={t('profile.deletePasswordPlaceholder')}
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={closePassword}
                activeOpacity={0.7}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>
                  {t('profile.deleteCancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={submit}
                disabled={!password}
                activeOpacity={0.85}
                style={[styles.submitBtn, !password && styles.submitDisabled]}
              >
                <Text style={styles.submitText}>
                  {t('profile.deleteSubmit')}
                </Text>
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
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  deleteText: { fontSize: 13, fontWeight: '600', color: '#9CA3AF' },
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
  input: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
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
