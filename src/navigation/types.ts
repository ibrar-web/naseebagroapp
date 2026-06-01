import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  // Auth
  Splash:   undefined;
  Welcome:  undefined;
  Login:    undefined;
  Phone:    undefined;
  OTP:      { phone: string };

  // Main tabs
  MainTabs: undefined;

  // Marketplace detail
  CreatePost:    undefined;
  ListingDetail: { listingId: string };
  DealDetail:    { dealId: string };
  Notifications: undefined;

  // Onboarding
  Location:      undefined;
  BasicInfo:     undefined;
  BizInfo:       undefined;
  IdVerify:      undefined;
  PaymentSetup:  undefined;
  VerifyPending: undefined;
  VerifyApproved: undefined;

  // Market rates
  MarketRates:           undefined;

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
