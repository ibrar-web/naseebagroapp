import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppIcon } from '../../../assets/icons';
import type { FieldOption, FieldValue, FormField } from '../types/postForm.types';

type Props = {
  field: FormField;
  value: FieldValue;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (value: FieldValue) => void;
};

const optId = (o: FieldOption) => String(o.id ?? o.value ?? '');
const optLabel = (o: FieldOption) => String(o.name ?? o.label ?? o.id ?? o.value ?? '');

const Dropdown = ({ field, value, isOpen, onToggle, onChange }: Props) => {
  const opts = field.options ?? [];
  const selected = opts.find(o => optId(o) === String(value ?? ''));
  return (
    <View>
      <TouchableOpacity style={[s.input, isOpen && s.inputActive]} onPress={onToggle} activeOpacity={0.7}>
        <Text style={[s.inputText, !selected && s.placeholder]} numberOfLines={1}>
          {selected ? optLabel(selected) : `Select ${field.label.toLowerCase()}...`}
        </Text>
        <AppIcon name="chevronDown" size={14} color="#9CA3AF" />
      </TouchableOpacity>
      {isOpen && (
        <View style={s.sheet}>
          <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
            {opts.map(o => {
              const id = optId(o);
              const active = id === String(value ?? '');
              return (
                <TouchableOpacity
                  key={id}
                  style={[s.opt, active && s.optActive]}
                  onPress={() => { onChange(id); onToggle(); }}
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

const MultiSelect = ({ field, value, onChange }: Props) => {
  const opts = field.options ?? [];
  const selected: string[] = Array.isArray(value) ? value : [];
  const toggle = (id: string) => {
    const next = selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id];
    onChange(next);
  };
  return (
    <View style={s.pills}>
      {opts.map(o => {
        const id = optId(o);
        const active = selected.includes(id);
        return (
          <TouchableOpacity
            key={id}
            style={[s.pill, active && s.pillActive]}
            onPress={() => toggle(id)}
            activeOpacity={0.7}
          >
            <Text style={[s.pillText, active && s.pillTextActive]}>{optLabel(o)}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const PostFormField = (props: Props) => {
  const { field, value, onChange } = props;
  const type = field.field_type?.toLowerCase();

  if (type === 'dropdown') return <Dropdown {...props} />;
  if (type === 'multi_select') return <MultiSelect {...props} />;

  return (
    <TextInput
      style={s.input}
      value={String(value ?? '')}
      onChangeText={t => onChange(t)}
      placeholder={`Enter ${field.label.toLowerCase()}...`}
      placeholderTextColor="#9CA3AF"
      keyboardType={type === 'number' ? 'numeric' : 'default'}
    />
  );
};

const s = StyleSheet.create({
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#111827',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  inputActive: { borderColor: '#2E9E52' },
  inputText: { fontSize: 13, color: '#111827', flex: 1 },
  placeholder: { color: '#9CA3AF' },
  sheet: {
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  opt: { paddingVertical: 11, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optActive: { backgroundColor: '#F2FBF5' },
  optText: { fontSize: 13, color: '#374151' },
  optTextActive: { color: '#1A6B34', fontWeight: '600' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  pill: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  pillActive: { borderColor: '#2E9E52', backgroundColor: '#F2FBF5' },
  pillText: { fontSize: 11, fontWeight: '600', color: '#4B5563' },
  pillTextActive: { color: '#1A6B34' },
});
