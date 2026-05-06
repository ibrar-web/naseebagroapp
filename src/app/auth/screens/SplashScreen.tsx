import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { Colors as C } from '../../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SplashScreen = ({ navigation }: Props) => {
  useEffect(() => {
    const t = setTimeout(() => navigation.replace('Welcome'), 2400);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.green900} />
      <View style={styles.orb1} />
      <View style={styles.orb2} />
      <Text style={styles.emoji}>🌾</Text>
      <Text style={styles.title}>naseeb</Text>
      <Text style={styles.subtitle}>AGRI MARKET</Text>
      <Text style={styles.tagline}>Pakistan's Trusted Commodity Marketplace</Text>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.green900,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  orb1: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: C.green700,
    opacity: 0.25,
  },
  orb2: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: C.orange500,
    opacity: 0.12,
  },
  emoji:    { fontSize: 72, marginBottom: 20 },
  title:    { fontSize: 40, fontWeight: '800', color: C.white, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, fontWeight: '700', color: C.gold, letterSpacing: 4, marginTop: 4 },
  tagline:  { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 16 },
});
