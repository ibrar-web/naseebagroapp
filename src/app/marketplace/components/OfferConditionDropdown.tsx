import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppIcon } from '../../../assets/icons';

type Props = {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  placeholder?: string;
};

export const OfferConditionDropdown = ({ options, selected, onSelect, placeholder = 'Select...' }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <TouchableOpacity style={styles.btn} onPress={() => setOpen(v => !v)} activeOpacity={0.85}>
        <Text style={[styles.text, !selected && styles.placeholder]} numberOfLines={1}>
          {selected || placeholder}
        </Text>
        <AppIcon name={open ? 'chevronDown' : 'chevronRight'} size={15} color="#6B7280" />
      </TouchableOpacity>
      {open ? (
        <View style={styles.menu}>
          {options.map(opt => (
            <TouchableOpacity
              key={opt}
              style={styles.row}
              onPress={() => { onSelect(selected === opt ? '' : opt); setOpen(false); }}
              activeOpacity={0.8}
            >
              <View style={[styles.check, selected === opt && styles.checkSel]}>
                {selected === opt ? <AppIcon name="approved" size={10} color="#217A3C" /> : null}
              </View>
              <Text style={styles.optText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  btn: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, backgroundColor: '#FAFAFA', flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { flex: 1, fontSize: 13, color: '#111827', fontWeight: '700' },
  placeholder: { color: '#9CA3AF', fontWeight: '500' },
  menu: { marginTop: 8, borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 10, backgroundColor: '#FFFFFF' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, gap: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  check: { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  checkSel: { borderColor: '#217A3C', backgroundColor: '#E8F7EE' },
  optText: { fontSize: 13, color: '#374151', flex: 1 },
});
