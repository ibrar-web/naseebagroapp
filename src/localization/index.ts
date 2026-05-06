import { useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from '../store';
import { setLanguage as setAppLanguage } from '../store/slices/appSlice';

export type LanguageCode = 'en' | 'ur';
export type TextDirection = 'ltr' | 'rtl';

export type SupportedLanguage = {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  direction: TextDirection;
};

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', direction: 'ltr' },
  { code: 'ur', label: 'Urdu', nativeLabel: 'اردو', direction: 'rtl' },
];

export const localizationConfig = {
  defaultLanguage: DEFAULT_LANGUAGE,
  fallbackLanguage: DEFAULT_LANGUAGE,
  storageKey: 'naseebagro.language',
  supportedLanguages: SUPPORTED_LANGUAGES,
} as const;

export const getLanguageByCode = (code: LanguageCode) =>
  SUPPORTED_LANGUAGES.find(language => language.code === code) ??
  SUPPORTED_LANGUAGES[0];

export const isSupportedLanguage = (code: string): code is LanguageCode =>
  SUPPORTED_LANGUAGES.some(language => language.code === code);

const en = {
  'tabs.home': 'Home',
  'tabs.market': 'Market',
  'tabs.deals': 'Deals',
  'tabs.post': 'Post',
  'tabs.profile': 'Profile',

  'auth.splashTagline': "Pakistan's Trusted Commodity Marketplace",
  'auth.welcomeTagline':
    "Connect buyers and sellers across\nPakistan's agricultural commodity markets",
  'auth.verified': 'Verified',
  'auth.liveRates': 'Live Rates',
  'auth.secureDeals': 'Secure Deals',
  'auth.createAccount': 'Create Account',
  'auth.login': 'Log In',
  'auth.browseGuest': 'Browse as Guest',
  'auth.agreementStart': 'By continuing you agree to our',
  'auth.terms': 'Terms of Service',
  'auth.privacy': 'Privacy Policy',
  'auth.phoneStep': 'STEP 1 OF 2',
  'auth.otpStep': 'STEP 2 OF 2',
  'auth.phoneTitle': 'Enter Your\nPhone Number',
  'auth.phoneSubtitle': "We'll send you a verification code",
  'auth.mobileNumber': 'Mobile Number',
  'auth.phoneHelp': 'Enter your 10-11 digit mobile number',
  'auth.sendOtp': 'Send OTP →',
  'auth.otpTitle': 'Verify Your\nNumber',
  'auth.codeSentTo': 'Code sent to',
  'auth.enterCode': 'Enter 6-Digit Code',
  'auth.didntReceive': "Didn't receive? ",
  'auth.resendCode': 'Resend Code',
  'auth.verifyContinue': 'Verify & Continue →',

  'home.buyer': 'Buyer',
  'home.seller': 'Seller',
  'home.location': 'Lahore, Punjab',
  'home.activeDeals': 'Active Deals',
  'home.demands': 'Demands',
  'home.totalSpent': 'Total Spent',
  'home.supplies': 'Supplies',
  'home.orders': 'Orders',
  'home.earnings': 'Earnings',
  'home.marketRates': 'Market Rates',
  'home.seeAll': 'See All',
  'home.featuredSupplies': 'Featured Supplies',
  'home.viewAll': 'View All',
  'home.browseCategories': 'Browse Categories',
  'home.all': 'All',
  'home.totalEarningsMonth': 'Total Earnings (This Month)',
  'home.released': 'Released',
  'home.pending': 'Pending',
  'home.thisWeek': 'This Week',
  'home.quickActions': 'Quick Actions',
  'home.createSupply': 'Create Supply',
  'home.createSupplySub': 'List your stock',
  'home.myListings': 'My Listings',
  'home.myListingsSub': 'Manage stock',
  'home.viewOrders': 'View Orders',
  'home.viewOrdersSub': 'Track deals',
  'home.payouts': 'Payouts',
  'home.payoutsSub': 'Earnings',
  'seller.dashboard': 'Seller Dashboard',
  'seller.dashboardSub': 'Manage your listings and orders',
  'seller.activeListings': 'Active Listings',
  'seller.pendingOrders': 'Pending Orders',
  'seller.earnings': 'Earnings',
  'seller.createListing': '+ Create New Listing',

  'market.buyCommodities': 'Buy Commodities',
  'market.buyerDemands': 'Buyer Demands',
  'market.listingsAvailable': '{{count}} listings available',
  'market.activeRequests': '{{count}} active requests',
  'market.filter': 'Filter',
  'market.searchCommodities': 'Search commodities, locations...',
  'market.searchRequests': 'Search buyer requests...',
  'market.by': 'by',
  'market.interest': 'Interest',
  'market.active': 'Active',
  'market.pending': 'Pending',
  'market.submitOffer': 'Submit Offer →',
  'market.noResults': 'No results found',
  'market.adjustSearch': 'Try adjusting your search or filters',

  'deals.myDeals': 'My Deals',
  'deals.myOrders': 'My Orders',
  'deals.totalDeals': '{{count}} total deals',
  'deals.active': 'Active',
  'deals.payment': 'Payment',
  'deals.transit': 'Transit',
  'deals.completed': 'Completed',
  'deals.inTransit': 'In Transit',
  'deals.all': 'All',
  'deals.stage': 'Stage {{stage}}/12',
  'deals.complete': '{{pct}}% complete',
  'deals.noDeals': 'No deals found',
  'deals.differentFilter': 'Try a different filter',

  'post.demandPosted': 'Demand Posted!',
  'post.listingCreated': 'Listing Created!',
  'post.sellerNotify': 'Sellers will be notified and can submit offers.',
  'post.listingReview':
    "Your listing is under review. You'll be notified once approved.",
  'post.postAnother': 'Post Another',
  'post.postDemandTitle': '📋 Post a Demand',
  'post.createListingTitle': '📦 Create Listing',
  'post.postDemandSub': 'Let sellers know what you need',
  'post.createListingSub': 'List your commodity for buyers',
  'post.commodity': 'Commodity',
  'post.quantityUnit': 'Quantity & Unit',
  'post.budget': 'Budget (per 40kg)',
  'post.askingPrice': 'Asking Price (per 40kg)',
  'post.location': 'Location',
  'post.notes': 'Additional Notes',
  'post.buyerNotesPlaceholder': 'Quality grade, delivery preference...',
  'post.sellerNotesPlaceholder': 'Quality, packaging, availability...',
  'post.postDemand': '📋 Post Demand',
  'post.submitListing': '📦 Submit Listing',

  'listing.verified': 'Verified',
  'listing.deals': 'deals',
  'listing.available': '{{qty}} available',
  'listing.location': 'Location',
  'listing.seller': 'Seller',
  'listing.quantity': 'Quantity',
  'listing.price': 'Price',
  'listing.about': 'About this Listing',
  'listing.priceBreakdown': 'Price Breakdown',
  'listing.unitPrice': 'Unit Price',
  'listing.commission': 'Commission',
  'listing.estDelivery': 'Est. Delivery',
  'listing.totalPer': 'Total (per 40kg)',
  'listing.chat': '💬 Chat',
  'listing.sendInterest': 'Send Interest →',

  'deal.quantity': 'Quantity',
  'deal.rate': 'Rate',
  'deal.location': 'Location',
  'deal.buyer': 'Buyer',
  'deal.seller': 'Seller',
  'deal.progress': 'Deal Progress',
  'deal.paymentSchedule': 'Payment Schedule',
  'deal.actions': 'Actions',
  'deal.negotiate': '💬 Negotiate',
  'deal.dispute': '📋 Dispute',
  'deal.paid': 'Paid',
  'deal.pending': 'Pending',

  'common.approved': 'Approved',
  'common.pending': 'Pending',
  'common.primary': 'Primary',
  'common.saved': 'Saved',
  'common.saveChanges': 'Save Changes',
  'common.updateProfile': 'Update Profile',
  'common.profileUpdated': 'Profile Updated',
  'common.enabled': 'Enabled',
  'common.on': 'On',
  'common.versionValue': 'v2.4.1',
  'common.cacheValue': '12 MB',
  'common.currencyValue': 'PKR ₨',
  'common.browseMarketplace': 'Browse Marketplace',
  'common.verifiedDate': 'Verified {{date}}',
  'common.verifiedDash': 'Verified —',

  'profile.approved': 'Approved',
  'profile.deals': 'Deals',
  'profile.supplies': 'Supplies',
  'profile.rating': 'Rating',
  'profile.account': 'ACCOUNT',
  'profile.preferences': 'PREFERENCES',
  'profile.support': 'SUPPORT',
  'profile.personalInfo': 'Personal Information',
  'profile.personalInfoSub': 'Name, email, phone',
  'profile.businessProfile': 'Business Profile',
  'profile.businessProfileSub': 'Company, type, location',
  'profile.paymentMethods': 'Payment Methods',
  'profile.paymentMethodsSub': 'Bank account, wallets',
  'profile.verificationStatus': 'Verification Status',
  'profile.verificationStatusSub': 'KYC approved',
  'profile.savedListings': 'Saved Listings',
  'profile.savedListingsSub': 'Your favorites',
  'profile.notifications': 'Notifications',
  'profile.notificationsSub': 'Manage alerts',
  'profile.appSettings': 'App Settings',
  'profile.appSettingsSub': 'Language, theme',
  'profile.helpSupport': 'Help & Support',
  'profile.helpSupportSub': 'FAQs, contact us',
  'profile.termsPrivacy': 'Terms & Privacy',
  'profile.termsPrivacySub': 'Legal documents',
  'profile.logout': 'Log Out',

  'personal.title': 'Personal Information',
  'personal.changePhoto': 'Change Photo',
  'personal.fullName': 'Full Name',
  'personal.email': 'Email',
  'personal.phone': 'Phone',
  'personal.city': 'City',
  'personal.dateOfBirth': 'Date of Birth',
  'personal.cnic': 'CNIC',
  'personal.placeholderFullName': 'Enter full name',
  'personal.placeholderEmail': 'Enter email',
  'personal.placeholderPhone': 'Enter phone',
  'personal.placeholderCity': 'Enter city',
  'personal.placeholderDateOfBirth': 'Enter date of birth',
  'personal.placeholderCnic': 'XXXXX-XXXXXXX-X',

  'business.title': 'Business Profile',
  'business.verifiedSellerSince': 'Verified Seller · Since 2021',
  'business.businessName': 'Business Name',
  'business.businessType': 'Business Type',
  'business.registrationNo': 'Registration No',
  'business.primaryCrop': 'Primary Crop',
  'business.farmLocation': 'Farm Location',
  'business.farmSize': 'Farm Size',
  'business.placeholderBusinessName': 'Business name',
  'business.placeholderBusinessType': 'Business type',
  'business.placeholderRegistrationNo': 'Registration number',
  'business.placeholderPrimaryCrop': 'Primary crop',
  'business.placeholderFarmLocation': 'Farm location',
  'business.placeholderFarmSize': 'Farm size',

  'payments.title': 'Payment Methods',
  'payments.linkedBankAccount': 'LINKED BANK ACCOUNT',
  'payments.hblBankAccount': 'HBL Bank Account',
  'payments.maskedAccount': '•••• •••• 4821',
  'payments.accountName': 'Account Name',
  'payments.accountNo': 'Account No',
  'payments.iban': 'IBAN',
  'payments.mobileWallet': 'MOBILE WALLET',
  'payments.easypaisa': 'Easypaisa',
  'payments.addNewAccount': 'Add New Account',

  'verification.title': 'Verification Status',
  'verification.accountVerified': 'Account Verified',
  'verification.accountVerifiedSub':
    'Your account is fully verified and active',
  'verification.cnic': 'CNIC Verification',
  'verification.businessDocs': 'Business Docs',
  'verification.bankAccount': 'Bank Account',
  'verification.phone': 'Phone Verification',
  'verification.address': 'Address Verification',
  'verification.feb10': 'Feb 10, 2024',
  'verification.feb12': 'Feb 12, 2024',
  'verification.feb14': 'Feb 14, 2024',

  'saved.title': 'Saved Listings',
  'saved.count': '{{count}} saved items',
  'saved.emptyTitle': 'No saved listings',
  'saved.emptyBody':
    'Tap the heart icon on any listing to save it here for quick access.',

  'appSettings.title': 'App Settings',
  'appSettings.display': 'DISPLAY',
  'appSettings.security': 'SECURITY',
  'appSettings.data': 'DATA',
  'appSettings.language': 'Language',
  'appSettings.currency': 'Currency',
  'appSettings.changePin': 'Change PIN',
  'appSettings.biometricLogin': 'Biometric Login',
  'appSettings.twoFactorAuth': 'Two-Factor Auth',
  'appSettings.clearCache': 'Clear Cache',
  'appSettings.appVersion': 'App Version',

  'notifications.title': 'Notifications',
  'notifications.newDealAlerts': 'New Deal Alerts',
  'notifications.newDealAlertsSub': 'When a deal is created for you',
  'notifications.offerUpdates': 'Offer Updates',
  'notifications.offerUpdatesSub': 'Status changes on your offers',
  'notifications.paymentAlerts': 'Payment Alerts',
  'notifications.paymentAlertsSub': 'Payment confirmed or pending',
  'notifications.dispatchDelivery': 'Dispatch & Delivery',
  'notifications.dispatchDeliverySub': 'Shipment tracking updates',
  'notifications.promotions': 'Promotions',
  'notifications.promotionsSub': 'Naseeb news and feature updates',
  'notifications.sms': 'SMS Notifications',
  'notifications.smsSub': 'Receive alerts via SMS',

  'support.title': 'Help & Support',
  'support.subtitle': "We're here to help",
  'support.contactUs': 'Contact Us',
  'support.faq': 'Frequently Asked Questions',
  'support.whatsapp': 'WhatsApp',
  'support.email': 'Email',
  'support.helpline': 'Helpline',
  'support.qPostDemand': 'How do I post a demand?',
  'support.aPostDemand':
    'Go to the Post tab, select your commodity, enter quantity, price and location, then tap "Post Demand".',
  'support.qPayments': 'How are payments handled?',
  'support.aPayments':
    'Payments are staged: 30% advance, 40% on dispatch, and 30% on delivery. Naseeb holds funds in escrow until both parties confirm.',
  'support.qKyc': 'How long does KYC take?',
  'support.aKyc':
    'KYC verification typically takes 1-2 business days after submitting all required documents.',
  'support.qCancelDeal': 'Can I cancel a deal?',
  'support.aCancelDeal':
    'Deals can be cancelled before the "Deal Agreed" stage. After that, cancellation is subject to review and may incur a penalty.',
  'support.qTrackShipment': 'How do I track my shipment?',
  'support.aTrackShipment':
    'Go to your deal in the Deals tab and tap "Track Shipment" once the deal reaches the In Transit stage.',

  'terms.title': 'Terms & Privacy',
  'terms.subtitle': 'Last updated January 2024',
  'terms.legalDocuments': 'Legal Documents',
  'terms.bannerBody':
    'Please read these terms carefully before using Naseeb Agri Market.',
  'terms.agree': 'I Agree to Terms',
  'terms.acceptanceTitle': '1. Acceptance of Terms',
  'terms.acceptanceBody':
    'By creating an account and using Naseeb Agri Market, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use the platform.',
  'terms.accountsTitle': '2. User Accounts',
  'terms.accountsBody':
    'You must be at least 18 years of age and provide accurate information during registration. You are responsible for maintaining the confidentiality of your account credentials.',
  'terms.listingsTitle': '3. Commodity Listings',
  'terms.listingsBody':
    'All listings must represent actual, available stock. Fraudulent or misleading listings will result in immediate account suspension. Naseeb reserves the right to remove any listing without notice.',
  'terms.paymentTitle': '4. Payment & Escrow',
  'terms.paymentBody':
    'All payments are processed through our escrow system. Funds are held securely and released only upon confirmed delivery and inspection. Naseeb charges a 1% commission on completed deals.',
  'terms.disputeTitle': '5. Dispute Resolution',
  'terms.disputeBody':
    'Disputes must be raised within 48 hours of delivery. Our resolution team will mediate and may request supporting evidence. Decisions by Naseeb in dispute cases are final.',
  'terms.privacyTitle': '6. Privacy Policy',
  'terms.privacyBody':
    'We collect personal and business information to facilitate trading. We do not sell your data to third parties. Data is used solely for platform operations, fraud prevention, and service improvement.',
  'terms.liabilityTitle': '7. Limitation of Liability',
  'terms.liabilityBody':
    'Naseeb is a marketplace facilitator and is not liable for the quality, quantity, or delivery of commodities. Traders transact at their own risk after accepting these terms.',
} as const;

