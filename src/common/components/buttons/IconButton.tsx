import React from 'react';
import { Pressable } from 'react-native';

export const IconButton = ({
  icon,
  onPress,
}: {
  icon: React.ReactNode;
  onPress: () => void;
}) => <Pressable onPress={onPress}>{icon}</Pressable>;
