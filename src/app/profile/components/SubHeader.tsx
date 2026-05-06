import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AppIcon } from '../../../assets/icons';

interface Props {
  title: string;
  subtitle?: string;
  navigation: any;
}

const SubHeader = ({ title, subtitle, navigation }: Props) => (
  <View className="bg-white pt-12 px-6 pb-6 border-b border-gray-100">
    <View className="flex-row items-center justify-center">
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="absolute left-0 h-12 w-12 items-start justify-center"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 24 }}
        activeOpacity={0.5}
      >
        <AppIcon name="back" size={30} color="#111827" />
      </TouchableOpacity>
      <Text className="text-center text-gray-900 text-2xl font-extrabold">
        {title}
      </Text>
    </View>
    {subtitle ? (
      <Text className="text-center text-gray-500 text-sm mt-2">{subtitle}</Text>
    ) : null}
  </View>
);

export default SubHeader;
