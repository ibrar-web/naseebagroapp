import React, { useEffect, useRef } from 'react';
import { Provider, useSelector } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import store from './store';
import AppNavigator from './navigation/AppNavigator';
import './utils/sockets'; // initializes socket auto-connect via store subscription
import { useHydrateLanguage } from './localization';
import {
  initNotifications,
  removeDeviceToken,
  setupNotificationListeners,
} from './services/notifications/notificationService';
import { RootState } from './store/rootReducer';

const AppContent = () => {
  useHydrateLanguage();

  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const prevAuth = useRef(false);

  useEffect(() => {
    // Set up notification listeners once (handles background/quit taps and foreground)
    const unsub = setupNotificationListeners();
    return () => { unsub(); };
  }, []);

  useEffect(() => {
    if (isAuthenticated && !prevAuth.current) {
      initNotifications().catch(() => {});
    }
    if (!isAuthenticated && prevAuth.current) {
      removeDeviceToken().catch(() => {});
    }
    prevAuth.current = isAuthenticated;
  }, [isAuthenticated]);

  return <AppNavigator />;
};

const App = () => (
  <GestureHandlerRootView className="flex-1">
    <SafeAreaProvider>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

export default App;
