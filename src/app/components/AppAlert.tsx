import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppIcon } from '../../assets/icons';
import type { AppIconName } from '../../assets/icons';

type AlertType = 'error' | 'success' | 'info' | 'warning';

export interface AlertOptions {
  duration?: number;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertState {
  type: AlertType;
  title: string;
  body?: string;
  duration: number;
  confirmText: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const CONFIG: Record<AlertType, { color: string; icon: AppIconName }> = {
  error:   { color: '#EF4444', icon: 'alertCircle' },
  success: { color: '#22C55E', icon: 'checkCircle' },
  warning: { color: '#F59E0B', icon: 'alertTriangle' },
  info:    { color: '#3B82F6', icon: 'faq' },
};

const CARD_WIDTH = Math.min(Dimensions.get('window').width - 64, 300);

// ─── Imperative bridge ────────────────────────────────────────────────────────

let _setAlert: ((state: AlertState | null) => void) | null = null;

export const showAlert = (
  type: AlertType,
  title: string,
  body?: string,
  options?: AlertOptions,
) => {
  _setAlert?.({
    type,
    title,
    body,
    duration: options?.duration ?? 3500,
    confirmText: options?.confirmText ?? 'OK',
    cancelText: options?.cancelText,
    onConfirm: options?.onConfirm,
    onCancel: options?.onCancel,
  });
};

export const showConfirm = (
  type: AlertType,
  title: string,
  body?: string,
  onConfirm?: () => void,
  onCancel?: () => void,
) => {
  showAlert(type, title, body, {
    confirmText: 'OK',
    cancelText: 'Cancel',
    onConfirm,
    onCancel,
  });
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AppAlertProvider = () => {
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [visible, setVisible] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0.82)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const animateOut = useCallback((onDone?: () => void) => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      setAlert(null);
      onDone?.();
    });
  }, [opacityAnim]);

  useEffect(() => {
    _setAlert = (state) => {
      if (!state) {
        animateOut();
        return;
      }
      // Reset animations
      scaleAnim.setValue(0.82);
      opacityAnim.setValue(0);
      progressAnim.setValue(0);
      setAlert(state);
      setVisible(true);
    };
    return () => { _setAlert = null; };
  }, [animateOut, scaleAnim, opacityAnim, progressAnim]);

  useEffect(() => {
    if (!visible || !alert) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 280,
        friction: 22,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: alert.duration,
      useNativeDriver: false,
    }).start();

    dismissTimerRef.current = setTimeout(() => animateOut(), alert.duration);

    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [visible, alert, scaleAnim, opacityAnim, progressAnim, animateOut]);

  if (!visible || !alert) return null;

  const { color, icon } = CONFIG[alert.type];

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal
      transparent
      visible
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => animateOut()}
    >
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => animateOut()} />

        <Animated.View
          style={[
            styles.card,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          ]}
        >
          <View style={styles.cardContent}>
            {/* Icon circle */}
            <View style={[styles.iconCircle, { backgroundColor: color }]}>
              <AppIcon name={icon} size={28} color="#fff" />
            </View>

            {/* Text */}
            <Text style={styles.title}>{alert.title}</Text>
            {!!alert.body && (
              <Text style={styles.body}>{alert.body}</Text>
            )}
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            {!!alert.cancelText && (
              <TouchableOpacity
                style={styles.cancelBtn}
                activeOpacity={0.7}
                onPress={() => animateOut(alert.onCancel)}
              >
                <Text style={styles.cancelText}>{alert.cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.confirmBtn,
                { backgroundColor: color },
                !alert.cancelText && styles.confirmBtnFull,
              ]}
              activeOpacity={0.85}
              onPress={() => animateOut(alert.onConfirm)}
            >
              <Text style={styles.confirmText}>{alert.confirmText}</Text>
            </TouchableOpacity>
          </View>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressBar,
                { backgroundColor: color, width: progressWidth },
              ]}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  },
  confirmBtnFull: {
    flex: 1,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#F3F4F6',
  },
  progressBar: {
    height: 4,
  },
});
