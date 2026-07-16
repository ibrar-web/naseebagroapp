import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import MockStatusBar from '../../components/MockStatusBar';
import { AppLoader } from '../../components';
import api from '../../../utils/api';

const ChangePasswordScreen = ({ navigation }: any) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const canSubmit =
    currentPassword.length >= 6 &&
    newPassword.length >= 6 &&
    confirmPassword.length >= 6;

  const handleSubmit = async () => {
    if (!canSubmit || saving) return;
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New password and confirm password do not match.');
      return;
    }
    setSaving(true);
    try {
      await (api as any).auth.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      Alert.alert('Success', 'Your password has been updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      // interceptor already shows the alert for 401 (wrong password) and 400 errors
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <MockStatusBar backgroundColor="#FFFFFF" />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Text style={s.backArrow}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Change PIN / Password</Text>
        <View style={s.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.card}>
          <PasswordField
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            show={showCurrent}
            onToggle={() => setShowCurrent(v => !v)}
          />
          <View style={s.divider} />
          <PasswordField
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            show={showNew}
            onToggle={() => setShowNew(v => !v)}
          />
          <View style={s.divider} />
          <PasswordField
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showConfirm}
            onToggle={() => setShowConfirm(v => !v)}
          />
        </View>

        <Text style={s.hint}>Password must be at least 6 characters.</Text>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit || saving}
          style={[s.submitBtn, (!canSubmit || saving) && s.submitBtnDisabled]}
          activeOpacity={0.85}
        >
          <Text style={s.submitBtnText}>Update Password</Text>
        </TouchableOpacity>
      </ScrollView>

      <AppLoader visible={saving} overlay message="Updating..." />
    </KeyboardAvoidingView>
  );
};

const PasswordField = ({
  label,
  value,
  onChange,
  show,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
}) => (
  <View style={s.fieldRow}>
    <Text style={s.fieldLabel}>{label}</Text>
    <View style={s.inputRow}>
      <TextInput
        style={s.input}
        value={value}
        onChangeText={onChange}
        secureTextEntry={!show}
        placeholder="••••••••"
        placeholderTextColor="#D1D5DB"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TouchableOpacity onPress={onToggle} style={s.eyeBtn} activeOpacity={0.7}>
        <Text style={s.eyeText}>{show ? 'Hide' : 'Show'}</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F9FAFB' },
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
  backBtn: { padding: 4, borderRadius: 8, transform: [{ rotate: '180deg' }] },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  headerSpacer: { width: 30 },
  content: { padding: 20, paddingBottom: 60 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginBottom: 12,
  },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 16 },
  fieldRow: { padding: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, fontSize: 15, color: '#111827', fontWeight: '500' },
  eyeBtn: { padding: 4 },
  eyeText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  backArrow: { fontSize: 28, fontWeight: '300', color: '#111827', lineHeight: 30 },
  hint: { fontSize: 12, color: '#9CA3AF', marginBottom: 24 },
  submitBtn: {
    backgroundColor: '#145228',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
});

export default ChangePasswordScreen;
