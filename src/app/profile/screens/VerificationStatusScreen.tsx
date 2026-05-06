import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import SubHeader from '../components/SubHeader';

const DOCS = [
  { icon: '🪪', label: 'CNIC / National ID',       status: 'Verified',  date: 'Verified 12 Jan 2024'  },
  { icon: '🏢', label: 'Business Registration',    status: 'Verified',  date: 'Verified 15 Jan 2024'  },
  { icon: '🏦', label: 'Bank Statement',            status: 'Verified',  date: 'Verified 18 Jan 2024'  },
  { icon: '📋', label: 'Trade License',             status: 'Pending',   date: 'Under review'          },
  { icon: '📸', label: 'Live Photo',                status: 'Verified',  date: 'Verified 12 Jan 2024'  },
];

const statusStyle: Record<string, { bg: string; text: string; dot: string }> = {
  Verified: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  Pending:  { bg: 'bg-orange-100', text: 'text-orange-500', dot: 'bg-orange-500' },
  Rejected: { bg: 'bg-red-100',   text: 'text-red-500',   dot: 'bg-red-500'   },
};

const VerificationStatusScreen = ({ navigation }: any) => (
  <View className="flex-1 bg-gray-50">
    <SubHeader title="Verification Status" subtitle="Your KYC documents" navigation={navigation} />

    <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}>

      {/* Overall status banner */}
      <View className="bg-green-700 rounded-2xl p-5 flex-row items-center gap-4"
            style={{ shadowColor: '#1A6B34', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}>
        <Text style={{ fontSize: 40 }}>✅</Text>
        <View>
          <Text className="text-white text-lg font-extrabold">KYC Approved</Text>
          <Text className="text-green-200 text-sm mt-0.5">Your account is fully verified</Text>
          <Text className="text-green-300 text-xs mt-1">Since January 2024</Text>
        </View>
      </View>

      {/* Documents */}
      <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Documents</Text>

      <View className="bg-white rounded-2xl overflow-hidden"
            style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
        {DOCS.map((doc, idx) => {
          const s = statusStyle[doc.status] ?? statusStyle.Pending;
          return (
            <View key={doc.label}
                  className={`flex-row items-center px-4 py-4 ${idx < DOCS.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <View className="w-10 h-10 rounded-xl bg-green-50 items-center justify-center mr-3">
                <Text style={{ fontSize: 18 }}>{doc.icon}</Text>
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

      {/* Upload missing */}
      <TouchableOpacity
        className="border-2 border-dashed border-green-300 rounded-2xl py-5 items-center gap-2 bg-green-50"
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 28 }}>📤</Text>
        <Text className="text-green-700 text-sm font-bold">Upload Missing Documents</Text>
        <Text className="text-gray-400 text-xs">Tap to add Trade License</Text>
      </TouchableOpacity>
    </ScrollView>
  </View>
);

export default VerificationStatusScreen;
