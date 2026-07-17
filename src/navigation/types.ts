import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NavigatorScreenParams } from '@react-navigation/native';

export type AppModeParam = 'buyer' | 'seller';
export type PostsTabRouteParam =
  | 'posts'
  | 'offers'
  | 'My Demands'
  | 'My Supplies'
  | 'My Offers';

export type CategoryRouteParam = {
  id: string;
  name: string;
  image_url?: string | null;
  commodity_count?: number;
};

export type PostPrefillData = {
  commodity_id?: string | null;
  quantity?: string | null;
  price_per_unit?: string | null;
  delivery_option?: string | null;
  city_id?: string | null;
  city_name?: string | null;
  delivery_term_id?: string | null;
  payment_type?: string | null;
  payment_term_id?: string | null;
  grades?: string[];
  is_mill_based?: boolean;
  mills?: Array<{ id?: string | null; name?: string | null; city?: string | null; price?: string }>;
};

export type TabParamList = {
  Home: undefined;
  Market: undefined;
  Deals: undefined;
  Post: { initialTab?: PostsTabRouteParam } | undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  // Auth
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Phone: undefined;
  OTP: { phone: string; channel?: 'sms' | 'whatsapp' };

  // Main tabs
  MainTabs: NavigatorScreenParams<TabParamList> | undefined;

  // Marketplace detail
  CreatePost: undefined;
  PrePost: undefined;
  CreatePostSeller: { category: string; categoryData?: CategoryRouteParam; prefillData?: PostPrefillData; postId?: string };
  CreateBuyerDemand: { category: string; categoryData?: CategoryRouteParam; prefillData?: PostPrefillData; postId?: string };
  CommodityDetail: { listingId: string; listingType?: 'SUPPLY' | 'DEMAND' };
  RequestToPurchase: { listingId: string };
  SendOffer: { listingId: string };
  OfferSent: {
    mode: 'buyer' | 'seller';
    listingId: string;
    title?: string;
    code?: string;
    image?: string;
    primaryLabel?: string;
    subtitle?: string;
    summary?: Array<{ label: string; value: string }>;
  };
  PostCreated: { mode: 'buyer' | 'seller'; postData: any; categoryName?: string; totalCount?: number };
  PostDetail: { postId: string; mode?: AppModeParam; post_type?: 'supply' | 'demand' };
  OfferDetail: { offerId: string; mode?: AppModeParam };
  Negotiation: { offerId: string; mode?: AppModeParam };
  DealDetail: { dealId: string };
  Notifications: undefined;

  // Onboarding
  Location: undefined;
  BasicInfo: undefined;
  BizInfo: undefined;
  IdVerify: undefined;
  PaymentSetup: undefined;
  VerifyPending: undefined;
  VerifyApproved: undefined;

  // Market rates
  MarketRates: undefined;

  // Profile sub-screens
  PersonalInfo: undefined;
  BusinessProfile: undefined;
  PaymentMethods: undefined;
  PaymentHistory: undefined;
  VerificationStatus: undefined;
  KycDetails: undefined;
  BusinessDocs: undefined;
  SavedListings: undefined;
  NotificationsSettings: undefined;
  AppSettings: undefined;
  Support: undefined;
  Terms: undefined;

  // Disputes & Queries
  DisputesQueries: undefined;
  DisputeDetail: { disputeId: string };
  QueryChat: { queryId?: string } | undefined;

  // Deal rating & ticket
  MyRatings: undefined;
  RateDeal: {
    dealId: string;
    dealCode?: string | null;
    commodityName?: string | null;
    dealSummary?: string | null;
    raterRole?: 'buyer' | 'seller';
    existingRating?: { score: number; note?: string | null; created_at?: string } | null;
    onRatingSubmitted?: (score: number, note?: string) => void;
  };
  SubmitTicket: {
    dealId?: string;
    mode?: 'buyer' | 'seller';
    dealCode?: string | null;
    commodityName?: string | null;
    dealSummary?: string | null;
    imageUrl?: string | null;
  };
  ChangePassword: undefined;
  ForgotPassword: undefined;
};

export type RootStackNavProp = NativeStackNavigationProp<RootStackParamList>;
export type TabNavProp = BottomTabNavigationProp<TabParamList>;

export type SplashScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Splash'
>;
export type WelcomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Welcome'
>;
export type PhoneScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Phone'
>;
export type OTPScreenProps = NativeStackScreenProps<RootStackParamList, 'OTP'>;
