import React from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';

export const TextField = (props: TextInputProps) => {
  return <TextInput {...props} style={[styles.input, props.style]} placeholderTextColor="#8a8a8a" />;
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#d7d7d7',
    borderRadius: 10,
    padding: 12,
  },
});
