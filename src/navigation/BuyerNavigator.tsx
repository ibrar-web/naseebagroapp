import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BuyerTabs } from './RootTabs';
import MarketplaceDetailScreen from '../marketplace/screens/MarketplaceDetailScreen';
import DealTrackingScreen from '../marketplace/screens/DealTrackingScreen';

const Stack = createNativeStackNavigator();

export const BuyerNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="BuyerTabs" component={BuyerTabs} options={{ headerShown: false }} />
    <Stack.Screen name="MarketplaceDetail" component={MarketplaceDetailScreen} />
    <Stack.Screen name="DealTracking" component={DealTrackingScreen} />
  </Stack.Navigator>
);
