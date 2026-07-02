import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppIcon } from '../../../assets/icons';
import type { FieldOption } from '../types/postForm.types';

type Props = {
  value: string | null;
  options: FieldOption[];
  onChange: (v: string) => void;
};

type OptionConfig = {
  id: string;
  label: string;
  subtitle: string;
  icon: 'notificationLogistics' | 'listing';
};

const OPTION_CONFIGS: Record<string, OptionConfig> = {
  DELIVERED: {
    id: 'DELIVERED',
    label: 'Delivered',
    subtitle: 'You arrange delivery to buyer',
    icon: 'notificationLogistics',
  },
  EX_LOAD: {
    id: 'EX_LOAD',
    label: 'EX Load',
    subtitle: 'Buyer picks up from your location',
    icon: 'listing',
  },
};

export const PostFormDeliveryOptions = ({ value, options, onChange }: Props) => {
  const opts = options.length > 0 ? options : [{ id: 'DELIVERED' }, { id: 'EX_LOAD' }];
  return (
    <View style={s.row}>
      {opts.map(o => {
        const id = String(o.id ?? '');
        const cfg = OPTION_CONFIGS[id] ?? { id, label: id, subtitle: '', icon: 'listing' as const };
        const active = value === id;
        return (
          <TouchableOpacity
            key={id}
            style={[s.btn, active && s.btnActive]}
            onPress={() => onChange(id)}
            activeOpacity={0.7}
          >
            <View style={s.btnHead}>
              <View style={[s.icon, active ? s.iconActive : s.iconInactive]}>
                <AppIcon name={cfg.icon} size={12} color={active ? '#FFFFFF' : '#9CA3AF'} />
              </View>
              <Text style={[s.label, active && s.labelActive]}>{cfg.label}</Text>
            </View>
            <Text style={s.sub}>{cfg.subtitle}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  btn: {
    flex: 1,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  btnActive: { borderColor: '#2E9E52', backgroundColor: '#F2FBF5' },
  btnHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  icon: { width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  iconActive: { backgroundColor: '#217A3C' },
  iconInactive: { backgroundColor: '#F3F4F6' },
  label: { fontSize: 12, fontWeight: '700', color: '#374151' },
  labelActive: { color: '#1A6B34' },
  sub: { fontSize: 10, color: '#9CA3AF' },
});
