import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MarketplaceListScreen from '../marketplace/screens/MarketplaceListScreen';
import ProfileScreen from '../common/screens/ProfileScreen';
import BuyerHomeScreen from '../buyer/screens/BuyerHomeScreen';
import SellerHomeScreen from '../seller/screens/SellerHomeScreen';
import BuyerDealsScreen from '../buyer/screens/BuyerDealsScreen';
import SellerListingsScreen from '../seller/screens/SellerListingsScreen';

const Tab = createBottomTabNavigator();

export const BuyerTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Home" component={BuyerHomeScreen} />
    <Tab.Screen name="Marketplace" component={MarketplaceListScreen} />
    <Tab.Screen name="Deals" component={BuyerDealsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export const SellerTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Home" component={SellerHomeScreen} />
    <Tab.Screen name="Marketplace" component={MarketplaceListScreen} />
    <Tab.Screen name="Listings" component={SellerListingsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);
