import { showToast } from './AppToast';
import { navigationRef } from '../../navigation/AppNavigator';
import type { AppIconName } from '../../assets/icons';

export { showAlert, showConfirm } from './AppAlert';

// ─── Preset helpers ───────────────────────────────────────────────────────────

export const showOfferToast = (offerId: string, title: string, body?: string) => {
  if (!navigationRef.isReady()) return;
  const route = navigationRef.getCurrentRoute();
  const alreadyOnScreen =
    route?.name === 'Negotiation' && (route.params as any)?.offerId === offerId;
  if (alreadyOnScreen) return;
  showToast({
    title,
    body,
    icon: 'currency',
    accentColor: '#4ADE80',
    onPress: () => {
      if (navigationRef.isReady()) navigationRef.navigate('Negotiation', { offerId });
    },
  });
};

export const showPostToast = (
  title: string,
  body: string,
  postId: string,
  post_type: 'supply' | 'demand',
  variant: 'success' | 'warning' | 'error' = 'success',
) => {
  const accent =
    variant === 'success' ? '#4ADE80' : variant === 'warning' ? '#FBBF24' : '#F87171';
  const icon: AppIconName = variant === 'success' ? 'approved' : 'notificationWarning';
  showToast({
    title,
    body,
    icon,
    accentColor: accent,
    onPress: () => {
      if (navigationRef.isReady())
        navigationRef.navigate('PostDetail', { postId, post_type });
    },
  });
};

export const showDealToast = (title: string, body: string, dealId: string, mode?: 'buyer' | 'seller') => {
  showToast({
    title,
    body,
    icon: 'currency',
    accentColor: '#60A5FA',
    onPress: () => {
      if (navigationRef.isReady()) navigationRef.navigate('DealDetail', { dealId, ...(mode ? { mode } : {}) });
    },
  });
};

export const showDisputeToast = (title: string, body: string, disputeId: string) => {
  showToast({
    title,
    body,
    icon: 'notificationWarning',
    accentColor: '#F97316',
    onPress: () => {
      if (navigationRef.isReady()) navigationRef.navigate('DisputeDetail', { disputeId });
    },
  });
};

export const showQueryToast = (title: string, body: string, variant: 'info' | 'success' = 'info') => {
  const accent = variant === 'success' ? '#4ADE80' : '#60A5FA';
  showToast({
    title,
    body,
    icon: 'notificationWarning',
    accentColor: accent,
    onPress: () => {
      if (navigationRef.isReady()) navigationRef.navigate('MainTabs', { screen: 'Profile' });
    },
  });
};

export const showProfileToast = (
  title: string,
  body: string,
  status: 'approved' | 'rejected',
  onPress?: () => void,
) => {
  const accent = status === 'approved' ? '#4ADE80' : '#F87171';
  const icon: AppIconName = status === 'approved' ? 'approved' : 'notificationWarning';
  showToast({ title, body, icon, accentColor: accent, onPress });
};
