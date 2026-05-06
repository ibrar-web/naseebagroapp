import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Colors as C } from '../constants/theme';
import { RootStackParamList, TabParamList } from './types';

// Auth
import SplashScreen    from '../app/auth/screens/SplashScreen';
import WelcomeScreen   from '../app/auth/screens/WelcomeScreen';
import PhoneScreen     from '../app/auth/screens/PhoneScreen';
import OTPScreen       from '../app/auth/screens/OTPScreen';

// Main tabs
import HomeScreen        from '../app/buyer/screens/HomeScreen';
import MarketplaceScreen from '../app/marketplace/screens/MarketplaceScreen';
import DealsScreen       from '../app/deals/screens/DealsScreen';
import PostScreen        from '../app/marketplace/screens/PostScreen';
import ProfileScreen     from '../app/profile/screens/ProfileScreen';

// Detail screens (no tab bar)
import ListingDetailScreen from '../app/marketplace/screens/ListingDetailScreen';
import DealDetailScreen    from '../app/deals/screens/DealDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab   = createBottomTabNavigator<TabParamList>();

const TAB_CONFIG: Record<string, { icon: string; label: string }> = {
  Home:    { icon: '🏠', label: 'Home'    },
  Market:  { icon: '🌾', label: 'Market'  },
  Deals:   { icon: '📦', label: 'Deals'   },
  Post:    { icon: '✏️', label: 'Post'    },
  Profile: { icon: '👤', label: 'Profile' },
};

const CustomTabBar = ({ state, navigation }: any) => (
  <View style={styles.tabBar}>
    {state.routes.map((route: any, index: number) => {
      const isFocused = state.index === index;
      const cfg = TAB_CONFIG[route.name] ?? { icon: '●', label: route.name };

      return (
        <TouchableOpacity
          key={route.key}
          onPress={() => { if (!isFocused) { navigation.navigate(route.name); } }}
          style={styles.tabItem}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <View style={[styles.tabIconWrap, isFocused && styles.tabIconWrapActive]}>
            <Text style={[styles.tabIcon, isFocused && styles.tabIconActive]}>{cfg.icon}</Text>
          </View>
          <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{cfg.label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const MainTabs = () => (
  <Tab.Navigator
    tabBar={props => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="Home"    component={HomeScreen}        />
    <Tab.Screen name="Market"  component={MarketplaceScreen} />
    <Tab.Screen name="Deals"   component={DealsScreen}       />
    <Tab.Screen name="Post"    component={PostScreen}        />
    <Tab.Screen name="Profile" component={ProfileScreen}     />
  </Tab.Navigator>
);

export const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      {/* Auth */}
      <Stack.Screen name="Splash"   component={SplashScreen}  options={{ animation: 'none' }} />
      <Stack.Screen name="Welcome"  component={WelcomeScreen} />
      <Stack.Screen name="Phone"    component={PhoneScreen}   />
      <Stack.Screen name="OTP"      component={OTPScreen}     />

      {/* Main app — tab bar visible */}
      <Stack.Screen name="MainTabs" component={MainTabs}      options={{ animation: 'fade' }} />

      {/* Detail screens — tab bar hidden (stack level) */}
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} />
      <Stack.Screen name="DealDetail"    component={DealDetailScreen}    />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.gray100,
    paddingBottom: 16,
    paddingTop: 4,
    height: 66,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingTop: 4,
  },
  tabIconWrap: {
    width: 38,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tabIconWrapActive: { backgroundColor: C.green100 },
  tabIcon:           { fontSize: 18, color: C.gray400 },
  tabIconActive:     { color: C.green700 },
  tabLabel:          { fontSize: 10, fontWeight: '500', color: C.gray400 },
  tabLabelActive:    { fontSize: 10, fontWeight: '700', color: C.green700 },
});
