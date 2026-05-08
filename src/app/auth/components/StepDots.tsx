import React from 'react';
import { View } from 'react-native';

type Props = {
  total?: number;
  active: number;
};

const StepDots = ({ total = 5, active }: Props) => (
  <View className="flex-row justify-center items-center gap-2 py-4">
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={{
          width: i === active ? 24 : 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: i === active ? '#F3CD03' : '#D1FAE5',
        }}
      />
    ))}
  </View>
);

export default StepDots;
