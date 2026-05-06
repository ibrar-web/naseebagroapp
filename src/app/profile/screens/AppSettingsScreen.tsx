import React, { useState } from 'react';
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

const LANGS  = ['English', 'اردو'];
const THEMES: { label: string; icon: AppIconName }[] = [
  { label: 'Light', icon: 'themeLight' },
  { label: 'Dark', icon: 'themeDark' },
  { label: 'System', icon: 'themeSystem' },
];

const AppSettingsScreen = ({ navigation }: any) => {
  const [lang,  setLang]  = useState('English');
  const [theme, setTheme] = useState('Light');

  return (
    <View className="flex-1 bg-gray-50">
      <SubHeader title="App Settings" subtitle="Customize your experience" navigation={navigation} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Language */}
        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-3">Language</Text>
        <View className="bg-white rounded-2xl p-4 mb-4" style={CARD_SHADOW}>
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

        {/* Theme */}
        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-3">Theme</Text>
        <View className="bg-white rounded-2xl p-4 mb-4" style={CARD_SHADOW}>
          <View className="flex-row gap-3">
            {THEMES.map(t => (
              <TouchableOpacity
                key={t.label}
                onPress={() => setTheme(t.label)}
                className={`flex-1 py-3 rounded-xl items-center border ${theme === t.label ? 'bg-green-700 border-green-700' : 'bg-gray-50 border-gray-200'}`}
                activeOpacity={0.8}
              >
                <AppIcon
                  name={t.icon}
                  size={18}
                  color={theme === t.label ? '#FFFFFF' : '#4B5563'}
                />
                <Text className={`text-xs font-semibold mt-1 ${theme === t.label ? 'text-white' : 'text-gray-600'}`}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Data & Storage */}
        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-3">Data & Storage</Text>
        <View className="bg-white rounded-2xl overflow-hidden" style={CARD_SHADOW}>
          {[
            { icon: 'mobileData' as AppIconName, label: 'Use Mobile Data', sub: 'Allow app to use cellular data'  },
            { icon: 'cache' as AppIconName, label: 'Clear Cache',      sub: 'Free up storage space'           },
            { icon: 'version' as AppIconName, label: 'App Version',      sub: 'Naseeb Agri Market v1.0.0'       },
          ].map((item, idx, arr) => (
            <TouchableOpacity
              key={item.label}
              className={`flex-row items-center px-4 py-4 ${idx < arr.length - 1 ? 'border-b border-gray-100' : ''}`}
              activeOpacity={0.7}
            >
              <View className="w-10 h-10 rounded-xl bg-green-50 items-center justify-center mr-3">
                <AppIcon name={item.icon} size={18} color="#1A6B34" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 text-sm font-semibold">{item.label}</Text>
                <Text className="text-gray-400 text-xs mt-0.5">{item.sub}</Text>
              </View>
              <AppIcon name="chevronRight" size={18} color="#D1D5DB" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default AppSettingsScreen;
