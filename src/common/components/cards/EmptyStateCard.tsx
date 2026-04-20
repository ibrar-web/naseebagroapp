import React from 'react';
import { Text } from 'react-native';
import { BaseCard } from './BaseCard';

export const EmptyStateCard = ({ message }: { message: string }) => (
  <BaseCard>
    <Text>{message}</Text>
  </BaseCard>
);