export type TranslationKey = keyof typeof en;

const ur: Record<TranslationKey, string> = {
  'tabs.home': 'ہوم',
  'tabs.market': 'مارکیٹ',
  'tabs.deals': 'ڈیلز',
  'tabs.post': 'پوسٹ',
  'tabs.profile': 'پروفائل',

  'auth.splashTagline': 'پاکستان کی قابل اعتماد کموڈٹی مارکیٹ پلیس',
  'auth.welcomeTagline':
    'پاکستان کی زرعی کموڈٹی مارکیٹس میں\nخریداروں اور فروخت کنندگان کو ملائیں',
  'auth.verified': 'تصدیق شدہ',
  'auth.liveRates': 'لائیو ریٹس',
  'auth.secureDeals': 'محفوظ ڈیلز',
  'auth.createAccount': 'اکاؤنٹ بنائیں',
  'auth.login': 'لاگ ان',
  'auth.browseGuest': 'مہمان کے طور پر دیکھیں',
  'auth.agreementStart': 'جاری رکھنے سے آپ ہماری',
  'auth.terms': 'شرائط خدمت',
  'auth.privacy': 'رازداری پالیسی',
  'auth.phoneStep': 'مرحلہ 1 از 2',
  'auth.otpStep': 'مرحلہ 2 از 2',
  'auth.phoneTitle': 'اپنا\nفون نمبر درج کریں',
  'auth.phoneSubtitle': 'ہم آپ کو تصدیقی کوڈ بھیجیں گے',
  'auth.mobileNumber': 'موبائل نمبر',
  'auth.phoneHelp': 'اپنا 10-11 ہندسوں کا موبائل نمبر درج کریں',
  'auth.sendOtp': 'OTP بھیجیں →',
  'auth.otpTitle': 'اپنا\nنمبر تصدیق کریں',
  'auth.codeSentTo': 'کوڈ بھیجا گیا',
  'auth.enterCode': '6 ہندسوں کا کوڈ درج کریں',
  'auth.didntReceive': 'موصول نہیں ہوا؟ ',
  'auth.resendCode': 'کوڈ دوبارہ بھیجیں',
  'auth.verifyContinue': 'تصدیق کریں اور جاری رکھیں →',

  'home.buyer': 'خریدار',
  'home.seller': 'سیلر',
  'home.location': 'لاہور، پنجاب',
  'home.activeDeals': 'فعال ڈیلز',
  'home.demands': 'ڈیمانڈز',
  'home.totalSpent': 'کل خرچ',
  'home.supplies': 'سپلائیز',
  'home.orders': 'آرڈرز',
  'home.earnings': 'آمدنی',
  'home.marketRates': 'مارکیٹ ریٹس',
  'home.seeAll': 'سب دیکھیں',
  'home.featuredSupplies': 'نمایاں سپلائیز',
  'home.viewAll': 'سب دیکھیں',
  'home.browseCategories': 'کیٹیگریز دیکھیں',
  'home.all': 'سب',
  'home.totalEarningsMonth': 'کل آمدنی (اس ماہ)',
  'home.released': 'جاری شدہ',
  'home.pending': 'زیر التواء',
  'home.thisWeek': 'اس ہفتے',
  'home.quickActions': 'فوری اقدامات',
  'home.createSupply': 'سپلائی بنائیں',
  'home.createSupplySub': 'اپنا اسٹاک لسٹ کریں',
  'home.myListings': 'میری لسٹنگز',
  'home.myListingsSub': 'اسٹاک منظم کریں',
  'home.viewOrders': 'آرڈرز دیکھیں',
  'home.viewOrdersSub': 'ڈیلز ٹریک کریں',
  'home.payouts': 'ادائیگیاں',
  'home.payoutsSub': 'آمدنی',
  'seller.dashboard': 'سیلر ڈیش بورڈ',
  'seller.dashboardSub': 'اپنی لسٹنگز اور آرڈرز منظم کریں',
  'seller.activeListings': 'فعال لسٹنگز',
  'seller.pendingOrders': 'زیر التواء آرڈرز',
  'seller.earnings': 'آمدنی',
  'seller.createListing': '+ نئی لسٹنگ بنائیں',

  'market.buyCommodities': 'کموڈٹیز خریدیں',
  'market.buyerDemands': 'خریدار ڈیمانڈز',
  'market.listingsAvailable': '{{count}} لسٹنگز دستیاب',
  'market.activeRequests': '{{count}} فعال درخواستیں',
  'market.filter': 'فلٹر',
  'market.searchCommodities': 'کموڈٹیز، مقامات تلاش کریں...',
  'market.searchRequests': 'خریدار درخواستیں تلاش کریں...',
  'market.by': 'از',
  'market.interest': 'دلچسپی',
  'market.active': 'فعال',
  'market.pending': 'زیر التواء',
  'market.submitOffer': 'آفر جمع کریں →',
  'market.noResults': 'کوئی نتیجہ نہیں ملا',
  'market.adjustSearch': 'اپنی تلاش یا فلٹرز تبدیل کریں',

  'deals.myDeals': 'میری ڈیلز',
  'deals.myOrders': 'میرے آرڈرز',
  'deals.totalDeals': '{{count}} کل ڈیلز',
  'deals.active': 'فعال',
  'deals.payment': 'ادائیگی',
  'deals.transit': 'ٹرانزٹ',
  'deals.completed': 'مکمل',
  'deals.inTransit': 'راستے میں',
  'deals.all': 'سب',
  'deals.stage': 'مرحلہ {{stage}}/12',
  'deals.complete': '{{pct}}% مکمل',
  'deals.noDeals': 'کوئی ڈیل نہیں ملی',
  'deals.differentFilter': 'دوسرا فلٹر آزمائیں',

  'post.demandPosted': 'ڈیمانڈ پوسٹ ہو گئی!',
  'post.listingCreated': 'لسٹنگ بن گئی!',
  'post.sellerNotify': 'سیلرز کو اطلاع دی جائے گی اور وہ آفرز جمع کر سکیں گے۔',
  'post.listingReview':
    'آپ کی لسٹنگ جائزے میں ہے۔ منظوری کے بعد آپ کو اطلاع دی جائے گی۔',
  'post.postAnother': 'دوسری پوسٹ کریں',
  'post.postDemandTitle': '📋 ڈیمانڈ پوسٹ کریں',
  'post.createListingTitle': '📦 لسٹنگ بنائیں',
  'post.postDemandSub': 'سیلرز کو بتائیں آپ کو کیا چاہیے',
  'post.createListingSub': 'اپنی کموڈٹی خریداروں کے لیے لسٹ کریں',
  'post.commodity': 'کموڈٹی',
  'post.quantityUnit': 'مقدار اور یونٹ',
  'post.budget': 'بجٹ (فی 40kg)',
  'post.askingPrice': 'طلب قیمت (فی 40kg)',
  'post.location': 'مقام',
  'post.notes': 'اضافی نوٹس',
  'post.buyerNotesPlaceholder': 'کوالٹی گریڈ، ڈیلیوری ترجیح...',
  'post.sellerNotesPlaceholder': 'کوالٹی، پیکنگ، دستیابی...',
  'post.postDemand': '📋 ڈیمانڈ پوسٹ کریں',
  'post.submitListing': '📦 لسٹنگ جمع کریں',

  'listing.verified': 'تصدیق شدہ',
  'listing.deals': 'ڈیلز',
  'listing.available': '{{qty}} دستیاب',
  'listing.location': 'مقام',
  'listing.seller': 'سیلر',
  'listing.quantity': 'مقدار',
  'listing.price': 'قیمت',
  'listing.about': 'اس لسٹنگ کے بارے میں',
  'listing.priceBreakdown': 'قیمت کی تفصیل',
  'listing.unitPrice': 'یونٹ قیمت',
  'listing.commission': 'کمیشن',
  'listing.estDelivery': 'متوقع ڈیلیوری',
  'listing.totalPer': 'کل (فی 40kg)',
  'listing.chat': '💬 چیٹ',
  'listing.sendInterest': 'دلچسپی بھیجیں →',

  'deal.quantity': 'مقدار',
  'deal.rate': 'ریٹ',
  'deal.location': 'مقام',
  'deal.buyer': 'خریدار',
  'deal.seller': 'سیلر',
  'deal.progress': 'ڈیل پیش رفت',
  'deal.paymentSchedule': 'ادائیگی شیڈول',
  'deal.actions': 'اقدامات',
  'deal.negotiate': '💬 بات چیت',
  'deal.dispute': '📋 تنازعہ',
  'deal.paid': 'ادا شدہ',
  'deal.pending': 'زیر التواء',

  'common.approved': 'منظور شدہ',
  'common.pending': 'زیر التواء',
  'common.primary': 'بنیادی',
  'common.saved': 'محفوظ',
  'common.saveChanges': 'تبدیلیاں محفوظ کریں',
  'common.updateProfile': 'پروفائل اپ ڈیٹ کریں',
  'common.profileUpdated': 'پروفائل اپ ڈیٹ ہو گیا',
  'common.enabled': 'فعال',
  'common.on': 'آن',
  'common.versionValue': 'v2.4.1',
  'common.cacheValue': '12 MB',
  'common.currencyValue': 'PKR ₨',
  'common.browseMarketplace': 'مارکیٹ پلیس دیکھیں',
  'common.verifiedDate': '{{date}} کو تصدیق شدہ',
  'common.verifiedDash': 'تصدیق شدہ —',

  'profile.approved': 'منظور شدہ',
  'profile.deals': 'ڈیلز',
  'profile.supplies': 'سپلائیز',
  'profile.rating': 'ریٹنگ',
  'profile.account': 'اکاؤنٹ',
  'profile.preferences': 'ترجیحات',
  'profile.support': 'سپورٹ',
  'profile.personalInfo': 'ذاتی معلومات',
  'profile.personalInfoSub': 'نام، ای میل، فون',
  'profile.businessProfile': 'کاروباری پروفائل',
  'profile.businessProfileSub': 'کمپنی، قسم، مقام',
  'profile.paymentMethods': 'ادائیگی کے طریقے',
  'profile.paymentMethodsSub': 'بینک اکاؤنٹ، والٹس',
  'profile.verificationStatus': 'تصدیقی حیثیت',
  'profile.verificationStatusSub': 'KYC منظور شدہ',
  'profile.savedListings': 'محفوظ لسٹنگز',
  'profile.savedListingsSub': 'آپ کی پسندیدہ اشیاء',
  'profile.notifications': 'اطلاعات',
  'profile.notificationsSub': 'الرٹس منظم کریں',
  'profile.appSettings': 'ایپ سیٹنگز',
  'profile.appSettingsSub': 'زبان، تھیم',
  'profile.helpSupport': 'مدد اور سپورٹ',
  'profile.helpSupportSub': 'سوالات، رابطہ',
  'profile.termsPrivacy': 'شرائط اور رازداری',
  'profile.termsPrivacySub': 'قانونی دستاویزات',
  'profile.logout': 'لاگ آؤٹ',

  'personal.title': 'ذاتی معلومات',
  'personal.changePhoto': 'تصویر تبدیل کریں',
  'personal.fullName': 'پورا نام',
  'personal.email': 'ای میل',
  'personal.phone': 'فون',
  'personal.city': 'شہر',
  'personal.dateOfBirth': 'تاریخ پیدائش',
  'personal.cnic': 'شناختی کارڈ',
  'personal.placeholderFullName': 'پورا نام درج کریں',
  'personal.placeholderEmail': 'ای میل درج کریں',
  'personal.placeholderPhone': 'فون درج کریں',
  'personal.placeholderCity': 'شہر درج کریں',
  'personal.placeholderDateOfBirth': 'تاریخ پیدائش درج کریں',
  'personal.placeholderCnic': 'XXXXX-XXXXXXX-X',

  'business.title': 'کاروباری پروفائل',
  'business.verifiedSellerSince': 'تصدیق شدہ سیلر · 2021 سے',
  'business.businessName': 'کاروبار کا نام',
  'business.businessType': 'کاروبار کی قسم',
  'business.registrationNo': 'رجسٹریشن نمبر',
  'business.primaryCrop': 'اہم فصل',
  'business.farmLocation': 'فارم کا مقام',
  'business.farmSize': 'فارم کا سائز',
  'business.placeholderBusinessName': 'کاروبار کا نام',
  'business.placeholderBusinessType': 'کاروبار کی قسم',
  'business.placeholderRegistrationNo': 'رجسٹریشن نمبر',
  'business.placeholderPrimaryCrop': 'اہم فصل',
  'business.placeholderFarmLocation': 'فارم کا مقام',
  'business.placeholderFarmSize': 'فارم کا سائز',

  'payments.title': 'ادائیگی کے طریقے',
  'payments.linkedBankAccount': 'منسلک بینک اکاؤنٹ',
  'payments.hblBankAccount': 'HBL بینک اکاؤنٹ',
  'payments.maskedAccount': '•••• •••• 4821',
  'payments.accountName': 'اکاؤنٹ نام',
  'payments.accountNo': 'اکاؤنٹ نمبر',
  'payments.iban': 'IBAN',
  'payments.mobileWallet': 'موبائل والٹ',
  'payments.easypaisa': 'ایزی پیسہ',
  'payments.addNewAccount': 'نیا اکاؤنٹ شامل کریں',

  'verification.title': 'تصدیقی حیثیت',
  'verification.accountVerified': 'اکاؤنٹ تصدیق شدہ',
  'verification.accountVerifiedSub':
    'آپ کا اکاؤنٹ مکمل طور پر تصدیق شدہ اور فعال ہے',
  'verification.cnic': 'شناختی کارڈ کی تصدیق',
  'verification.businessDocs': 'کاروباری دستاویزات',
  'verification.bankAccount': 'بینک اکاؤنٹ',
  'verification.phone': 'فون تصدیق',
  'verification.address': 'پتے کی تصدیق',
  'verification.feb10': '10 فروری، 2024',
  'verification.feb12': '12 فروری، 2024',
  'verification.feb14': '14 فروری، 2024',

  'saved.title': 'محفوظ لسٹنگز',
  'saved.count': '{{count}} محفوظ اشیاء',
  'saved.emptyTitle': 'کوئی محفوظ لسٹنگ نہیں',
  'saved.emptyBody':
    'کسی بھی لسٹنگ پر دل کا آئیکن دبا کر اسے فوری رسائی کے لیے یہاں محفوظ کریں۔',

  'appSettings.title': 'ایپ سیٹنگز',
  'appSettings.display': 'ڈسپلے',
  'appSettings.security': 'سیکیورٹی',
  'appSettings.data': 'ڈیٹا',
  'appSettings.language': 'زبان',
  'appSettings.currency': 'کرنسی',
  'appSettings.changePin': 'پن تبدیل کریں',
  'appSettings.biometricLogin': 'بائیومیٹرک لاگ ان',
  'appSettings.twoFactorAuth': 'دو مرحلہ تصدیق',
  'appSettings.clearCache': 'کیش صاف کریں',
  'appSettings.appVersion': 'ایپ ورژن',

  'notifications.title': 'اطلاعات',
  'notifications.newDealAlerts': 'نئی ڈیل الرٹس',
  'notifications.newDealAlertsSub': 'جب آپ کے لیے ڈیل بنائی جائے',
  'notifications.offerUpdates': 'آفر اپ ڈیٹس',
  'notifications.offerUpdatesSub': 'آپ کی آفرز کی حیثیت میں تبدیلی',
  'notifications.paymentAlerts': 'ادائیگی الرٹس',
  'notifications.paymentAlertsSub': 'ادائیگی مکمل یا زیر التواء',
  'notifications.dispatchDelivery': 'ڈسپیچ اور ڈیلیوری',
  'notifications.dispatchDeliverySub': 'شپمنٹ ٹریکنگ اپ ڈیٹس',
  'notifications.promotions': 'پروموشنز',
  'notifications.promotionsSub': 'نصیب کی خبریں اور فیچر اپ ڈیٹس',
  'notifications.sms': 'SMS اطلاعات',
  'notifications.smsSub': 'SMS کے ذریعے الرٹس وصول کریں',

  'support.title': 'مدد اور سپورٹ',
  'support.subtitle': 'ہم مدد کے لیے موجود ہیں',
  'support.contactUs': 'ہم سے رابطہ کریں',
  'support.faq': 'اکثر پوچھے گئے سوالات',
  'support.whatsapp': 'واٹس ایپ',
  'support.email': 'ای میل',
  'support.helpline': 'ہیلپ لائن',
  'support.qPostDemand': 'میں ڈیمانڈ کیسے پوسٹ کروں؟',
  'support.aPostDemand':
    'پوسٹ ٹیب پر جائیں، اپنی کموڈٹی منتخب کریں، مقدار، قیمت اور مقام درج کریں، پھر "Post Demand" دبائیں۔',
  'support.qPayments': 'ادائیگیاں کیسے ہینڈل ہوتی ہیں؟',
  'support.aPayments':
    'ادائیگیاں مراحل میں ہوتی ہیں: 30% ایڈوانس، 40% ڈسپیچ پر، اور 30% ڈیلیوری پر۔ نصیب دونوں فریقوں کی تصدیق تک رقم ایسکرو میں رکھتا ہے۔',
  'support.qKyc': 'KYC میں کتنا وقت لگتا ہے؟',
  'support.aKyc':
    'تمام مطلوبہ دستاویزات جمع کرانے کے بعد KYC تصدیق عموماً 1-2 کاروباری دن لیتی ہے۔',
  'support.qCancelDeal': 'کیا میں ڈیل منسوخ کر سکتا ہوں؟',
  'support.aCancelDeal':
    'ڈیل "Deal Agreed" مرحلے سے پہلے منسوخ کی جا سکتی ہے۔ اس کے بعد منسوخی جائزے سے مشروط ہے اور جرمانہ ہو سکتا ہے۔',
  'support.qTrackShipment': 'میں اپنی شپمنٹ کیسے ٹریک کروں؟',
  'support.aTrackShipment':
    'Deals ٹیب میں اپنی ڈیل کھولیں اور جب ڈیل In Transit مرحلے پر پہنچے تو "Track Shipment" دبائیں۔',

  'terms.title': 'شرائط اور رازداری',
  'terms.subtitle': 'آخری اپ ڈیٹ جنوری 2024',
  'terms.legalDocuments': 'قانونی دستاویزات',
  'terms.bannerBody':
    'نصیب ایگری مارکیٹ استعمال کرنے سے پہلے براہ کرم یہ شرائط غور سے پڑھیں۔',
  'terms.agree': 'میں شرائط سے متفق ہوں',
  'terms.acceptanceTitle': '1. شرائط کی قبولیت',
  'terms.acceptanceBody':
    'اکاؤنٹ بنا کر اور نصیب ایگری مارکیٹ استعمال کر کے آپ ان شرائط خدمت اور ہماری رازداری پالیسی کے پابند ہونے سے اتفاق کرتے ہیں۔ اگر آپ اتفاق نہیں کرتے تو پلیٹ فارم استعمال نہ کریں۔',
  'terms.accountsTitle': '2. صارف اکاؤنٹس',
  'terms.accountsBody':
    'آپ کی عمر کم از کم 18 سال ہونی چاہیے اور رجسٹریشن کے دوران درست معلومات فراہم کرنی ہوں گی۔ آپ اپنے اکاؤنٹ کی اسناد کی رازداری برقرار رکھنے کے ذمہ دار ہیں۔',
  'terms.listingsTitle': '3. کموڈٹی لسٹنگز',
  'terms.listingsBody':
    'تمام لسٹنگز حقیقی اور دستیاب اسٹاک کی نمائندگی کریں۔ دھوکہ دہی یا گمراہ کن لسٹنگز پر اکاؤنٹ فوری معطل ہو سکتا ہے۔ نصیب کسی بھی لسٹنگ کو نوٹس کے بغیر ہٹانے کا حق رکھتا ہے۔',
  'terms.paymentTitle': '4. ادائیگی اور ایسکرو',
  'terms.paymentBody':
    'تمام ادائیگیاں ہمارے ایسکرو سسٹم کے ذریعے پراسیس ہوتی ہیں۔ رقم محفوظ رکھی جاتی ہے اور تصدیق شدہ ڈیلیوری اور معائنہ کے بعد جاری کی جاتی ہے۔ مکمل ڈیلز پر نصیب 1% کمیشن لیتا ہے۔',
  'terms.disputeTitle': '5. تنازعہ حل',
  'terms.disputeBody':
    'تنازعہ ڈیلیوری کے 48 گھنٹوں کے اندر اٹھایا جانا چاہیے۔ ہماری ٹیم ثالثی کرے گی اور ثبوت طلب کر سکتی ہے۔ تنازعہ کیسز میں نصیب کا فیصلہ حتمی ہو گا۔',
  'terms.privacyTitle': '6. رازداری پالیسی',
  'terms.privacyBody':
    'ہم ٹریڈنگ کے لیے ذاتی اور کاروباری معلومات جمع کرتے ہیں۔ ہم آپ کا ڈیٹا تیسرے فریق کو فروخت نہیں کرتے۔ ڈیٹا صرف پلیٹ فارم آپریشنز، فراڈ روک تھام اور سروس بہتری کے لیے استعمال ہوتا ہے۔',
  'terms.liabilityTitle': '7. ذمہ داری کی حد',
  'terms.liabilityBody':
    'نصیب ایک مارکیٹ پلیس سہولت کار ہے اور کموڈٹیز کے معیار، مقدار یا ڈیلیوری کا ذمہ دار نہیں۔ تاجر ان شرائط کو قبول کرنے کے بعد اپنے رسک پر لین دین کرتے ہیں۔',
};

