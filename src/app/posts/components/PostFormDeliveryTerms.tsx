import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppIcon } from '../../../assets/icons';
import type { FieldOption, FormField } from '../types/postForm.types';

type Props = {
  field: FormField;
  deliveryDays: string;
  isCustom: boolean;
  customInput: string;
  onSelectDays: (d: string) => void;
  onToggleCustom: (v: boolean) => void;
  onCustomInput: (v: string) => void;
};

const FALLBACK_OPTS: FieldOption[] = [
  { id: '1', name: '1 day' },
  { id: '2', name: '2 days' },
  { id: '3', name: '3 days' },
  { id: '5', name: '5 days' },
  { id: '7', name: '7 days' },
  { id: '10', name: '10 days' },
  { id: '14', name: '14 days' },
];

const optId = (o: FieldOption) => String(o.id ?? o.value ?? '');
const optLabel = (o: FieldOption) => String(o.name ?? o.label ?? o.id ?? '');

export const PostFormDeliveryTerms = ({
  field, deliveryDays, isCustom, customInput, onSelectDays, onToggleCustom, onCustomInput,
}: Props) => {
  const [open, setOpen] = React.useState(false);
  const opts = field.options && field.options.length > 0 ? field.options : FALLBACK_OPTS;
  const selected = isCustom ? null : opts.find(o => optId(o) === deliveryDays);
  const displayText = isCustom ? 'Custom...' : (selected ? optLabel(selected) : null);
  const effectiveDays = isCustom ? customInput : deliveryDays;

  return (
    <View>
      <Text style={s.hint}>Committed delivery window from deal confirmation. Late delivery triggers a dispute.</Text>
      <TouchableOpacity
        style={[s.select, displayText && s.selectActive]}
        onPress={() => setOpen(p => !p)}
        activeOpacity={0.7}
      >
        <Text style={[s.selectText, !displayText && s.placeholder]} numberOfLines={1}>
          {displayText ?? 'Select delivery window...'}
        </Text>
        <AppIcon name="chevronDown" size={14} color="#9CA3AF" />
      </TouchableOpacity>
      {open && (
        <View style={s.sheet}>
          {opts.map(o => {
            const id = optId(o);
            const active = !isCustom && id === deliveryDays;
            return (
              <TouchableOpacity
                key={id}
                style={[s.opt, active && s.optActive]}
                onPress={() => { onSelectDays(id); onToggleCustom(false); setOpen(false); }}
                activeOpacity={0.7}
              >
                <Text style={[s.optText, active && s.optTextActive]}>{optLabel(o)}</Text>
                {active && <AppIcon name="approved" size={14} color="#2E9E52" />}
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            style={[s.opt, isCustom && s.optActive]}
            onPress={() => { onToggleCustom(true); onSelectDays(''); setOpen(false); }}
            activeOpacity={0.7}
          >
            <Text style={[s.optText, isCustom && s.optTextActive]}>Custom…</Text>
            {isCustom && <AppIcon name="approved" size={14} color="#2E9E52" />}
          </TouchableOpacity>
        </View>
      )}
      {isCustom && (
        <TextInput
          style={s.customInput}
          value={customInput}
          onChangeText={onCustomInput}
          placeholder="Number of days"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
        />
      )}
      {effectiveDays.trim().length > 0 && Number(effectiveDays) > 0 && (
        <View style={s.confirm}>
          <AppIcon name="approved" size={11} color="#217A3C" />
          <Text style={s.confirmText}>
            Committed to deliver within {effectiveDays} {Number(effectiveDays) === 1 ? 'day' : 'days'} of deal creation
          </Text>
        </View>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  hint: { fontSize: 11, color: '#9CA3AF', marginBottom: 8 },
  select: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, paddingVertical: 11, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF' },
  selectActive: { borderColor: '#2E9E52' },
  selectText: { fontSize: 13, color: '#111827', flex: 1 },
  placeholder: { color: '#9CA3AF' },
  sheet: { marginTop: 4, backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB', overflow: 'hidden' },
  opt: { paddingVertical: 11, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optActive: { backgroundColor: '#F2FBF5' },
  optText: { fontSize: 13, color: '#374151' },
  optTextActive: { color: '#1A6B34', fontWeight: '600' },
  customInput: { marginTop: 6, borderWidth: 1.5, borderColor: '#2E9E52', borderRadius: 10, paddingVertical: 11, paddingHorizontal: 12, fontSize: 13, color: '#111827', backgroundColor: '#FFFFFF' },
  confirm: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  confirmText: { fontSize: 11, color: '#1A6B34' },
});
