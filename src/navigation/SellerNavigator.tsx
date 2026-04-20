import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SellerTabs } from './RootTabs';
import MarketplaceDetailScreen from '../marketplace/screens/MarketplaceDetailScreen';
import DealTrackingScreen from '../marketplace/screens/DealTrackingScreen';

const Stack = createNativeStackNavigator();

export const SellerNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="SellerTabs" component={SellerTabs} options={{ headerShown: false }} />
    <Stack.Screen name="MarketplaceDetail" component={MarketplaceDetailScreen} />
    <Stack.Screen name="DealTracking" component={DealTrackingScreen} />
  </Stack.Navigator>
);
