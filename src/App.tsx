import React from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

import store from './store';
import AppNavigator from './navigation/AppNavigator';

const App = () => (
  <GestureHandlerRootView style={styles.root}>
    <SafeAreaProvider>
      <Provider store={store}>
        <AppNavigator />
      </Provider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

export default App;

const styles = StyleSheet.create({
  root: { flex: 1 },
});
