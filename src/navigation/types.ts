import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  // Auth
  Splash:   undefined;
  Welcome:  undefined;
  Phone:    undefined;
  OTP:      { phone: string };

  // Main tabs
  MainTabs: undefined;

  // Marketplace detail
  ListingDetail: { listingId: string };
  DealDetail:    { dealId: string };

  // Profile sub-screens
  PersonalInfo:          undefined;
  BusinessProfile:       undefined;
  PaymentMethods:        undefined;
  VerificationStatus:    undefined;
  SavedListings:         undefined;
  NotificationsSettings: undefined;
  AppSettings:           undefined;
  Support:               undefined;
  Terms:                 undefined;
};

export type TabParamList = {
  Home:    undefined;
  Market:  undefined;
  Deals:   undefined;
  Post:    undefined;
  Profile: undefined;
};

export type RootStackNavProp = NativeStackNavigationProp<RootStackParamList>;
export type TabNavProp = BottomTabNavigationProp<TabParamList>;

export type SplashScreenProps  = NativeStackScreenProps<RootStackParamList, 'Splash'>;
export type WelcomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Welcome'>;
export type PhoneScreenProps   = NativeStackScreenProps<RootStackParamList, 'Phone'>;
export type OTPScreenProps     = NativeStackScreenProps<RootStackParamList, 'OTP'>;
