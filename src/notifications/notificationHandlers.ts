import messaging from '@react-native-firebase/messaging';

export const registerForegroundNotificationHandler = (handler: (message: unknown) => void) =>
  messaging().onMessage(async (message) => {
    handler(message);
  });

export const registerBackgroundNotificationHandler = () => {
  messaging().setBackgroundMessageHandler(async () => {
    // Background message side effects go here.
  });
};
