import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../utils/api';
import { navigationRef } from '../../navigation/AppNavigator';
import { showAppToast } from '../../app/components/toastConfig';

const TOKEN_KEY = 'fcm_token';
const TOKEN_TS_KEY = 'fcm_token_ts';
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

// Firebase messaging is Android-only until iOS setup is added
const getMessaging = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('@react-native-firebase/messaging').default();
};

async function requestPermission(): Promise<boolean> {
  if (Platform.OS === 'ios') return false; // Firebase not configured for iOS yet
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }
  const messagingModule = require('@react-native-firebase/messaging').default;
  const instance = messagingModule();
  const status = await instance.requestPermission();
  return (
    status === messagingModule.AuthorizationStatus.AUTHORIZED ||
    status === messagingModule.AuthorizationStatus.PROVISIONAL
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

  const token = await getMessaging().getToken();
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
  if (Platform.OS === 'ios') return; // Firebase not configured for iOS yet

  const granted = await requestPermission();
  if (!granted) return;

  await syncToken();

  // Refresh token when Firebase rotates it
  getMessaging().onTokenRefresh(async (token: string) => {
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

// Stored when app opens from killed state — consumed after auth is restored
let _pendingColdStart: Record<string, string> | null = null;

export function consumePendingNotification(): void {
  if (_pendingColdStart) {
    const data = _pendingColdStart;
    _pendingColdStart = null;
    handleNotificationNavigation(data);
  }
}

function handleNotificationNavigation(data: Record<string, string>): void {
  if (!navigationRef.isReady()) return;

  console.log('[FCM Nav] Navigating from notification, data:', JSON.stringify(data));

  const module = data.module as string | undefined;
  const type = data.type as string | undefined;
  const entityId = data.entity_id as string | undefined;

  console.log('[FCM Nav] module:', module, '| type:', type, '| entityId:', entityId, '| post_type:', data.post_type);

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

    case 'listing':
      if (entityId) {
        if (type === 'approved' || type === 'rejected' || type === 'needs_revision') {
          const postType = (data.post_type as 'supply' | 'demand') ?? 'supply';
          navigationRef.navigate('PostDetail', { postId: entityId, post_type: postType });
        } else {
          navigationRef.navigate('CommodityDetail', { listingId: entityId });
        }
      }
      break;

    case 'profile':
      navigationRef.navigate('MainTabs', { screen: 'Profile' });
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
  if (Platform.OS === 'ios') return () => {}; // Firebase not configured for iOS yet

  const fcm = getMessaging();

  // Foreground message — show themed in-app toast
  const unsubForeground = fcm.onMessage(async (remoteMessage: any) => {
    const data: Record<string, string> = remoteMessage.data ?? {};
    const title = remoteMessage.notification?.title ?? data.title ?? 'Notification';
    const body = remoteMessage.notification?.body ?? data.body;
    console.log('[FCM] Foreground message:', title, data);

    const module = data.module;
    const type = data.type;
    const entityId = data.entity_id;
    const postType = data.post_type as 'supply' | 'demand' | undefined;

    const status = data.status;
    const isProfileModule = module === 'profile';
    const resolvedStatus = isProfileModule ? status : type;

    const accentColor =
      resolvedStatus === 'approved' ? '#4ADE80'
      : resolvedStatus === 'rejected' ? '#F87171'
      : type === 'needs_revision' ? '#FBBF24'
      : module === 'deal' || module === 'truck' ? '#60A5FA'
      : '#4ADE80';

    const icon =
      resolvedStatus === 'approved' ? 'approved'
      : resolvedStatus === 'rejected' || type === 'needs_revision' ? 'notificationWarning'
      : 'currency';

    showAppToast({
      title,
      body,
      accentColor,
      icon,
      postId: (module === 'listing' && entityId) ? entityId : undefined,
      post_type: postType,
      dealId: (module === 'deal' || module === 'truck') && entityId ? entityId : undefined,
      offerId: module === 'negotiation' && entityId ? entityId : undefined,
    });
  });

  // Background tap — clear any cold-start pending to prevent double navigation
  fcm.onNotificationOpenedApp((remoteMessage: any) => {
    _pendingColdStart = null;
    console.log('[FCM] Background tap notification:', JSON.stringify(remoteMessage.data));
    handleNotificationNavigation(remoteMessage.data ?? {});
  });

  // App opened from quit state — store for deferred nav (auth may not be ready yet)
  fcm.getInitialNotification().then((remoteMessage: any) => {
    if (remoteMessage) {
      console.log('[FCM] Cold-start notification:', JSON.stringify(remoteMessage.data));
      _pendingColdStart = remoteMessage.data ?? {};
    }
  });

  return unsubForeground;
}
