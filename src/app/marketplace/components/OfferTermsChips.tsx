import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { TermOption } from '../hooks/useOfferTerms';

type Props = {
  options: TermOption[];
  selected: number | null;
  onSelect: (days: number | null) => void;
};

export const OfferTermsChips = ({ options, selected, onSelect }: Props) => (
  <View style={styles.row}>
    {options.map(opt => (
      <TouchableOpacity
        key={opt.id}
        style={[styles.chip, selected === opt.days && styles.chipSel]}
        onPress={() => onSelect(selected === opt.days ? null : opt.days)}
        activeOpacity={0.8}
      >
        <Text style={[styles.text, selected === opt.days && styles.textSel]}>{opt.label}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 20, backgroundColor: '#FFFFFF' },
  chipSel: { borderColor: '#1A6B34', backgroundColor: '#F2FBF5' },
  text: { fontSize: 12, fontWeight: '500', color: '#374151' },
  textSel: { color: '#1A6B34', fontWeight: '700' },
});
