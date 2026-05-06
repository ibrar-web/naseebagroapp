import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'DealDetail'>;

const DEALS: Record<string, any> = {
  'DEL-001': {
    id: 'DEL-001', commodity: 'Premium Wheat', emoji: '🌾',
    qty: '200 Tons', rate: '₨3,850/40kg', amount: '₨19.25L',
    buyer: 'Rafiq Traders', seller: 'Asad Traders',
    location: 'Lahore → Karachi', stage: 8,
    payments: [
      { label: 'Advance (30%)', val: '₨5.77L', status: 'Paid'    },
      { label: 'On Dispatch',   val: '₨7.7L',  status: 'Pending' },
      { label: 'On Delivery',   val: '₨5.78L', status: 'Pending' },
    ],
  },
  'DEL-002': {
    id: 'DEL-002', commodity: 'IRRI-6 Rice', emoji: '🍚',
    qty: '80 Tons', rate: '₨4,200/40kg', amount: '₨8.4L',
    buyer: 'City Grocers', seller: 'Punjab Agri Co',
    location: 'Sheikhupura → Lahore', stage: 6,
    payments: [
      { label: 'Advance (30%)', val: '₨2.52L', status: 'Paid'    },
      { label: 'On Dispatch',   val: '₨3.36L', status: 'Pending' },
      { label: 'On Delivery',   val: '₨2.52L', status: 'Pending' },
    ],
  },
};

const STAGE_LABELS = [
  'Demand Placed', 'Admin Review', 'Offer Sent', 'Negotiation',
  'Deal Agreed', 'Payment Init.', 'Payment Done',
  'Goods Ready', 'In Transit', 'Delivered', 'Inspection',
  'Payment Released', 'Completed',
];

const stageColor = (stage: number) =>
  stage < 5 ? '#F59E0B' : stage < 8 ? '#3B82F6' : stage < 11 ? '#8B5CF6' : '#10B981';

const DealDetailScreen = ({ navigation, route }: Props) => {
  const { dealId } = route.params;
  const deal = DEALS[dealId] ?? DEALS['DEL-001'];
  const pct   = Math.round((deal.stage / 12) * 100);
  const color = stageColor(deal.stage);

  return (
    <View className="flex-1 bg-gray-50">

      {/* Header */}
      <View className="bg-green-800 pt-12 pb-6 px-4 overflow-hidden">
        <View className="absolute rounded-full bg-green-700 opacity-25"
              style={{ width: 160, height: 160, top: -40, right: -40 }} />

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="items-center justify-center mb-4"
          style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}
        >
          <Text className="text-white text-lg">←</Text>
        </TouchableOpacity>

        <Text className="text-xs font-bold" style={{ color: '#E8A838', letterSpacing: 1 }}>{deal.id}</Text>
        <Text className="text-white text-2xl font-extrabold mt-1">{deal.commodity}</Text>
        <Text className="text-orange-400 text-base font-bold mt-1">{deal.amount}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
                  showsVerticalScrollIndicator={false}>

        {/* Summary card */}
        <View className="bg-white rounded-2xl p-4"
              style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
          <View className="flex-row gap-3.5 mb-3.5">
            <View className="bg-green-50 rounded-xl items-center justify-center"
                  style={{ width: 64, height: 64 }}>
              <Text style={{ fontSize: 32 }}>{deal.emoji}</Text>
            </View>
            <View className="flex-1">
              {[
                { label: 'Quantity', val: deal.qty      },
                { label: 'Rate',     val: deal.rate     },
                { label: 'Location', val: deal.location },
              ].map(r => (
                <View key={r.label} className="flex-row justify-between py-1">
                  <Text className="text-gray-400 text-xs">{r.label}</Text>
                  <Text className="text-gray-800 text-xs font-bold">{r.val}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
            <View className="gap-0.5">
              <Text className="text-gray-400 text-xs">🛒 Buyer</Text>
              <Text className="text-gray-900 text-sm font-bold">{deal.buyer}</Text>
            </View>
            <Text className="text-gray-300 text-xl">⇄</Text>
            <View className="items-end gap-0.5">
              <Text className="text-gray-400 text-xs">📦 Seller</Text>
              <Text className="text-gray-900 text-sm font-bold">{deal.seller}</Text>
            </View>
          </View>
        </View>

        {/* Pipeline card */}
        <View className="bg-white rounded-2xl p-4"
              style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-900 text-sm font-extrabold">Deal Progress</Text>
            <Text className="text-xs font-bold" style={{ color }}>Stage {deal.stage}/12</Text>
          </View>

          <View className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1.5">
            <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
          </View>
          <Text className="text-xs font-bold mb-3.5" style={{ color }}>{pct}% complete</Text>

          <View className="gap-2">
            {STAGE_LABELS.map((s, idx) => {
              const dotColor = idx < deal.stage ? color : idx === deal.stage ? color : '#E5E7EB';
              return (
                <View key={s} className="flex-row items-center gap-2.5">
                  <View className="w-5 h-5 rounded-full items-center justify-center"
                        style={{ backgroundColor: dotColor }}>
                    {idx < deal.stage && <Text className="text-white" style={{ fontSize: 10 }}>✓</Text>}
                    {idx === deal.stage && <View className="w-2 h-2 rounded-full bg-white" />}
                  </View>
                  <Text
                    className="text-xs"
                    style={{
                      color: idx === deal.stage ? color : idx < deal.stage ? '#9CA3AF' : '#374151',
                      fontWeight: idx === deal.stage ? '700' : '400',
                    }}
                  >
                    {s}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Payments card */}
        <View className="bg-white rounded-2xl p-4"
              style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
          <Text className="text-gray-900 text-sm font-extrabold mb-1">Payment Schedule</Text>
          {deal.payments.map((p: any) => (
            <View key={p.label} className="flex-row justify-between items-start py-2.5 border-b border-gray-100">
              <Text className="text-gray-700 text-sm font-semibold">{p.label}</Text>
              <View className="items-end">
                <Text className="text-gray-900 text-sm font-extrabold">{p.val}</Text>
                <View className={`mt-1 px-2 py-0.5 rounded-full ${p.status === 'Paid' ? 'bg-green-50' : 'bg-amber-50'}`}>
                  <Text className={`text-xs font-bold ${p.status === 'Paid' ? 'text-green-700' : 'text-amber-600'}`}>
                    {p.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Actions card */}
        <View className="bg-white rounded-2xl p-4"
              style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
          <Text className="text-gray-900 text-sm font-extrabold mb-3">Actions</Text>
          <View className="flex-row gap-2.5">
            <TouchableOpacity
              className="flex-1 py-3 rounded-xl items-center border"
              style={{ borderColor: '#1A6B3499' }}
              activeOpacity={0.85}
            >
              <Text className="text-green-700 text-sm font-bold">💬 Negotiate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 rounded-xl items-center border"
              style={{ borderColor: '#EF444499' }}
              activeOpacity={0.85}
            >
              <Text className="text-red-500 text-sm font-bold">📋 Dispute</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default DealDetailScreen;
