import React from 'react';
import type { TextProps } from 'react-native';
import { Feather } from './feather';
import type { FeatherIconName } from './feather';

const iconRegistry = {
  edit: {
    Icon: Feather,
    name: 'edit' as FeatherIconName,
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
