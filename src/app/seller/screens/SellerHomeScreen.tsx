import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors as C, Spacing, Radius, Shadow } from '../../../constants/theme';

const SellerHomeScreen = ({ navigation }: any) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.title}>Seller Dashboard</Text>
      <Text style={styles.sub}>Manage your listings and orders</Text>
    </View>
    <ScrollView contentContainerStyle={styles.body}>
      <View style={styles.statsRow}>
        {[
          { label: 'Active Listings', val: '5',     color: C.green600,  bg: C.green50   },
          { label: 'Pending Orders',  val: '4',     color: C.blue500,   bg: '#EEF6FF'   },
          { label: 'Earnings',        val: '₨890K', color: C.orange600, bg: C.orange100 },
        ].map(s => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: s.bg }]}>
            <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('Post')} activeOpacity={0.88}>
        <Text style={styles.createBtnText}>+ Create New Listing</Text>
      </TouchableOpacity>
    </ScrollView>
  </View>
);

export default SellerHomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.gray50 },
  header: {
    backgroundColor: C.green900, paddingTop: 54, paddingBottom: 24,
    paddingHorizontal: Spacing.base,
  },
  title:    { fontSize: 24, fontWeight: '800', color: C.white },
  sub:      { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 4 },
  body:     { padding: Spacing.base, gap: 16 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, borderRadius: Radius.lg, padding: 12, alignItems: 'center', gap: 4 },
  statVal:  { fontSize: 18, fontWeight: '800' },
  statLabel:{ fontSize: 10, color: C.gray500, fontWeight: '500', textAlign: 'center' },
  createBtn: {
    backgroundColor: C.green700, borderRadius: Radius.lg,
    paddingVertical: 16, alignItems: 'center', ...Shadow.md,
  },
  createBtnText: { fontSize: 15, fontWeight: '700', color: C.white },
});
