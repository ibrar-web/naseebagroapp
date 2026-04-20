import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator } from 'react-native';
import { AuthNavigator } from './AuthNavigator';
import { GuestNavigator } from './GuestNavigator';
import { BuyerNavigator } from './BuyerNavigator';
import { SellerNavigator } from './SellerNavigator';
import { useAppSelector } from '../store/hooks';
import { useSessionRestore } from '../auth/hooks/useSessionRestore';
import { linking } from './linking';
import { navigationRef } from './navigationRef';

export const AppNavigator = () => {
  useSessionRestore();
  const { isAuthenticated, role, isSessionHydrated } = useAppSelector((state) => state.auth);

  if (!isSessionHydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking} ref={navigationRef}>
      {!isAuthenticated && <GuestNavigator />}
      {isAuthenticated && role === 'buyer' && <BuyerNavigator />}
      {isAuthenticated && role === 'seller' && <SellerNavigator />}
      {isAuthenticated && !role && <AuthNavigator />}
    </NavigationContainer>
  );
};
