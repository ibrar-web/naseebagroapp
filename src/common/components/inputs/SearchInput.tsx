import React from 'react';
import { TextField } from './TextField';

export const SearchInput = ({ value, onChangeText }: { value: string; onChangeText: (v: string) => void }) => {
  return <TextField placeholder="Search commodities" value={value} onChangeText={onChangeText} />;
};
