import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import SubHeader from '../components/SubHeader';

const LANGS    = ['English', 'اردو'];
const THEMES   = ['Light', 'Dark', 'System'];

const AppSettingsScreen = ({ navigation }: any) => {
  const [lang,  setLang]  = useState('English');
  const [theme, setTheme] = useState('Light');

  return (
    <View className="flex-1 bg-gray-50">
      <SubHeader title="App Settings" subtitle="Customize your experience" navigation={navigation} />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
                  showsVerticalScrollIndicator={false}>

        {/* Language */}
        <View>
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">Language</Text>
          <View className="bg-white rounded-2xl p-4"
                style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
            <View className="flex-row gap-3">
              {LANGS.map(l => (
                <TouchableOpacity
                  key={l}
                  onPress={() => setLang(l)}
                  className={`flex-1 py-3 rounded-xl items-center border ${lang === l ? 'bg-green-700 border-green-700' : 'bg-gray-50 border-gray-200'}`}
                  activeOpacity={0.8}
                >
                  <Text className={`text-sm font-bold ${lang === l ? 'text-white' : 'text-gray-600'}`}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Theme */}
        <View>
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">Theme</Text>
          <View className="bg-white rounded-2xl p-4"
                style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
            <View className="flex-row gap-3">
              {THEMES.map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTheme(t)}
                  className={`flex-1 py-3 rounded-xl items-center border ${theme === t ? 'bg-green-700 border-green-700' : 'bg-gray-50 border-gray-200'}`}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 18 }}>{t === 'Light' ? '☀️' : t === 'Dark' ? '🌙' : '⚙️'}</Text>
                  <Text className={`text-xs font-semibold mt-1 ${theme === t ? 'text-white' : 'text-gray-600'}`}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Data & Storage */}
        <View>
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">Data & Storage</Text>
          <View className="bg-white rounded-2xl overflow-hidden"
                style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
            {[
              { icon: '📶', label: 'Use Mobile Data',    sub: 'Allow app to use cellular data' },
              { icon: '🗑️', label: 'Clear Cache',        sub: 'Free up storage space'          },
              { icon: '📦', label: 'App Version',        sub: 'Naseeb Agri Market v1.0.0'      },
            ].map((item, idx, arr) => (
              <TouchableOpacity
                key={item.label}
                className={`flex-row items-center px-4 py-4 ${idx < arr.length - 1 ? 'border-b border-gray-100' : ''}`}
                activeOpacity={0.7}
              >
                <View className="w-10 h-10 rounded-xl bg-green-50 items-center justify-center mr-3">
                  <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 text-sm font-semibold">{item.label}</Text>
                  <Text className="text-gray-400 text-xs mt-0.5">{item.sub}</Text>
                </View>
                <Text className="text-gray-300 text-xl">›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AppSettingsScreen;
