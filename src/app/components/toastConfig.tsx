import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BaseToastProps, ToastConfig } from 'react-native-toast-message';
import Toast from 'react-native-toast-message';
import { AppIcon } from '../../assets/icons';
import type { AppIconName } from '../../assets/icons';
import { navigationRef } from '../../navigation/AppNavigator';

// ─── Types ───────────────────────────────────────────────────────────────────

type NotificationToastProps = BaseToastProps & {
  props?: {
    offerId?: string;
    postId?: string;
    post_type?: 'supply' | 'demand';
    dealId?: string;
    icon?: AppIconName;
    accentColor?: string;
    onPress?: () => void;
  };
};

// ─── Offer Toast (legacy, kept for backward compat) ──────────────────────────

const OfferToast = ({ text1, text2, props }: NotificationToastProps) => {
  const handlePress = () => {
    const offerId = props?.offerId;
    if (offerId && navigationRef.isReady()) {
      navigationRef.navigate('Negotiation', { offerId });
    }
    Toast.hide();
  };
  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.88}>
      <View style={[styles.iconBox, { backgroundColor: '#4ADE8022' }]}>
        <AppIcon name="currency" size={18} color="#4ADE80" />
      </View>
      <View style={styles.textArea}>
        <Text style={styles.title} numberOfLines={1}>{text1}</Text>
        {!!text2 && <Text style={styles.body} numberOfLines={2}>{text2}</Text>}
        <View style={styles.hintRow}>
          <Text style={styles.hint}>Tap to open</Text>
          <AppIcon name="arrowRight" size={10} color="rgba(255,255,255,0.30)" />
        </View>
      </View>
      <View style={styles.accentBar} />
    </TouchableOpacity>
  );
};

// ─── Generic Notification Toast ───────────────────────────────────────────────

const NotificationToast = ({ text1, text2, props }: NotificationToastProps) => {
  const handlePress = () => {
    if (props?.onPress) {
      props.onPress();
    } else if (props?.offerId && navigationRef.isReady()) {
      navigationRef.navigate('Negotiation', { offerId: props.offerId });
    } else if (props?.postId && navigationRef.isReady()) {
      navigationRef.navigate('PostDetail', { postId: props.postId, post_type: props.post_type });
    } else if (props?.dealId && navigationRef.isReady()) {
      navigationRef.navigate('DealDetail', { dealId: props.dealId });
    }
    Toast.hide();
  };

  const accent = props?.accentColor ?? '#4ADE80';
  const icon: AppIconName = props?.icon ?? 'notificationOffers';

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.88}>
      <View style={[styles.iconBox, { backgroundColor: accent + '22' }]}>
        <AppIcon name={icon} size={18} color={accent} />
      </View>
      <View style={styles.textArea}>
        <Text style={styles.title} numberOfLines={1}>{text1}</Text>
        {!!text2 && <Text style={styles.body} numberOfLines={2}>{text2}</Text>}
        <View style={styles.hintRow}>
          <Text style={styles.hint}>Tap to open</Text>
          <AppIcon name="arrowRight" size={10} color="rgba(255,255,255,0.30)" />
        </View>
      </View>
      <View style={[styles.accentBar, { backgroundColor: accent }]} />
    </TouchableOpacity>
  );
};

// ─── showAlert re-export (implemented in AppAlert.tsx as a centered modal) ────

export { showAlert, showConfirm } from './AppAlert';

// ─── Toast config ─────────────────────────────────────────────────────────────

export const toastConfig: ToastConfig = {
  offer: (props) => <OfferToast {...props} />,
  notification: (props) => <NotificationToast {...props} />,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export type AppToastOptions = {
  title: string;
  body?: string;
  duration?: number;
  offerId?: string;
  postId?: string;
  post_type?: 'supply' | 'demand';
  dealId?: string;
  icon?: AppIconName;
  accentColor?: string;
  onPress?: () => void;
};

export const showAppToast = (opts: AppToastOptions) => {
  Toast.show({
    type: 'notification',
    text1: opts.title,
    text2: opts.body,
    visibilityTime: opts.duration ?? 5000,
    props: {
      offerId: opts.offerId,
      postId: opts.postId,
      post_type: opts.post_type,
      dealId: opts.dealId,
      icon: opts.icon,
      accentColor: opts.accentColor ?? '#4ADE80',
      onPress: opts.onPress,
    },
  });
};

// ─── Preset helpers ───────────────────────────────────────────────────────────

export const showPostToast = (
  title: string,
  body: string,
  postId: string,
  post_type: 'supply' | 'demand',
  variant: 'success' | 'warning' | 'error' = 'success',
) => {
  const accent = variant === 'success' ? '#4ADE80' : variant === 'warning' ? '#FBBF24' : '#F87171';
  const icon: AppIconName = variant === 'success' ? 'approved' : 'notificationWarning';
  showAppToast({ title, body, postId, post_type, icon, accentColor: accent });
};

export const showDealToast = (title: string, body: string, dealId: string) => {
  showAppToast({ title, body, dealId, icon: 'currency', accentColor: '#60A5FA' });
};

export const showProfileToast = (
  title: string,
  body: string,
  status: 'approved' | 'rejected',
  onPress?: () => void,
) => {
  const accent = status === 'approved' ? '#4ADE80' : '#F87171';
  const icon: AppIconName = status === 'approved' ? 'approved' : 'notificationWarning';
  showAppToast({ title, body, icon, accentColor: accent, onPress });
};

export const showOfferToast = (offerId: string, title: string, body?: string) => {
  if (!navigationRef.isReady()) return;
  const route = navigationRef.getCurrentRoute();
  const alreadyOnScreen = route?.name === 'Negotiation' && (route.params as any)?.offerId === offerId;
  if (alreadyOnScreen) return;
  showAppToast({ title, body, offerId, icon: 'currency', accentColor: '#4ADE80' });
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D3B1F',
    borderRadius: 14,
    marginHorizontal: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 20,
    width: '92%',
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
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
    color: '#FFFFFF',
    marginBottom: 2,
  },
  body: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.60)',
    marginBottom: 3,
    lineHeight: 15,
  },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  hint: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.30)',
    fontWeight: '600',
  },
  accentBar: {
    width: 3,
    height: 38,
    borderRadius: 2,
    backgroundColor: '#4ADE80',
    flexShrink: 0,
  },
});
