import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MarketplaceListScreen from '../marketplace/screens/MarketplaceListScreen';
import MarketplaceDetailScreen from '../marketplace/screens/MarketplaceDetailScreen';
import LoginScreen from '../auth/screens/LoginScreen';

const Stack = createNativeStackNavigator();

export const GuestNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Marketplace" component={MarketplaceListScreen} />
    <Stack.Screen name="MarketplaceDetail" component={MarketplaceDetailScreen} />
    <Stack.Screen name="LoginPrompt" component={LoginScreen} />
  </Stack.Navigator>
);
