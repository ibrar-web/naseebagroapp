import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import SubHeader from '../components/SubHeader';
import { AppIcon } from '../../../assets/icons';
import type { AppIconName } from '../../../assets/icons';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07,
  shadowRadius: 12,
  elevation: 3,
};

const DOCS = [
  { icon: 'verificationId' as AppIconName, label: 'CNIC / National ID',    status: 'Verified', date: 'Verified 12 Jan 2024' },
  { icon: 'verificationBusiness' as AppIconName, label: 'Business Registration', status: 'Verified', date: 'Verified 15 Jan 2024' },
  { icon: 'verificationBank' as AppIconName, label: 'Bank Statement',         status: 'Verified', date: 'Verified 18 Jan 2024' },
  { icon: 'verificationLicense' as AppIconName, label: 'Trade License',          status: 'Pending',  date: 'Under review'         },
  { icon: 'verificationCamera' as AppIconName, label: 'Live Photo',             status: 'Verified', date: 'Verified 12 Jan 2024' },
];

const STATUS: Record<string, { bg: string; text: string; dot: string }> = {
  Verified: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  Pending:  { bg: 'bg-orange-100', text: 'text-orange-500', dot: 'bg-orange-400' },
  Rejected: { bg: 'bg-red-100',   text: 'text-red-500',   dot: 'bg-red-500'   },
};

const VerificationStatusScreen = ({ navigation }: any) => (
  <View className="flex-1 bg-gray-50">
    <SubHeader title="Verification Status" subtitle="Your KYC documents" navigation={navigation} />

    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      {/* KYC approved banner */}
      <View
        className="bg-green-700 rounded-2xl p-5 flex-row items-center gap-4 mb-4"
        style={{ shadowColor: '#1A6B34', shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 }}
      >
        <AppIcon name="approved" size={40} color="#FFFFFF" />
        <View>
          <Text className="text-white text-lg font-extrabold">KYC Approved</Text>
          <Text className="text-green-200 text-sm mt-0.5">Your account is fully verified</Text>
          <Text className="text-green-300 text-xs mt-1">Since January 2024</Text>
        </View>
      </View>

      <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-3">Documents</Text>

      <View className="bg-white rounded-2xl overflow-hidden mb-4" style={CARD_SHADOW}>
        {DOCS.map((doc, idx) => {
          const s = STATUS[doc.status] ?? STATUS.Pending;
          return (
            <View
              key={doc.label}
              className={`flex-row items-center px-4 py-4 ${idx < DOCS.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <View className="w-10 h-10 rounded-xl bg-green-50 items-center justify-center mr-3">
                <AppIcon name={doc.icon} size={18} color="#1A6B34" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 text-sm font-semibold">{doc.label}</Text>
                <Text className="text-gray-400 text-xs mt-0.5">{doc.date}</Text>
              </View>
              <View className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${s.bg}`}>
                <View className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                <Text className={`text-xs font-bold ${s.text}`}>{doc.status}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <TouchableOpacity
        className="border-2 border-dashed border-green-300 rounded-2xl py-5 items-center gap-2 bg-green-50"
        activeOpacity={0.7}
      >
        <AppIcon name="upload" size={28} color="#1A6B34" />
        <Text className="text-green-700 text-sm font-bold">Upload Missing Documents</Text>
        <Text className="text-gray-400 text-xs">Tap to add Trade License</Text>
      </TouchableOpacity>
    </ScrollView>
  </View>
);

export default VerificationStatusScreen;