export const translations: Record<
  LanguageCode,
  Record<TranslationKey, string>
> = {
  en,
  ur,
};

type TranslationParams = Record<string, string | number>;

const interpolate = (template: string, params?: TranslationParams) => {
  if (!params) {
    return template;
  }

  return Object.entries(params).reduce(
    (copy, [key, value]) => copy.split(`{{${key}}}`).join(String(value)),
    template,
  );
};

export const translate = (
  language: LanguageCode,
  key: TranslationKey,
  params?: TranslationParams,
) => {
  const template =
    translations[language]?.[key] ?? translations[DEFAULT_LANGUAGE][key] ?? key;

  return interpolate(template, params);
};

export const useTranslation = () => {
  const dispatch = useAppDispatch();
  const language = useAppSelector(state => state.app.language);
  const languageInfo = getLanguageByCode(language);

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams) =>
      translate(language, key, params),
    [language],
  );

  const setLanguage = useCallback(
    (nextLanguage: LanguageCode) => {
      dispatch(setAppLanguage(nextLanguage));
      void AsyncStorage.setItem(
        localizationConfig.storageKey,
        nextLanguage,
      ).catch(() => undefined);
    },
    [dispatch],
  );

  return {
    t,
    language,
    languageInfo,
    setLanguage,
    direction: languageInfo.direction,
    isUrdu: language === 'ur',
  };
};

export const useHydrateLanguage = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      const storedLanguage = await AsyncStorage.getItem(
        localizationConfig.storageKey,
      );

      if (mounted && storedLanguage && isSupportedLanguage(storedLanguage)) {
        dispatch(setAppLanguage(storedLanguage));
      }
    };

    void hydrate().catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, [dispatch]);
};
