import messaging from '@react-native-firebase/messaging';

export const getDevicePushToken = async () => messaging().getToken();

export const onPushTokenRefresh = (handler: (token: string) => void) =>
  messaging().onTokenRefresh(handler);
