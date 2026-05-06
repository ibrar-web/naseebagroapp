import React from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import store from './store';
import AppNavigator from './navigation/AppNavigator';
import { useHydrateLanguage } from './localization';

const AppContent = () => {
  useHydrateLanguage();

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
