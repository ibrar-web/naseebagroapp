import React from 'react';
import type { TextProps } from 'react-native';
import { Feather } from './feather';
import type { FeatherIconName } from './feather';

const iconRegistry = {
  add: {
    Icon: Feather,
    name: 'plus' as FeatherIconName,
  },
  approved: {
    Icon: Feather,
    name: 'check-circle' as FeatherIconName,
  },
  back: {
    Icon: Feather,
    name: 'arrow-left' as FeatherIconName,
  },
  bank: {
    Icon: Feather,
    name: 'credit-card' as FeatherIconName,
  },
  business: {
    Icon: Feather,
    name: 'briefcase' as FeatherIconName,
  },
  businessType: {
    Icon: Feather,
    name: 'shopping-bag' as FeatherIconName,
  },
  cache: {
    Icon: Feather,
    name: 'trash-2' as FeatherIconName,
  },
  chevronDown: {
    Icon: Feather,
    name: 'chevron-down' as FeatherIconName,
  },
  chevronRight: {
    Icon: Feather,
    name: 'chevron-right' as FeatherIconName,
  },
  contactEmail: {
    Icon: Feather,
    name: 'mail' as FeatherIconName,
  },
  contactPhone: {
    Icon: Feather,
    name: 'phone-call' as FeatherIconName,
  },
  contactWhatsapp: {
    Icon: Feather,
    name: 'message-circle' as FeatherIconName,
  },
  crop: {
    Icon: Feather,
    name: 'box' as FeatherIconName,
  },
  document: {
    Icon: Feather,
    name: 'file-text' as FeatherIconName,
  },
  edit: {
    Icon: Feather,
    name: 'edit' as FeatherIconName,
  },
  faq: {
    Icon: Feather,
    name: 'help-circle' as FeatherIconName,
  },
  farmSize: {
    Icon: Feather,
    name: 'activity' as FeatherIconName,
  },
  heart: {
    Icon: Feather,
    name: 'heart' as FeatherIconName,
  },
  legal: {
    Icon: Feather,
    name: 'file-text' as FeatherIconName,
  },
  listing: {
    Icon: Feather,
    name: 'package' as FeatherIconName,
  },
  logout: {
    Icon: Feather,
    name: 'log-out' as FeatherIconName,
  },
  menuAppSettings: {
    Icon: Feather,
    name: 'settings' as FeatherIconName,
  },
  menuBusiness: {
    Icon: Feather,
    name: 'briefcase' as FeatherIconName,
  },
  menuNotifications: {
    Icon: Feather,
    name: 'bell' as FeatherIconName,
  },
  menuPayment: {
    Icon: Feather,
    name: 'credit-card' as FeatherIconName,
  },
  menuPersonal: {
    Icon: Feather,
    name: 'user' as FeatherIconName,
  },
  menuSaved: {
    Icon: Feather,
    name: 'star' as FeatherIconName,
  },
  menuSupport: {
    Icon: Feather,
    name: 'help-circle' as FeatherIconName,
  },
  menuTerms: {
    Icon: Feather,
    name: 'file-text' as FeatherIconName,
  },
  menuVerification: {
    Icon: Feather,
    name: 'shield' as FeatherIconName,
  },
  mobileData: {
    Icon: Feather,
    name: 'wifi' as FeatherIconName,
  },
  notificationDeals: {
    Icon: Feather,
    name: 'package' as FeatherIconName,
  },
  notificationEmail: {
    Icon: Feather,
    name: 'mail' as FeatherIconName,
  },
  notificationMarket: {
    Icon: Feather,
    name: 'bar-chart-2' as FeatherIconName,
  },
  notificationOffers: {
    Icon: Feather,
    name: 'users' as FeatherIconName,
  },
  notificationPayment: {
    Icon: Feather,
    name: 'dollar-sign' as FeatherIconName,
  },
  notificationPush: {
    Icon: Feather,
    name: 'smartphone' as FeatherIconName,
  },
  notificationSystem: {
    Icon: Feather,
    name: 'bell' as FeatherIconName,
  },
  profileAvatar: {
    Icon: Feather,
    name: 'user' as FeatherIconName,
  },
  profileName: {
    Icon: Feather,
    name: 'user' as FeatherIconName,
  },
  profileEmail: {
    Icon: Feather,
    name: 'mail' as FeatherIconName,
  },
  profilePhone: {
    Icon: Feather,
    name: 'phone' as FeatherIconName,
  },
  profileCity: {
    Icon: Feather,
    name: 'map-pin' as FeatherIconName,
  },
  profileDateOfBirth: {
    Icon: Feather,
    name: 'calendar' as FeatherIconName,
  },
  profileCnic: {
    Icon: Feather,
    name: 'shield' as FeatherIconName,
  },
  registration: {
    Icon: Feather,
    name: 'file-text' as FeatherIconName,
  },
  savedEmpty: {
    Icon: Feather,
    name: 'bookmark' as FeatherIconName,
  },
  themeDark: {
    Icon: Feather,
    name: 'moon' as FeatherIconName,
  },
  themeLight: {
    Icon: Feather,
    name: 'sun' as FeatherIconName,
  },
  themeSystem: {
    Icon: Feather,
    name: 'settings' as FeatherIconName,
  },
  upload: {
    Icon: Feather,
    name: 'upload-cloud' as FeatherIconName,
  },
  version: {
    Icon: Feather,
    name: 'info' as FeatherIconName,
  },
  verificationBank: {
    Icon: Feather,
    name: 'credit-card' as FeatherIconName,
  },
  verificationBusiness: {
    Icon: Feather,
    name: 'briefcase' as FeatherIconName,
  },
  verificationCamera: {
    Icon: Feather,
    name: 'camera' as FeatherIconName,
  },
  verificationId: {
    Icon: Feather,
    name: 'shield' as FeatherIconName,
  },
  verificationLicense: {
    Icon: Feather,
    name: 'clipboard' as FeatherIconName,
  },
} as const;

export type AppIconName = keyof typeof iconRegistry;

type AppIconProps = Omit<TextProps, 'children'> & {
  name: AppIconName;
  size?: number;
  color?: string;
};

export const AppIcon = ({
  name,
  size = 14,
  color = '#D1D5DB',
  ...textProps
}: AppIconProps) => {
  const icon = iconRegistry[name];
  const Icon = icon.Icon;

  return <Icon name={icon.name} size={size} color={color} {...textProps} />;
};

export default iconRegistry;
