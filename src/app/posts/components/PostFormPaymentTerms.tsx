import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppIcon } from '../../../assets/icons';
import type { FieldOption, FormField, PaymentMode } from '../types/postForm.types';

type Props = {
  field: FormField;
  paymentMode: PaymentMode;
  paymentValue: string;
  onModeChange: (mode: PaymentMode) => void;
  onValueChange: (val: string) => void;
};

const optId = (o: FieldOption) => String(o.id ?? o.value ?? '');
const optLabel = (o: FieldOption) => String(o.name ?? o.label ?? '');

export const PostFormPaymentTerms = ({ field, paymentMode, paymentValue, onModeChange, onValueChange }: Props) => {
  const allOpts = field.options ?? [];
  const fixedOpts = allOpts.filter(o => o.type === 'fixed_days' || o.type === 'FIXED');
  const weeklyOpts = allOpts.filter(o => o.type === 'weekly_percent' || o.type === 'WEEKLY');
  const activeOpts = paymentMode === 'FIXED' ? fixedOpts : weeklyOpts;
  const [open, setOpen] = React.useState(false);
  const selected = activeOpts.find(o => optId(o) === paymentValue);

  return (
    <View>
      <Text style={s.hint}>Payment is made after delivery is confirmed</Text>
      <View style={s.tabs}>
        {(['FIXED', 'WEEKLY'] as PaymentMode[]).map(m => (
          <TouchableOpacity
            key={m}
            style={[s.tab, paymentMode === m && s.tabActive]}
            onPress={() => { onModeChange(m); setOpen(false); }}
            activeOpacity={0.7}
          >
            <Text style={[s.tabText, paymentMode === m && s.tabTextActive]}>
              {m === 'FIXED' ? 'Fixed Days' : 'Weekly %'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={[s.select, selected && s.selectActive]} onPress={() => setOpen(p => !p)} activeOpacity={0.7}>
        <Text style={[s.selectText, !selected && s.placeholder]} numberOfLines={1}>
          {selected ? optLabel(selected) : 'Pay within how many days?'}
        </Text>
        <AppIcon name="chevronDown" size={14} color="#9CA3AF" />
      </TouchableOpacity>
      {open && (
        <View style={s.sheet}>
          <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled>
            {activeOpts.map(o => {
              const id = optId(o);
              const active = id === paymentValue;
              return (
                <TouchableOpacity
                  key={id}
                  style={[s.opt, active && s.optActive]}
                  onPress={() => { onValueChange(id); setOpen(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={[s.optText, active && s.optTextActive]}>{optLabel(o)}</Text>
                  {active && <AppIcon name="approved" size={14} color="#2E9E52" />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  hint: { fontSize: 11, color: '#9CA3AF', marginBottom: 8 },
  tabs: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 10, padding: 3, marginBottom: 10 },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  tabText: { fontSize: 12, fontWeight: '500', color: '#6B7280' },
  tabTextActive: { fontWeight: '700', color: '#111827' },
  select: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, paddingVertical: 11, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF' },
  selectActive: { borderColor: '#2E9E52' },
  selectText: { fontSize: 13, color: '#111827', flex: 1 },
  placeholder: { color: '#9CA3AF' },
  sheet: { marginTop: 4, backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB', overflow: 'hidden' },
  opt: { paddingVertical: 11, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optActive: { backgroundColor: '#F2FBF5' },
  optText: { fontSize: 13, color: '#374151' },
  optTextActive: { color: '#1A6B34', fontWeight: '600' },
});
