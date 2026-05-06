import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Phone: undefined;
  OTP: { phone: string };
  MainTabs: undefined;
  ListingDetail: { listingId: string };
  DealDetail: { dealId: string };
  MarketRates: undefined;
  CategoryPage: { category?: string };
  CreateListing: undefined;
  RequestList: undefined;
  MyListings: undefined;
  PersonalInfo: undefined;
  BusinessProfile: undefined;
  Settings: undefined;
  Support: undefined;
  Terms: undefined;
  Notifications: undefined;
};

export type TabParamList = {
  Home: undefined;
  Market: undefined;
  Deals: undefined;
  Post: undefined;
  Profile: undefined;
};

export type RootStackNavProp = NativeStackNavigationProp<RootStackParamList>;
export type TabNavProp = BottomTabNavigationProp<TabParamList>;

export type SplashScreenProps   = NativeStackScreenProps<RootStackParamList, 'Splash'>;
export type WelcomeScreenProps  = NativeStackScreenProps<RootStackParamList, 'Welcome'>;
export type PhoneScreenProps    = NativeStackScreenProps<RootStackParamList, 'Phone'>;
export type OTPScreenProps      = NativeStackScreenProps<RootStackParamList, 'OTP'>;
