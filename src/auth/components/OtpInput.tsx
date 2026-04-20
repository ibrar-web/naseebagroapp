import React from 'react';
import { TextInput } from 'react-native';

export const OtpInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <TextInput keyboardType="number-pad" value={value} onChangeText={onChange} placeholder="Enter OTP" />
);
