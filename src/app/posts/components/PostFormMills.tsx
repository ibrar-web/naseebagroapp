import React from 'react';
import {
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { AppIcon } from '../../../assets/icons';
import { GooglePlacesInput } from '../../components/GooglePlacesInput';
import type { FieldOption, FormField, MillEntry } from '../types/postForm.types';

type Props = {
  millsField: FormField | undefined;
  openDropdown: string | null;
  selectedMills: MillEntry[];
  pendingMill: MillEntry;
  commodityUnit?: string;
  onToggleDropdown: (id: string) => void;
  onSelectMill: (id: string, opts: FieldOption[]) => void;
  onPendingMillChange: (mill: MillEntry) => void;
  onAddMill: () => void;
  onRemoveMill: (id: string) => void;
};

const MILLS_DD_ID = '__mills_dropdown__';
const OTHER_ID = '__other__';

const optId = (o: FieldOption) => String(o.id ?? o.value ?? '');
const optLabel = (o: FieldOption) => String(o.name ?? o.label ?? '');

export const PostFormMills = ({
  millsField, openDropdown, selectedMills, pendingMill, commodityUnit = '40kg',
  onToggleDropdown, onSelectMill, onPendingMillChange, onAddMill, onRemoveMill,
}: Props) => {
  const opts = millsField?.options ?? [];
  const isOpen = openDropdown === MILLS_DD_ID;
  const isCustom = pendingMill.isCustom === true;
  const selected = isCustom ? null : opts.find(o => optId(o) === pendingMill.id);
  const canAdd = isCustom
    ? Boolean(pendingMill.name.trim() && pendingMill.city.trim() && pendingMill.price.trim())
    : Boolean(pendingMill.id && pendingMill.price.trim());

  const dropdownLabel = isCustom
    ? 'Other (enter manually)'
    : selected ? optLabel(selected) : 'Select mill...';

  return (
    <View>
      {selectedMills.map(m => (
        <View key={m.id} style={s.millRow}>
          <View style={s.millIcon}>
            <AppIcon name="business" size={15} color="#217A3C" />
          </View>
          <View style={s.millInfo}>
            <Text style={s.millName}>{m.name}</Text>
            <View style={s.millMeta}>
              {m.city ? (
                <View style={s.metaItem}>
                  <AppIcon name="profileCity" size={9} color="#9CA3AF" />
                  <Text style={s.metaText}>{m.city}</Text>
                </View>
              ) : null}
              {m.price ? <Text style={s.millPrice}>₨{m.price}/{commodityUnit}</Text> : null}
              {m.isCustom ? <Text style={s.pendingBadge}>Pending approval</Text> : null}
            </View>
          </View>
          <TouchableOpacity style={s.removeBtn} onPress={() => onRemoveMill(m.id)} activeOpacity={0.7}>
            <AppIcon name="cache" size={13} color="#EF4444" />
          </TouchableOpacity>
        </View>
      ))}

      <View style={s.addBox}>
        <Text style={s.addTitle}>ADD A MILL</Text>

        <TouchableOpacity
          style={[s.select, (selected || isCustom) && s.selectActive]}
          onPress={() => onToggleDropdown(MILLS_DD_ID)}
          activeOpacity={0.7}
        >
          <Text style={[s.selectText, !selected && !isCustom && s.placeholder]} numberOfLines={1}>
            {dropdownLabel}
          </Text>
          <AppIcon name="chevronDown" size={13} color="#9CA3AF" />
        </TouchableOpacity>

        {isOpen && (
          <View style={s.sheet}>
            <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
              {opts.map(o => {
                const id = optId(o);
                const active = !isCustom && id === pendingMill.id;
                return (
                  <TouchableOpacity
                    key={id}
                    style={[s.opt, active && s.optActive]}
                    onPress={() => onSelectMill(id, opts)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[s.optText, active && s.optTextActive]}>{optLabel(o)}</Text>
                      {o.city ? <Text style={s.optSub}>{o.city}</Text> : null}
                    </View>
                    {active && <AppIcon name="approved" size={14} color="#2E9E52" />}
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={[s.opt, isCustom && s.optActive]}
                onPress={() => onSelectMill(OTHER_ID, opts)}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[s.optText, isCustom && s.optTextActive]}>Other (enter manually)</Text>
                  <Text style={s.optSub}>Add a mill not listed above</Text>
                </View>
                {isCustom && <AppIcon name="approved" size={14} color="#2E9E52" />}
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {isCustom ? (
          <>
            <TextInput
              style={s.input}
              value={pendingMill.name}
              onChangeText={t => onPendingMillChange({ ...pendingMill, name: t })}
              placeholder="Mill name"
              placeholderTextColor="#9CA3AF"
            />
            <GooglePlacesInput
              value={pendingMill.city}
              onChange={city => onPendingMillChange({ ...pendingMill, city })}
              placeholder="City / location"
              buttonStyle={s.millCityBtn}
            />
          </>
        ) : (
          <View style={s.cityRow}>
            <AppIcon name="profileCity" size={12} color="#9CA3AF" />
            <TextInput
              style={s.cityInput}
              value={pendingMill.city}
              placeholder="Location (auto-filled)"
              placeholderTextColor="#9CA3AF"
              editable={false}
            />
          </View>
        )}

        <View style={s.priceRow}>
          <Text style={s.rupee}>₨</Text>
          <TextInput
            style={s.priceInput}
            value={pendingMill.price}
            onChangeText={t => onPendingMillChange({ ...pendingMill, price: t })}
            placeholder={`Price per ${commodityUnit}`}
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity
          style={[s.addBtn, canAdd && s.addBtnActive]}
          onPress={onAddMill}
          disabled={!canAdd}
          activeOpacity={0.7}
        >
          <AppIcon name="add" size={13} color={canAdd ? '#FFFFFF' : '#9CA3AF'} />
          <Text style={[s.addBtnText, canAdd && s.addBtnTextActive]}>Add Mill</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  millRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F2FBF5', borderRadius: 11, padding: 10, paddingHorizontal: 13, marginBottom: 8 },
  millIcon: { width: 34, height: 34, backgroundColor: '#E8F7EE', borderRadius: 9, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  millInfo: { flex: 1 },
  millName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  millMeta: { flexDirection: 'row', gap: 8, marginTop: 2, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 11, color: '#6B7280' },
  millPrice: { fontSize: 11, color: '#1A6B34', fontWeight: '700' },
  pendingBadge: { fontSize: 10, color: '#D97706', fontWeight: '600', backgroundColor: '#FEF3C7', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  removeBtn: { width: 28, height: 28, backgroundColor: '#FEE2E2', borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  addBox: { backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#D1D5DB', borderStyle: 'dashed', borderRadius: 12, padding: 12 },
  addTitle: { fontSize: 11, fontWeight: '700', color: '#6B7280', marginBottom: 10, letterSpacing: 0.3 },
  select: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 9, paddingVertical: 9, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', marginBottom: 6 },
  selectActive: { borderColor: '#2E9E52' },
  selectText: { fontSize: 12, color: '#374151', flex: 1 },
  placeholder: { color: '#9CA3AF' },
  sheet: { marginBottom: 6, backgroundColor: '#FFFFFF', borderRadius: 9, borderWidth: 1.5, borderColor: '#E5E7EB', overflow: 'hidden' },
  opt: { paddingVertical: 10, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optActive: { backgroundColor: '#F2FBF5' },
  optText: { fontSize: 12, color: '#374151' },
  optTextActive: { color: '#1A6B34', fontWeight: '600' },
  optSub: { fontSize: 10, color: '#9CA3AF', marginTop: 1 },
  input: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 9, paddingVertical: 9, paddingHorizontal: 11, fontSize: 12, color: '#374151', backgroundColor: '#FFFFFF', marginBottom: 6 },
  millCityBtn: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 9, paddingVertical: 9, paddingHorizontal: 11, marginBottom: 6 },
  cityRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 9, paddingVertical: 9, paddingHorizontal: 11, gap: 6, backgroundColor: '#FFFFFF', marginBottom: 6 },
  cityInput: { flex: 1, fontSize: 12, color: '#374151', padding: 0 },
  priceRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 9, paddingVertical: 9, paddingHorizontal: 11, gap: 4, backgroundColor: '#FFFFFF', marginBottom: 6 },
  rupee: { fontSize: 12, fontWeight: '700', color: '#9CA3AF' },
  priceInput: { flex: 1, fontSize: 12, color: '#374151', padding: 0 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 9, borderRadius: 9, backgroundColor: '#F3F4F6' },
  addBtnActive: { backgroundColor: '#2E9E52' },
  addBtnText: { fontSize: 12, fontWeight: '700', color: '#9CA3AF' },
  addBtnTextActive: { color: '#FFFFFF' },
});
