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
    {/* Top Row */}
    <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center' }}>
      {onBack && (
        <TouchableOpacity
          onPress={onBack}
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{
            backgroundColor: 'rgba(255,255,255,0.12)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.2)',
          }}
          activeOpacity={0.7}
        >
          <AppIcon name="back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {step && (
        <Text className="text-orange-400 text-xs font-bold tracking-widest">
          {step}
        </Text>
      )}
    </View>

    {/* Title + Subtitle Block */}
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
        marginTop: 20,
      }}
    >
      {icon && (
        <View
          className="w-12 h-12 rounded-2xl items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
        >
          <AppIcon name={icon} size={24} color="#FFFFFF" />
        </View>
      )}

      {/* Text container ensures subtitle starts exactly under title */}
      <View style={{ flex: 1 }}>
        <Text className="text-white text-3xl font-extrabold leading-9">
          {title}
        </Text>

        {subtitle && (
          <Text className="text-green-300 text-sm mt-2 leading-5">
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  </View>
);

export default GreenHeader;
