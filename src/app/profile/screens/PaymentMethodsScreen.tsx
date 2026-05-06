import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import SubHeader from '../components/SubHeader';

const ACCOUNTS = [
  { id: '1', bank: 'HBL',        account: '•••• •••• 4821', iban: 'PK36HBL0000004821234500', primary: true  },
  { id: '2', bank: 'MCB',        account: '•••• •••• 7703', iban: 'PK39MCB0000007703219000', primary: false },
  { id: '3', bank: 'Bank Alfalah',account: '•••• •••• 1192', iban: 'PK03ALFH0013001192000000', primary: false },
];

const BANK_COLORS: Record<string, string> = {
  HBL: '#006B3C', MCB: '#C41E3A', 'Bank Alfalah': '#007DC5',
};

const PaymentMethodsScreen = ({ navigation }: any) => {
  const [accounts, setAccounts] = useState(ACCOUNTS);

  const setPrimary = (id: string) =>
    setAccounts(prev => prev.map(a => ({ ...a, primary: a.id === id })));

  return (
    <View className="flex-1 bg-gray-50">
      <SubHeader title="Payment Methods" subtitle="Manage bank accounts & wallets" navigation={navigation} />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
                  showsVerticalScrollIndicator={false}>

        {accounts.map(acc => (
          <View key={acc.id} className="bg-white rounded-2xl overflow-hidden"
                style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
            {/* Bank header strip */}
            <View className="flex-row items-center justify-between px-4 py-3"
                  style={{ backgroundColor: (BANK_COLORS[acc.bank] ?? '#1A6B34') + '15' }}>
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl items-center justify-center"
                      style={{ backgroundColor: BANK_COLORS[acc.bank] ?? '#1A6B34' }}>
                  <Text className="text-white text-xs font-extrabold">{acc.bank.slice(0, 3)}</Text>
                </View>
                <View>
                  <Text className="text-gray-900 text-sm font-bold">{acc.bank}</Text>
                  <Text className="text-gray-500 text-xs">{acc.account}</Text>
                </View>
              </View>
              {acc.primary && (
                <View className="px-2.5 py-1 bg-green-100 rounded-full">
                  <Text className="text-green-700 text-xs font-bold">Primary</Text>
                </View>
              )}
            </View>

            {/* IBAN */}
            <View className="px-4 py-3 border-t border-gray-50">
              <Text className="text-xs text-gray-400 mb-0.5">IBAN</Text>
              <Text className="text-gray-700 text-xs font-mono">{acc.iban}</Text>
            </View>

            {/* Actions */}
            <View className="flex-row border-t border-gray-100">
              {!acc.primary && (
                <TouchableOpacity onPress={() => setPrimary(acc.id)}
                                  className="flex-1 py-3 items-center border-r border-gray-100"
                                  activeOpacity={0.7}>
                  <Text className="text-green-700 text-sm font-semibold">Set Primary</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity className="flex-1 py-3 items-center" activeOpacity={0.7}>
                <Text className="text-red-400 text-sm font-semibold">Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Add account */}
        <TouchableOpacity
          className="bg-green-700 rounded-2xl py-4 items-center mt-2 flex-row justify-center gap-2"
          style={{ shadowColor: '#1A6B34', shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 }}
          activeOpacity={0.88}
        >
          <Text className="text-white text-xl">+</Text>
          <Text className="text-white text-base font-bold">Add Bank Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default PaymentMethodsScreen;
