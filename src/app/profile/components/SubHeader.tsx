import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
  title: string;
  subtitle?: string;
  navigation: any;
}

const SubHeader = ({ title, subtitle, navigation }: Props) => (
  <View className="bg-gray-50 pt-12 px-5 pb-4 border-b border-gray-200">
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      className="mb-3 self-start"
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 24 }}
      activeOpacity={0.5}
    >
      <Text style={{ fontSize: 24, color: '#111827', lineHeight: 28 }}>←</Text>
    </TouchableOpacity>
    <Text className="text-gray-900 text-2xl font-extrabold">{title}</Text>
    {subtitle ? <Text className="text-gray-500 text-sm mt-1">{subtitle}</Text> : null}
  </View>
);

export default SubHeader;
