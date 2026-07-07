/**
 * @format
 */

import 'react-native-gesture-handler';
import './src/global.css';
import { AppRegistry, Platform } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Firebase messaging is Android-only until iOS setup is added
if (Platform.OS !== 'ios') {
  const messaging = require('@react-native-firebase/messaging').default;
  // Must be called outside of any React component — handles background/quit messages
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('[FCM] Background message received:', remoteMessage.notification?.title);
  });
}

AppRegistry.registerComponent(appName, () => App);
