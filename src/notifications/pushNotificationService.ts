import { requestNotificationPermission } from './firebase';
import { getDevicePushToken, onPushTokenRefresh } from './tokenManager';
import { registerForegroundNotificationHandler, registerBackgroundNotificationHandler } from './notificationHandlers';

export const initializePushNotifications = async () => {
  await requestNotificationPermission();
  const token = await getDevicePushToken();

  const unsubscribeForeground = registerForegroundNotificationHandler(() => undefined);
  const unsubscribeTokenRefresh = onPushTokenRefresh(() => undefined);
  registerBackgroundNotificationHandler();

  return {
    token,
    cleanup: () => {
      unsubscribeForeground();
      unsubscribeTokenRefresh();
    },
  };
};
