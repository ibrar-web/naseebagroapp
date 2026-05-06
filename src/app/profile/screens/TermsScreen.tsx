import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import SubHeader from '../components/SubHeader';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: 'By creating an account and using Naseeb Agri Market, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use the platform.',
  },
  {
    title: '2. User Accounts',
    body: 'You must be at least 18 years of age and provide accurate information during registration. You are responsible for maintaining the confidentiality of your account credentials.',
  },
  {
    title: '3. Commodity Listings',
    body: 'All listings must represent actual, available stock. Fraudulent or misleading listings will result in immediate account suspension. Naseeb reserves the right to remove any listing without notice.',
  },
  {
    title: '4. Payment & Escrow',
    body: 'All payments are processed through our escrow system. Funds are held securely and released only upon confirmed delivery and inspection. Naseeb charges a 1% commission on completed deals.',
  },
  {
    title: '5. Dispute Resolution',
    body: 'Disputes must be raised within 48 hours of delivery. Our resolution team will mediate and may request supporting evidence. Decisions by Naseeb in dispute cases are final.',
  },
  {
    title: '6. Privacy Policy',
    body: 'We collect personal and business information to facilitate trading. We do not sell your data to third parties. Data is used solely for platform operations, fraud prevention, and service improvement.',
  },
  {
    title: '7. Limitation of Liability',
    body: 'Naseeb is a marketplace facilitator and is not liable for the quality, quantity, or delivery of commodities. Traders transact at their own risk after accepting these terms.',
  },
];

const TermsScreen = ({ navigation }: any) => (
  <View className="flex-1 bg-gray-50">
    <SubHeader title="Terms & Privacy" subtitle="Last updated January 2024" navigation={navigation} />

    <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}>

      {/* Header card */}
      <View className="bg-green-700 rounded-2xl p-5"
            style={{ shadowColor: '#1A6B34', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}>
        <Text style={{ fontSize: 32 }}>📄</Text>
        <Text className="text-white text-lg font-extrabold mt-2">Legal Documents</Text>
        <Text className="text-green-200 text-sm mt-1">
          Please read these terms carefully before using Naseeb Agri Market.
        </Text>
      </View>

      {/* Sections */}
      <View className="bg-white rounded-2xl overflow-hidden"
            style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
        {SECTIONS.map((s, idx) => (
          <View key={idx}
                className={`px-4 py-5 ${idx < SECTIONS.length - 1 ? 'border-b border-gray-100' : ''}`}>
            <Text className="text-gray-900 text-sm font-bold mb-2">{s.title}</Text>
            <Text className="text-gray-600 text-sm leading-5">{s.body}</Text>
          </View>
        ))}
      </View>

      {/* Accept button */}
      <TouchableOpacity
        className="bg-green-700 rounded-2xl py-4 items-center"
        style={{ shadowColor: '#1A6B34', shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 }}
        activeOpacity={0.88}
      >
        <Text className="text-white text-base font-bold">I Agree to Terms</Text>
      </TouchableOpacity>
    </ScrollView>
  </View>
);

export default TermsScreen;
