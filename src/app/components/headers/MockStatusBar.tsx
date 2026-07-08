import React from 'react';
import { Platform, StatusBar, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  backgroundColor?: string;
  textColor?: string;
  absolute?: boolean;
}

const MockStatusBar = ({
  backgroundColor = '#FFFFFF',
  absolute = false,
}: Props) => {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'ios'
    ? (insets.top > 0 ? insets.top : 44)
    : (insets.top || StatusBar.currentHeight || 0);

  return (
    <View
      pointerEvents="none"
      style={[
        styles.bar,
        { backgroundColor, paddingTop: topPad },
        absolute ? styles.posAbsolute : null,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 22,
    paddingBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  posAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
});

export default MockStatusBar;
