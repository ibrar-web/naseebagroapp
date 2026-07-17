import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppIcon } from '../../../assets/icons';
import { useCities } from '../../../hooks/useCities';
import type { CityValue } from '../types/postForm.types';

type Props = {
  value: CityValue | null;
  onChange: (city: CityValue) => void;
  placeholder?: string;
};

export const PostFormCityPicker = ({ value, onChange, placeholder = 'Select city...' }: Props) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const cities = useCities();
  const loading = cities.length === 0;

  const filtered = useMemo(() => {
    if (!search.trim()) return cities;
    const q = search.toLowerCase();
    return cities.filter(
      c => c.name.toLowerCase().includes(q) || c.province?.toLowerCase().includes(q),
    );
  }, [cities, search]);

  const close = () => { setOpen(false); setSearch(''); };

  return (
    <View>
      <TouchableOpacity style={s.btn} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={[s.btnText, !value && s.placeholder]} numberOfLines={1}>
          {value?.name || placeholder}
        </Text>
        <AppIcon name="chevronDown" size={14} color="#9CA3AF" />
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" transparent onRequestClose={close}>
        <View style={s.backdrop}>
          <View style={s.sheet}>
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Select City</Text>
              <TouchableOpacity onPress={close} activeOpacity={0.7}>
                <AppIcon name="cache" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={s.search}
              value={search}
              onChangeText={setSearch}
              placeholder="Search city or province..."
              placeholderTextColor="#9CA3AF"
              autoFocus
            />

            {loading ? (
              <ActivityIndicator style={s.loader} color="#2E9E52" />
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={item => item.id}
                keyboardShouldPersistTaps="handled"
                ItemSeparatorComponent={() => <View style={s.sep} />}
                renderItem={({ item }) => {
                  const active = value?.id === item.id;
                  return (
                    <TouchableOpacity
                      style={[s.row, active && s.rowActive]}
                      onPress={() => { onChange({ id: item.id, name: item.name }); close(); }}
                      activeOpacity={0.7}
                    >
                      <View style={s.rowInfo}>
                        <Text style={[s.rowName, active && s.rowNameActive]}>{item.name}</Text>
                        {item.province ? <Text style={s.rowProvince}>{item.province}</Text> : null}
                      </View>
                      {active && <AppIcon name="approved" size={14} color="#2E9E52" />}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  btn: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, paddingVertical: 11, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF' },
  btnText: { fontSize: 13, color: '#111827', flex: 1 },
  placeholder: { color: '#9CA3AF' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', paddingBottom: 24 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10 },
  sheetTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  search: { marginHorizontal: 16, marginBottom: 8, borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, paddingVertical: 9, paddingHorizontal: 12, fontSize: 13, color: '#111827', backgroundColor: '#FAFAFA' },
  loader: { marginTop: 40 },
  row: { paddingVertical: 11, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowActive: { backgroundColor: '#F2FBF5' },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 13, color: '#111827' },
  rowNameActive: { color: '#1A6B34', fontWeight: '700' },
  rowProvince: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  sep: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 16 },
});
