import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import { Colors as C, Spacing, Radius, Shadow } from '../../../constants/theme';
import { useAppSelector, useAppDispatch } from '../../../store';
import { logout } from '../../../store/slices/authSlice';

const MENU_ITEMS = [
  { group: 'Account',  items: [
    { icon: '👤', label: 'Personal Info',     sub: 'Name, phone, email'    },
    { icon: '🏢', label: 'Business Profile',  sub: 'NTN, trade name'       },
    { icon: '✅', label: 'Verification',      sub: 'Documents & KYC status'},
  ]},
  { group: 'Finance',  items: [
    { icon: '💳', label: 'Payment Methods',   sub: 'Bank accounts'         },
    { icon: '📜', label: 'Transaction History',sub: 'All payments'         },
  ]},
  { group: 'Settings', items: [
    { icon: '🔔', label: 'Notifications',     sub: 'Alerts & preferences'  },
    { icon: '⚙️', label: 'App Settings',      sub: 'Language, theme'       },
  ]},
  { group: 'Support',  items: [
    { icon: '🆘', label: 'Help & Support',    sub: 'FAQs, contact us'      },
    { icon: '📄', label: 'Terms & Privacy',   sub: 'Legal documents'       },
  ]},
];

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const mode     = useAppSelector(s => s.app.mode);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.green900} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.orb} />
          <View style={styles.avatarWrap}>
            <Text style={{ fontSize: 36 }}>👤</Text>
          </View>
          <Text style={styles.userName}>Muhammad Asad</Text>
          <Text style={styles.userPhone}>+92 300 1234567</Text>
          <View style={styles.modeBadge}>
            <Text style={styles.modeBadgeText}>{mode === 'buyer' ? '🛒 Buyer' : '📦 Seller'}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Deals',    val: '12' },
            { label: 'Rating',   val: '4.8 ⭐' },
            { label: 'Verified', val: '✅ Yes' },
          ].map(s => (
            <View key={s.label} style={styles.statBox}>
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu groups */}
        {MENU_ITEMS.map(group => (
          <View key={group.group} style={styles.menuGroup}>
            <Text style={styles.menuGroupTitle}>{group.group}</Text>
            <View style={styles.menuCard}>
              {group.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.menuRow, idx < group.items.length - 1 && styles.menuRowBorder]}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuIcon}>
                    <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Text style={styles.menuSub}>{item.sub}</Text>
                  </View>
                  <Text style={styles.menuChevron}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => dispatch(logout())}
          activeOpacity={0.88}
        >
          <Text style={styles.logoutText}>🚪 Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Naseeb Agri Market v1.0.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.gray50 },

  header: {
    backgroundColor: C.green900, paddingTop: 54, paddingBottom: 28,
    alignItems: 'center', overflow: 'hidden',
  },
  orb: {
    position: 'absolute', top: -40, right: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: C.green700, opacity: 0.25,
  },
  avatarWrap: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: C.orange500, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.25)', marginBottom: 10,
  },
  userName:  { fontSize: 20, fontWeight: '800', color: C.white },
  userPhone: { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 4 },
  modeBadge: {
    marginTop: 10, paddingHorizontal: 14, paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  modeBadgeText: { fontSize: 13, fontWeight: '600', color: C.white },

  statsRow: {
    flexDirection: 'row', backgroundColor: C.white,
    borderBottomWidth: 1, borderBottomColor: C.gray100, ...Shadow.sm,
  },
  statBox:   { flex: 1, paddingVertical: 16, alignItems: 'center', borderRightWidth: 1, borderRightColor: C.gray100 },
  statVal:   { fontSize: 16, fontWeight: '800', color: C.gray900 },
  statLabel: { fontSize: 11, color: C.gray500, marginTop: 2 },

  menuGroup: { paddingHorizontal: Spacing.base, paddingTop: 20 },
  menuGroupTitle: { fontSize: 11, fontWeight: '700', color: C.gray400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  menuCard: { backgroundColor: C.white, borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.sm },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: C.gray100 },
  menuIcon: { width: 38, height: 38, borderRadius: Radius.md, backgroundColor: C.green50, alignItems: 'center', justifyContent: 'center' },
  menuLabel:   { fontSize: 14, fontWeight: '600', color: C.gray900 },
  menuSub:     { fontSize: 11, color: C.gray400, marginTop: 1 },
  menuChevron: { fontSize: 20, color: C.gray300 },

  logoutBtn: {
    marginHorizontal: Spacing.base, marginTop: 20,
    backgroundColor: C.white, borderRadius: Radius.xl,
    paddingVertical: 16, alignItems: 'center',
    borderWidth: 1, borderColor: C.red500 + '40',
    ...Shadow.sm,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: C.red500 },

  version: { textAlign: 'center', fontSize: 11, color: C.gray300, marginTop: 16 },
});
