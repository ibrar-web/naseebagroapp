import messaging from '@react-native-firebase/messaging';

export const requestNotificationPermission = async () => {
  const status = await messaging().requestPermission();
  return status;
};
