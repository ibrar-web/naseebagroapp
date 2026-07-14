import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';

const AuthStatusBar = () => (
  <>
    <StatusBar
      barStyle="light-content"
      backgroundColor="#145228"
      translucent={false}
    />
    <View style={styles.bar}></View>
  </>
);

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 6,
  },
  time: { fontSize: 12, fontWeight: '700', color: '#fff' },
  island: {
    width: 80,
    height: 22,
    backgroundColor: '#000',
    borderRadius: 20,
  },
  icons: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  signal: { fontSize: 10, color: '#fff' },
  icon: { fontSize: 10 },
});

export default AuthStatusBar;
