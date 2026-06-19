import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { AppIcon } from '../../../assets/icons';
import type { AppIconName } from '../../../assets/icons';
import { MockStatusBar } from '../../components';

const CONTACT_OPTIONS: {
  key: string;
  label: string;
  sub: string;
  bgColor: string;
  iconColor: string;
  icon: AppIconName;
  action: () => void;
}[] = [
  {
    key: 'call',
    label: 'Call Us',
    sub: '+92 300 NASEEB (627332)',
    bgColor: '#F2FBF5',
    iconColor: '#217A3C',
    icon: 'contactPhone',
    action: () => Linking.openURL('tel:+923006273320'),
  },
  {
    key: 'email',
    label: 'Email Support',
    sub: 'support@naseeb.pk',
    bgColor: '#EEF6FF',
    iconColor: '#3B82F6',
    icon: 'contactEmail',
    action: () => Linking.openURL('mailto:support@naseeb.pk'),
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    sub: '+92 312 0000000',
    bgColor: '#E8FFF0',
    iconColor: '#25D366',
    icon: 'contactWhatsapp',
    action: () => Linking.openURL('whatsapp://send?phone=923120000000'),
  },
  {
    key: 'ticket',
    label: 'Submit a Ticket',
    sub: 'We reply within 4 hours',
    bgColor: '#EDE9FE',
    iconColor: '#7C3AED',
    icon: 'document',
    action: () =>
      Alert.alert(
        'Submit a Ticket',
        'Please email us at support@naseeb.pk with details of your issue.',
      ),
  },
];

const SupportScreen = ({ navigation }: any) => {
  return (
    <View style={s.container}>
      {/* Header */}
      <MockStatusBar />
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
          activeOpacity={0.7}
        >
          <AppIcon name="chevronRight" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Contact Support</Text>
        <View style={s.headerSpacer} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero banner */}
        <View style={s.hero}>
          <Text style={s.heroEmoji}>🎧</Text>
          <Text style={s.heroTitle}>Naseeb Support Team</Text>
          <Text style={s.heroSub}>Available Mon–Sat, 9 AM – 6 PM</Text>
        </View>

        {/* Contact option rows */}
        {CONTACT_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.key}
            style={s.optionRow}
            onPress={opt.action}
            activeOpacity={0.8}
          >
            <View style={[s.optionIconBox, { backgroundColor: opt.bgColor }]}>
              <AppIcon name={opt.icon} size={20} color={opt.iconColor} />
            </View>
            <View style={s.optionText}>
              <Text style={s.optionLabel}>{opt.label}</Text>
              <Text style={s.optionSub}>{opt.sub}</Text>
            </View>
            <AppIcon name="chevronRight" size={16} color="#D1D5DB" />
          </TouchableOpacity>
        ))}

        {/* FAQ notice */}
        <View style={s.faqCard}>
          <Text style={s.faqTitle}>FAQs & Help Centre</Text>
          <Text style={s.faqBody}>
            Browse common questions about listing, offers, payments, and more.
          </Text>
        </View>

        <View style={s.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    padding: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '180deg' }],
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  headerSpacer: { width: 30 },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 48 },

  hero: {
    backgroundColor: '#145228',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  heroEmoji: { fontSize: 32, marginBottom: 8 },
  heroTitle: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4 },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  optionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  optionText: { flex: 1 },
  optionLabel: { fontSize: 14, fontWeight: '700', color: '#111827' },
  optionSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },

  faqCard: {
    backgroundColor: '#FFFDE6',
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
  },
  faqTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  faqBody: { fontSize: 12, color: '#92400E', lineHeight: 18 },

  bottomSpacer: { height: 40 },
});

export default SupportScreen;
