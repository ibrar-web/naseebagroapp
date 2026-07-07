import React from 'react';
import { TextInput, type TextInputProps } from 'react-native';

interface Props extends Omit<TextInputProps, 'keyboardType' | 'onChangeText'> {
  value: string;
  onChangeText: (val: string) => void;
  /** Allow a single decimal point. Defaults to false (integers only). */
  decimal?: boolean;
}

/**
 * Drop-in TextInput replacement that enforces a numeric keyboard and strips
 * any non-numeric characters from input. Pass decimal={true} to also allow
 * a single decimal point (e.g. weight in tons).
 */
export const NumberInput = ({ decimal = false, onChangeText, ...rest }: Props) => {
  const handleChange = (text: string) => {
    const cleaned = decimal
      ? text.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
      : text.replace(/[^0-9]/g, '');
    onChangeText(cleaned);
  };

  return (
    <TextInput
      {...rest}
      keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
      onChangeText={handleChange}
    />
  );
};
