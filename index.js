/**
 * @format
 */

import 'react-native-gesture-handler';
import './src/global.css';
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// Must be called outside of any React component — handles background/quit messages
messaging().setBackgroundMessageHandler(async remoteMessage => {
  // Background messages are handled silently; notification tap is caught in
  // setupNotificationListeners → onNotificationOpenedApp / getInitialNotification
  console.log('[FCM] Background message received:', remoteMessage.notification?.title);
});

AppRegistry.registerComponent(appName, () => App);
