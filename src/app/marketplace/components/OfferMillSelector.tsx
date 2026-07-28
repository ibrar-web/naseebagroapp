import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type Mill = {
  id: string;
  name?: string;
  location?: string;
  price_per_unit?: string;
  available_quantity?: number | string;
};

type Props = {
  mills: Mill[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export const OfferMillSelector = ({ mills, selectedId, onSelect }: Props) => (
  <View>
    {mills.map(mill => {
      const sel = selectedId === mill.id;
      return (
        <TouchableOpacity
          key={mill.id}
          onPress={() => onSelect(mill.id)}
          style={[styles.row, sel && styles.rowSel]}
          activeOpacity={0.8}
        >
          <View style={[styles.radioOuter, sel && styles.radioOuterSel]}>
            {sel && <View style={styles.radioInner} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.millName}>{mill.name ?? 'Mill'}</Text>
            {mill.location ? (
              <Text style={styles.millCity} numberOfLines={1}>{mill.location}</Text>
            ) : null}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.millPrice}>{mill.price_per_unit ? `PKR ${mill.price_per_unit}` : 'Ask'}</Text>
            {mill.available_quantity != null ? (
              <Text style={styles.millAvail}>{mill.available_quantity} available</Text>
            ) : null}
          </View>
        </TouchableOpacity>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 12, marginBottom: 8, gap: 12 },
  rowSel: { borderColor: '#1A6B34', backgroundColor: '#F2FBF5' },
  radioOuter: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  radioOuterSel: { borderColor: '#1A6B34' },
  radioInner: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#1A6B34' },
  millName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  millCity: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  millPrice: { fontSize: 14, fontWeight: '900', color: '#1A6B34' },
  millAvail: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
});
