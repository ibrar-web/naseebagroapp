import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import {
  createNavigationContainerRef,
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { RootStackParamList, TabParamList } from './types';

// Auth
import SplashScreen from '../app/auth/screens/SplashScreen';
import WelcomeScreen from '../app/auth/screens/WelcomeScreen';
import LoginScreen from '../app/auth/screens/LoginScreen';
import PhoneScreen from '../app/auth/screens/PhoneScreen';
import OTPScreen from '../app/auth/screens/OTPScreen';

// Main tabs
import HomeScreen from '../app/home/screens/HomeScreen';
import MarketplaceScreen from '../app/marketplace/screens/MarketplaceScreen';
import DealsScreen from '../app/deals/screens/DealsScreen';
import MyPostsScreen from '../app/posts/screens/MyPostsScreen';
import ProfileScreen from '../app/profile/screens/ProfileScreen';

// Onboarding
import LocationScreen from '../app/auth/screens/LocationScreen';
import BasicInfoScreen from '../app/auth/screens/BasicInfoScreen';
import BizInfoScreen from '../app/auth/screens/BizInfoScreen';
import IdVerifyScreen from '../app/auth/screens/IdVerifyScreen';
import PaymentSetupScreen from '../app/auth/screens/PaymentSetupScreen';
import VerifyPendingScreen from '../app/auth/screens/VerifyPendingScreen';
import VerifyApprovedScreen from '../app/auth/screens/VerifyApprovedScreen';

// Market rates
import MarketRatesScreen from '../app/marketplace/screens/MarketRatesScreen';

// Detail screens (tab bar hidden)
import CommodityDetailScreen from '../app/marketplace/screens/CommodityDetailScreen';
import RequestToPurchaseScreen from '../app/marketplace/screens/RequestToPurchaseScreen';
import SendOfferScreen from '../app/marketplace/screens/SendOfferScreen';
import OfferSentScreen from '../app/marketplace/screens/OfferSentScreen';
import PostDetailScreen from '../app/posts/screens/PostDetailScreen';
import OfferDetailScreen from '../app/posts/screens/OfferDetailScreen';
import NegotiationScreen from '../app/posts/screens/NegotiationScreen';
import PrePostScreen from '../app/posts/screens/PrePostScreen';
import CreatePostSellerScreen from '../app/posts/screens/CreatePostSellerScreen';
import CreateBuyerDemandScreen from '../app/posts/screens/CreateBuyerDemandScreen';
import PostCreatedScreen from '../app/posts/screens/PostCreatedScreen';
import DealDetailScreen from '../app/deals/screens/DealDetailScreen';
import NotificationsScreen from '../app/notifications/screens/NotificationsScreen';

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
import { AppIcon } from '../assets/icons';
import type { AppIconName } from '../assets/icons';
import LoginRequiredSheet from '../app/auth/components/LoginRequiredSheet';
import { subscribeAuthRequiredSheet } from '../app/auth/utils/authRequiredSheet';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
const STATUS_BAR_BACKGROUND = 'rgb(20, 82, 40)';

const TAB_CONFIG: Record<
  string,
  { icon: AppIconName; labelKey: TranslationKey }
> = {
  Home: { icon: 'tabHome', labelKey: 'tabs.home' },
  Market: { icon: 'tabMarket', labelKey: 'tabs.market' },
  Deals: { icon: 'tabDeals', labelKey: 'tabs.deals' },
  Post: { icon: 'tabPost', labelKey: 'tabs.post' },
  Profile: { icon: 'tabProfile', labelKey: 'tabs.profile' },
};

const CustomTabBar = ({ state, navigation }: any) => {
  const { t } = useTranslation();

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        height: 64,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        alignItems: 'center',
        paddingBottom: 8,
        paddingTop: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 16,
      }}
    >
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const cfg = TAB_CONFIG[route.name];
        const label = cfg ? t(cfg.labelKey) : route.name;
        const iconColor = isFocused ? '#1A6B34' : '#9CA3AF';

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => {
              if (!isFocused) {
                navigation.navigate(route.name);
              }
            }}
            style={{ flex: 1, alignItems: 'center', gap: 3 }}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <View
              style={{
                width: 40,
                height: 26,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 10,
                backgroundColor: isFocused ? '#E8F7EE' : 'transparent',
              }}
            >
              {cfg ? (
                <AppIcon name={cfg.icon} size={20} color={iconColor} />
              ) : (
                <Text style={{ fontSize: 18, color: iconColor }}>●</Text>
              )}
            </View>
            <Text
              style={{
                fontSize: 10,
                fontWeight: isFocused ? '700' : '500',
                color: iconColor,
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

const AppStatusBar = () => (
  <StatusBar
    barStyle="light-content"
    backgroundColor={STATUS_BAR_BACKGROUND}
    translucent={false}
  />
);

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
      <Tab.Screen name="Post" component={MyPostsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  </>
);

export const AppNavigator = () => {
  const [loginSheetVisible, setLoginSheetVisible] = useState(false);

  useEffect(
    () => subscribeAuthRequiredSheet(() => setLoginSheetVisible(true)),
    [],
  );

  const closeLoginSheet = () => setLoginSheetVisible(false);

  const openLogin = () => {
    closeLoginSheet();
    if (navigationRef.isReady()) {
      navigationRef.navigate('Login');
    }
  };

  return (
    <>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
        >
          {/* Main tabs */}
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ animation: 'fade' }}
          />

          {/* Market rates */}
          <Stack.Screen name="MarketRates" component={MarketRatesScreen} />

          {/* Listing & deal detail */}
          <Stack.Screen name="PrePost" component={PrePostScreen} />
          <Stack.Screen
            name="CreatePostSeller"
            component={CreatePostSellerScreen}
          />
          <Stack.Screen
            name="CreateBuyerDemand"
            component={CreateBuyerDemandScreen}
          />
          <Stack.Screen name="PostCreated" component={PostCreatedScreen} />
          <Stack.Screen
            name="CommodityDetail"
            component={CommodityDetailScreen}
          />
          <Stack.Screen
            name="RequestToPurchase"
            component={RequestToPurchaseScreen}
          />
          <Stack.Screen name="SendOffer" component={SendOfferScreen} />
          <Stack.Screen name="OfferSent" component={OfferSentScreen} />
          <Stack.Screen name="PostDetail" component={PostDetailScreen} />
          <Stack.Screen name="OfferDetail" component={OfferDetailScreen} />
          <Stack.Screen name="Negotiation" component={NegotiationScreen} />
          <Stack.Screen name="DealDetail" component={DealDetailScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />

          {/* Profile sub-screens */}
          <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
          <Stack.Screen
            name="BusinessProfile"
            component={BusinessProfileScreen}
          />
          <Stack.Screen
            name="PaymentMethods"
            component={PaymentMethodsScreen}
          />
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

          {/* Auth */}
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ animation: 'none' }}
          />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Phone" component={PhoneScreen} />
          <Stack.Screen name="OTP" component={OTPScreen} />

          {/* Onboarding */}
          <Stack.Screen name="Location" component={LocationScreen} />
          <Stack.Screen name="BasicInfo" component={BasicInfoScreen} />
          <Stack.Screen name="BizInfo" component={BizInfoScreen} />
          <Stack.Screen name="IdVerify" component={IdVerifyScreen} />
          <Stack.Screen name="PaymentSetup" component={PaymentSetupScreen} />
          <Stack.Screen name="VerifyPending" component={VerifyPendingScreen} />
          <Stack.Screen
            name="VerifyApproved"
            component={VerifyApprovedScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>

      <LoginRequiredSheet
        visible={loginSheetVisible}
        onClose={closeLoginSheet}
        onLogin={openLogin}
      />
    </>
  );
};

export default AppNavigator;
