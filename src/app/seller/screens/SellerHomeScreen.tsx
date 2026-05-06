import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors as C, Spacing, Radius, Shadow } from '../../../constants/theme';
import { useTranslation } from '../../../localization';

const SellerHomeScreen = ({ navigation }: any) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('seller.dashboard')}</Text>
        <Text style={styles.sub}>{t('seller.dashboardSub')}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.statsRow}>
          {[
            {
              label: t('seller.activeListings'),
              val: '5',
              color: C.green600,
              bg: C.green50,
            },
            {
              label: t('seller.pendingOrders'),
              val: '4',
              color: C.blue500,
              bg: '#EEF6FF',
            },
            {
              label: t('seller.earnings'),
              val: '₨890K',
              color: C.orange600,
              bg: C.orange100,
            },
          ].map(s => (
            <View
              key={s.label}
              style={[styles.statCard, { backgroundColor: s.bg }]}
            >
              <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => navigation.navigate('Post')}
          activeOpacity={0.88}
        >
          <Text style={styles.createBtnText}>{t('seller.createListing')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default SellerHomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.gray50 },
  header: {
    backgroundColor: C.green900,
    paddingTop: 54,
    paddingBottom: 24,
    paddingHorizontal: Spacing.base,
  },
  title: { fontSize: 24, fontWeight: '800', color: C.white },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 4 },
  body: { padding: Spacing.base, gap: 16 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  statVal: { fontSize: 18, fontWeight: '800' },
  statLabel: {
    fontSize: 10,
    color: C.gray500,
    fontWeight: '500',
    textAlign: 'center',
  },
  createBtn: {
    backgroundColor: C.green700,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    ...Shadow.md,
  },
  createBtnText: { fontSize: 15, fontWeight: '700', color: C.white },
});
