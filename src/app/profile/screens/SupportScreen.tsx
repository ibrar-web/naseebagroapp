import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import SubHeader from '../components/SubHeader';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07,
  shadowRadius: 12,
  elevation: 3,
};

const FAQS = [
  { q: 'How do I post a demand?',     a: 'Go to the Post tab, select your commodity, enter quantity, price and location, then tap "Post Demand".' },
  { q: 'How are payments handled?',   a: 'Payments are staged: 30% advance, 40% on dispatch, and 30% on delivery. Naseeb holds funds in escrow until both parties confirm.' },
  { q: 'How long does KYC take?',     a: 'KYC verification typically takes 1-2 business days after submitting all required documents.' },
  { q: 'Can I cancel a deal?',        a: 'Deals can be cancelled before the "Deal Agreed" stage. After that, cancellation is subject to review and may incur a penalty.' },
  { q: 'How do I track my shipment?', a: 'Go to your deal in the Deals tab and tap "Track Shipment" once the deal reaches the In Transit stage.' },
];

const CONTACT = [
  { icon: '💬', label: 'WhatsApp', sub: '+92 311 123 4567', color: '#25D366' },
  { icon: '📧', label: 'Email',    sub: 'support@naseeb.pk', color: '#1A6B34' },
  { icon: '📞', label: 'Helpline', sub: '0800-12345',        color: '#3B82F6' },
];

const SupportScreen = ({ navigation }: any) => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <View className="flex-1 bg-gray-50">
      <SubHeader title="Help & Support" subtitle="We're here to help" navigation={navigation} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-3">Contact Us</Text>

        <View className="flex-row gap-3 mb-4">
          {CONTACT.map(c => (
            <TouchableOpacity
              key={c.label}
              className="flex-1 bg-white rounded-2xl py-4 items-center gap-2"
              style={CARD_SHADOW}
              activeOpacity={0.85}
            >
              <Text style={{ fontSize: 26 }}>{c.icon}</Text>
              <Text className="text-gray-900 text-xs font-bold">{c.label}</Text>
              <Text className="text-gray-400 text-xs text-center">{c.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-3">
          Frequently Asked Questions
        </Text>

        <View className="bg-white rounded-2xl overflow-hidden" style={CARD_SHADOW}>
          {FAQS.map((faq, idx) => (
            <View key={idx} className={idx < FAQS.length - 1 ? 'border-b border-gray-100' : ''}>
              <TouchableOpacity
                onPress={() => setOpen(open === idx ? null : idx)}
                className="flex-row items-center px-4 py-4 gap-3"
                activeOpacity={0.7}
              >
                <View className="w-8 h-8 rounded-lg bg-green-50 items-center justify-center">
                  <Text className="text-green-700 text-sm font-extrabold">Q</Text>
                </View>
                <Text className="flex-1 text-gray-800 text-sm font-semibold">{faq.q}</Text>
                <Text className="text-gray-400 text-base font-bold">{open === idx ? '∧' : '›'}</Text>
              </TouchableOpacity>
              {open === idx && (
                <View className="px-4 pb-4" style={{ paddingLeft: 60 }}>
                  <Text className="text-gray-600 text-sm leading-5">{faq.a}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default SupportScreen;
