import React from 'react';
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppIcon } from '../../assets/icons';
import { Colors } from '../../constants/theme';
import { useAppUpdateCheck } from '../../hooks/useAppUpdateCheck';
import { useTranslation } from '../../localization';

const CARD_WIDTH = Math.min(Dimensions.get('window').width - 64, 320);
const PRIMARY = Colors.green700;

/** Shown when the store has a newer build. Forced updates cannot be dismissed. */
const AppUpdatePrompt = () => {
  const { info, openStore, dismiss } = useAppUpdateCheck();
  const { t } = useTranslation();

  if (!info) return null;
  const forced = info.force_update;

  return (
    <Modal
      transparent
      visible
      animationType="fade"
      statusBarTranslucent
      onRequestClose={forced ? () => {} : dismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.iconCircle}>
              <AppIcon name="version" size={28} color="#fff" />
            </View>
            <Text style={styles.title}>
              {t(forced ? 'appUpdate.requiredTitle' : 'appUpdate.title')}
            </Text>
            <Text style={styles.body}>
              {info.latest_version
                ? t(forced ? 'appUpdate.requiredBody' : 'appUpdate.body', { version: info.latest_version })
                : t(forced ? 'appUpdate.requiredBodyGeneric' : 'appUpdate.bodyGeneric')}
            </Text>
            {!!info.release_notes && (
              <Text style={styles.notes}>{info.release_notes}</Text>
            )}
          </View>

          <View style={styles.buttonRow}>
            {!forced && (
              <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.7} onPress={dismiss}>
                <Text style={styles.cancelText}>{t('appUpdate.later')}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.confirmBtn} activeOpacity={0.85} onPress={openStore}>
              <Text style={styles.confirmText}>{t('appUpdate.updateNow')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AppUpdatePrompt;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 10 },
    elevation: 20,
  },
  cardContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    backgroundColor: PRIMARY,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  notes: {
    fontSize: 13,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
