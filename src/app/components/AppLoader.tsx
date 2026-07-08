import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

type AppLoaderProps = {
  visible?: boolean;
  message?: string;
  overlay?: boolean;
};

const AppLoader = ({
  visible = true,
  message,
  overlay = false,
}: AppLoaderProps) => {
  if (!visible) {
    return null;
  }

  const content = (
    <View style={styles.card}>
      <ActivityIndicator size="large" color="#1A6B34" />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );

  if (overlay) {
    return <View style={styles.overlay}>{content}</View>;
  }

  return <View style={styles.inline}>{content}</View>;
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.20)',
    paddingHorizontal: 32,
  },
  inline: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  message: {
    marginTop: 12,
    textAlign: 'center',
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AppLoader;
