import React from 'react';
import {
  View, Text, StyleSheet, StatusBar, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { Colors as C, Spacing, Radius, Shadow } from '../../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const WelcomeScreen = ({ navigation }: Props) => (
  <View style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor={C.green900} />

    {/* Hero */}
    <View style={styles.hero}>
      <View style={styles.orb1} />
      <View style={styles.orb2} />
      <Text style={styles.heroEmoji}>🌾</Text>
      <Text style={styles.heroTitle}>naseeb</Text>
      <Text style={styles.heroSub}>AGRI MARKET</Text>
      <Text style={styles.heroDesc}>
        Connect buyers and sellers across Pakistan's{'\n'}agricultural commodity markets
      </Text>
    </View>

    {/* Feature pills */}
    <View style={styles.featureRow}>
      {['🔒 Verified Traders', '📊 Live Rates', '🤝 Secure Deals'].map(f => (
        <View key={f} style={styles.featurePill}>
          <Text style={styles.featurePillText}>{f}</Text>
        </View>
      ))}
    </View>

    {/* CTA card */}
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Phone')}
        style={styles.btnPrimary}
        activeOpacity={0.88}
      >
        <Text style={styles.btnPrimaryText}>Create Account</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('Phone')}
        style={styles.btnOutline}
        activeOpacity={0.88}
      >
        <Text style={styles.btnOutlineText}>Log In</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('MainTabs')}
        style={styles.btnGhost}
        activeOpacity={0.7}
      >
        <Text style={styles.btnGhostText}>Browse as Guest</Text>
      </TouchableOpacity>

      <Text style={styles.terms}>
        By continuing you agree to our{' '}
        <Text style={{ color: C.green600 }}>Terms of Service</Text> &{' '}
        <Text style={{ color: C.green600 }}>Privacy Policy</Text>
      </Text>
    </View>
  </View>
);

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.gray50 },

  hero: {
    backgroundColor: C.green900,
    paddingTop: 64,
    paddingBottom: 40,
    alignItems: 'center',
    overflow: 'hidden',
    flex: 1,
    justifyContent: 'center',
  },
  orb1: {
    position: 'absolute', top: -50, right: -50,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: C.green700, opacity: 0.25,
  },
  orb2: {
    position: 'absolute', bottom: -30, left: -30,
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: C.orange500, opacity: 0.12,
  },
  heroEmoji: { fontSize: 64, marginBottom: 12 },
  heroTitle: { fontSize: 38, fontWeight: '800', color: C.white, letterSpacing: -0.5 },
  heroSub:   { fontSize: 11, fontWeight: '700', color: C.gold, letterSpacing: 4, marginTop: 4 },
  heroDesc:  { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 14, textAlign: 'center', lineHeight: 20 },

  featureRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.base,
    paddingVertical: 14,
    backgroundColor: C.green800,
    justifyContent: 'center',
  },
  featurePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  featurePillText: { fontSize: 11, color: C.white, fontWeight: '500' },

  card: {
    backgroundColor: C.white,
    padding: Spacing.xl,
    paddingBottom: 36,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: 12,
    ...Shadow.lg,
  },
  btnPrimary: {
    backgroundColor: C.green700,
    paddingVertical: 15,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  btnPrimaryText: { fontSize: 15, fontWeight: '700', color: C.white },

  btnOutline: {
    paddingVertical: 15,
    borderRadius: Radius.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.green700,
  },
  btnOutlineText: { fontSize: 15, fontWeight: '700', color: C.green700 },

  btnGhost: { paddingVertical: 12, alignItems: 'center' },
  btnGhostText: { fontSize: 14, color: C.gray500, fontWeight: '500' },

  terms: { fontSize: 11, color: C.gray400, textAlign: 'center', lineHeight: 17, marginTop: 4 },
});
