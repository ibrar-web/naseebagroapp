import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../../assets/icons';
import type { AppIconName } from '../../assets/icons';

export type AppToastOptions = {
  title: string;
  body?: string;
  icon?: AppIconName;
  imageSource?: ImageSourcePropType;
  accentColor?: string;
  duration?: number;
  onPress?: () => void;
};

type ToastState = {
  title: string;
  body?: string;
  icon: AppIconName;
  imageSource?: ImageSourcePropType;
  accentColor: string;
  duration: number;
  onPress?: () => void;
};

// ─── Imperative bridge ────────────────────────────────────────────────────────

let _show: ((opts: AppToastOptions) => void) | null = null;

export const showToast = (opts: AppToastOptions) => {
  _show?.(opts);
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AppToastProvider = () => {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);
  const [visible, setVisible] = useState(false);

  const translateY = useRef(new Animated.Value(-140)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.parallel([
      Animated.timing(translateY, { toValue: -140, duration: 250, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setVisible(false);
      setToast(null);
    });
  }, [translateY, opacityAnim]);

  useEffect(() => {
    _show = (opts) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      translateY.setValue(-140);
      opacityAnim.setValue(0);
      progressAnim.setValue(0);
      setToast({
        title: opts.title,
        body: opts.body,
        icon: opts.icon ?? 'notificationOffers',
        imageSource: opts.imageSource,
        accentColor: opts.accentColor ?? '#4ADE80',
        duration: opts.duration ?? 5000,
        onPress: opts.onPress,
      });
      setVisible(true);
    };
    return () => { _show = null; };
  }, [translateY, opacityAnim, progressAnim]);

  useEffect(() => {
    if (!visible || !toast) return;

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 200,
        friction: 22,
      }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: toast.duration,
      useNativeDriver: false,
    }).start();

    timerRef.current = setTimeout(() => dismiss(), toast.duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [visible, toast, translateY, opacityAnim, progressAnim, dismiss]);

  if (!visible || !toast) return null;

  const { accentColor, icon, imageSource, title, body, onPress } = toast;
  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { top: insets.top + 10, transform: [{ translateY }], opacity: opacityAnim },
      ]}
    >
      <Pressable
        style={styles.card}
        onPress={() => { onPress?.(); dismiss(); }}
        android_ripple={{ color: '#0000000A' }}
      >
        <View style={styles.row}>
          <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
          <View style={[styles.iconBox, { backgroundColor: accentColor + '22' }]}>
            {imageSource
              ? <Image source={imageSource} style={styles.iconImage} resizeMode="contain" />
              : <AppIcon name={icon} size={20} color={accentColor} />
            }
          </View>
          <View style={styles.textArea}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            {!!body && <Text style={styles.body} numberOfLines={2}>{body}</Text>}
            {!!onPress && (
              <View style={styles.hintRow}>
                <Text style={[styles.hint, { color: accentColor }]}>Tap to view</Text>
                <AppIcon name="arrowRight" size={10} color={accentColor} />
              </View>
            )}
          </View>
        </View>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, { backgroundColor: accentColor, width: progressWidth }]} />
        </View>
      </Pressable>
    </Animated.View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 9999,
    elevation: 9999,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  accentBar: {
    width: 4,
    height: 44,
    borderRadius: 2,
    flexShrink: 0,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textArea: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 3,
    lineHeight: 15,
  },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 1 },
  hint: {
    fontSize: 10,
    fontWeight: '600',
  },
  iconImage: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  progressTrack: {
    height: 3,
    backgroundColor: '#F3F4F6',
  },
  progressBar: {
    height: 3,
  },
});
