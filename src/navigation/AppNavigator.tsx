import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RootStackParamList, TabParamList } from './types';

// Auth
import SplashScreen from '../app/auth/screens/SplashScreen';
import WelcomeScreen from '../app/auth/screens/WelcomeScreen';
import PhoneScreen from '../app/auth/screens/PhoneScreen';
import OTPScreen from '../app/auth/screens/OTPScreen';

// Main tabs
import HomeScreen from '../app/buyer/screens/HomeScreen';
import MarketplaceScreen from '../app/marketplace/screens/MarketplaceScreen';
import DealsScreen from '../app/deals/screens/DealsScreen';
import PostScreen from '../app/marketplace/screens/PostScreen';
import ProfileScreen from '../app/profile/screens/ProfileScreen';

// Detail screens (tab bar hidden)
import ListingDetailScreen from '../app/marketplace/screens/ListingDetailScreen';
import DealDetailScreen from '../app/deals/screens/DealDetailScreen';

// Profile sub-screens (tab bar hidden)
import PersonalInfoScreen from '../app/profile/screens/PersonalInfoScreen';
import BusinessProfileScreen from '../app/profile/screens/BusinessProfileScreen';
import PaymentMethodsScreen from '../app/profile/screens/PaymentMethodsScreen';
import VerificationStatusScreen from '../app/profile/screens/VerificationStatusScreen';
import SavedListingsScreen from '../app/profile/screens/SavedListingsScreen';
import NotificationsSettingsScreen from '../app/profile/screens/NotificationsSettingsScreen';
import AppSettingsScreen from '../app/profile/screens/AppSettingsScreen';
import SupportScreen from '../app/profile/screens/SupportScreen';
import TermsScreen from '../app/profile/screens/TermsScreen';
import { useTranslation } from '../localization';
import type { TranslationKey } from '../localization';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const STATUS_BAR_BACKGROUND = 'rgb(20, 82, 40)';

const TAB_CONFIG: Record<string, { icon: string; labelKey: TranslationKey }> = {
  Home: { icon: '🏠', labelKey: 'tabs.home' },
  Market: { icon: '🌾', labelKey: 'tabs.market' },
  Deals: { icon: '📦', labelKey: 'tabs.deals' },
  Post: { icon: '✏️', labelKey: 'tabs.post' },
  Profile: { icon: '👤', labelKey: 'tabs.profile' },
};

const CustomTabBar = ({ state, navigation }: any) => {
  const { t } = useTranslation();

  return (
    <View
      className="flex-row bg-white items-center"
      style={{
        height: 66,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingBottom: 16,
        paddingTop: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 16,
      }}
    >
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const cfg = TAB_CONFIG[route.name];
        const label = cfg ? t(cfg.labelKey) : route.name;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => {
              if (!isFocused) {
                navigation.navigate(route.name);
              }
            }}
            className="flex-1 items-center"
            style={{ gap: 2, paddingTop: 4 }}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <View
              className={`w-10 items-center justify-center rounded-xl ${
                isFocused ? 'bg-green-100' : ''
              }`}
              style={{ height: 26 }}
            >
              <Text
                style={{
                  fontSize: 18,
                  color: isFocused ? '#1A6B34' : '#9CA3AF',
                }}
              >
                {cfg?.icon ?? '●'}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 10,
                fontWeight: isFocused ? '700' : '500',
                color: isFocused ? '#1A6B34' : '#9CA3AF',
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const AppStatusBar = () => {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={STATUS_BAR_BACKGROUND}
        translucent={false}
      />
      <View
        pointerEvents="none"
        style={[styles.statusBarSurface, { paddingTop: insets.top }]}
      />
    </>
  );
};

const MainTabs = () => (
  <>
    <AppStatusBar />
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Market" component={MarketplaceScreen} />
      <Tab.Screen name="Deals" component={DealsScreen} />
      <Tab.Screen name="Post" component={PostScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  </>
);

export const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      {/* Auth */}
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ animation: 'none' }}
      />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Phone" component={PhoneScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />

      {/* Main tabs */}
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ animation: 'fade' }}
      />

      {/* Listing & deal detail */}
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} />
      <Stack.Screen name="DealDetail" component={DealDetailScreen} />

      {/* Profile sub-screens */}
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <Stack.Screen name="BusinessProfile" component={BusinessProfileScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen
        name="VerificationStatus"
        component={VerificationStatusScreen}
      />
      <Stack.Screen name="SavedListings" component={SavedListingsScreen} />
      <Stack.Screen
        name="NotificationsSettings"
        component={NotificationsSettingsScreen}
      />
      <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;

const styles = StyleSheet.create({
  statusBarSurface: {
    backgroundColor: STATUS_BAR_BACKGROUND,
    paddingHorizontal: 24,
    paddingBottom: 6,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
