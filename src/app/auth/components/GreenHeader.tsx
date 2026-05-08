import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AppIcon } from '../../../assets/icons';
import type { AppIconName } from '../../../assets/icons';

type Props = {
  step?: string;
  title: string;
  subtitle?: string;
  icon?: AppIconName;
  onBack?: () => void;
};

const GreenHeader = ({ step, title, subtitle, icon, onBack }: Props) => (
  <View className="bg-green-800 pt-12 pb-7 px-5 overflow-hidden">
    <View
      className="absolute rounded-full bg-green-700 opacity-25"
      style={{ width: 160, height: 160, top: -40, right: -40 }}
    />
    <View
      className="absolute rounded-full bg-orange-500 opacity-10"
      style={{ width: 100, height: 100, bottom: -20, left: -20 }}
    />

    {onBack && (
      <TouchableOpacity
        onPress={onBack}
        className="w-10 h-10 rounded-xl items-center justify-center mb-4"
        style={{
          backgroundColor: 'rgba(255,255,255,0.12)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.2)',
        }}
        activeOpacity={0.7}
      >
        <Text className="text-white text-lg">←</Text>
      </TouchableOpacity>
    )}

    {icon && (
      <View
        className="w-12 h-12 rounded-2xl items-center justify-center mb-4"
        style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
      >
        <AppIcon name={icon} size={24} color="#FFFFFF" />
      </View>
    )}

    {step && (
      <Text className="text-orange-400 text-xs font-bold tracking-widest mb-2">
        {step}
      </Text>
    )}
    <Text className="text-white text-3xl font-extrabold leading-9">{title}</Text>
    {subtitle && (
      <Text className="text-green-300 text-sm mt-2 leading-5">{subtitle}</Text>
    )}
  </View>
);

export default GreenHeader;
