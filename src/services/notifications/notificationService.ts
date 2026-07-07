import { Platform, PermissionsAndroid } from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../utils/api';
import { navigationRef } from '../../navigation/AppNavigator';

const TOKEN_KEY = 'fcm_token';
const TOKEN_TS_KEY = 'fcm_token_ts';
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

async function requestPermission(): Promise<boolean> {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }
  const status = await messaging().requestPermission();
  return (
    status === messaging.AuthorizationStatus.AUTHORIZED ||
    status === messaging.AuthorizationStatus.PROVISIONAL
  );
}

async function getDeviceName(): Promise<string> {
  const os = Platform.OS === 'ios' ? 'iOS' : 'Android';
  return `${os} ${Platform.Version}`;
}

async function syncToken(force = false): Promise<void> {
  const now = Date.now();
  const lastTs = await AsyncStorage.getItem(TOKEN_TS_KEY);
  const storedToken = await AsyncStorage.getItem(TOKEN_KEY);

  const expired = !lastTs || now - Number(lastTs) > THREE_DAYS_MS;

  if (!force && !expired && storedToken) return;

  const token = await messaging().getToken();
  if (!token) return;

  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [TOKEN_TS_KEY, String(now)],
  ]);

  const deviceName = await getDeviceName();
  try {
    await api.profile.registerDeviceToken({ token, device_name: deviceName });
  } catch {
    // silently fail — will retry on next launch
  }
}

export async function initNotifications(): Promise<void> {
  const granted = await requestPermission();
  if (!granted) return;

  await syncToken();

  // Refresh token when Firebase rotates it
  messaging().onTokenRefresh(async token => {
    const deviceName = await getDeviceName();
    await AsyncStorage.multiSet([
      [TOKEN_KEY, token],
      [TOKEN_TS_KEY, String(Date.now())],
    ]);
    try {
      await api.profile.registerDeviceToken({ token, device_name: deviceName });
    } catch {}
  });
}

export async function removeDeviceToken(): Promise<void> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (!token) return;
  try {
    await api.profile.removeDeviceToken({ token });
  } catch {}
  await AsyncStorage.multiRemove([TOKEN_KEY, TOKEN_TS_KEY]);
}

function handleNotificationNavigation(
  payload: FirebaseMessagingTypes.RemoteMessage,
): void {
  if (!navigationRef.isReady()) return;

  const data = payload.data ?? {};
  const module = data.module as string | undefined;
  const type = data.type as string | undefined;
  const entityId = data.entity_id as string | undefined;

  if (!module) return;

  switch (module) {
    case 'offer':
    case 'negotiation':
      if (entityId) {
        navigationRef.navigate('Negotiation', {
          offerId: entityId,
          mode: (data.mode as 'buyer' | 'seller') ?? 'buyer',
        });
      }
      break;

    case 'deal':
      if (entityId) {
        navigationRef.navigate('DealDetail', { dealId: entityId });
      }
      break;

    case 'profile':
      if (type === 'kyc_updated' || type === 'profile.kyc_updated') {
        navigationRef.navigate('MainTabs', { screen: 'Profile' });
      }
      break;

    case 'truck':
      if (entityId) {
        navigationRef.navigate('DealDetail', { dealId: entityId });
      }
      break;

    default:
      navigationRef.navigate('MainTabs', { screen: 'Home' });
  }
}

export function setupNotificationListeners(): () => void {
  // Foreground message — show in-app banner (currently just logs; extend with a toast/banner library)
  const unsubForeground = messaging().onMessage(async remoteMessage => {
    console.log('[FCM] Foreground message:', remoteMessage.notification?.title);
    // TODO: show in-app banner with remoteMessage.notification?.title / body
  });

  // Background / quit state — user taps the notification
  messaging().onNotificationOpenedApp(remoteMessage => {
    handleNotificationNavigation(remoteMessage);
  });

  // App opened from quit state by tapping notification
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) handleNotificationNavigation(remoteMessage);
    });

  return unsubForeground;
}
