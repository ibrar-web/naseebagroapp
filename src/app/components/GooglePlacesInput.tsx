import React, { useState, useRef, useCallback, useEffect } from 'react';
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
import { AppIcon } from '../../assets/icons';

const PLACES_KEY = 'AIzaSyCks4PR0s3MnM-aXmNQ3_3oT9LQiB0-q0M';

type Prediction = {
  place_id: string;
  main_text: string;
  secondary_text: string;
};

type Props = {
  value: string;
  onChange: (name: string) => void;
  placeholder?: string;
  countryCode?: string;
  buttonStyle?: object;
};

const searchPlaces = async (input: string, countryCode: string): Promise<Prediction[]> => {
  if (input.trim().length < 2) return [];
  try {
    const url =
      `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
      `?input=${encodeURIComponent(input)}` +
      `&key=${PLACES_KEY}` +
      `&components=country:${countryCode}` +
      `&types=(cities)` +
      `&language=en`;
    const res = await fetch(url);
    const data = await res.json();
    return (data.predictions ?? []).map((p: any) => ({
      place_id: p.place_id,
      main_text: p.structured_formatting?.main_text ?? p.description,
      secondary_text: p.structured_formatting?.secondary_text ?? '',
    }));
  } catch {
    return [];
  }
};

export const GooglePlacesInput = ({
  value,
  onChange,
  placeholder = 'Search location...',
  countryCode = 'pk',
  buttonStyle,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const runSearch = useCallback(async (q: string) => {
    setLoading(true);
    const preds = await searchPlaces(q, countryCode);
    setResults(preds);
    setLoading(false);
  }, [countryCode]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(() => runSearch(query), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, runSearch]);

  const close = () => { setOpen(false); setQuery(''); setResults([]); };

  return (
    <View>
      <TouchableOpacity
        style={[s.btn, buttonStyle]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={[s.btnText, !value && s.placeholder]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <AppIcon name="chevronDown" size={14} color="#9CA3AF" />
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" transparent onRequestClose={close}>
        <View style={s.backdrop}>
          <View style={s.sheet}>
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Search Location</Text>
              <TouchableOpacity onPress={close} activeOpacity={0.7}>
                <AppIcon name="cache" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={s.searchRow}>
              <TextInput
                style={s.search}
                value={query}
                onChangeText={setQuery}
                placeholder="Type city name..."
                placeholderTextColor="#9CA3AF"
                autoFocus
              />
              {loading && (
                <ActivityIndicator
                  size="small"
                  color="#2E9E52"
                  style={s.searchLoader}
                />
              )}
            </View>

            <FlatList
              data={results}
              keyExtractor={item => item.place_id}
              keyboardShouldPersistTaps="handled"
              ItemSeparatorComponent={() => <View style={s.sep} />}
              ListEmptyComponent={
                query.length >= 2 && !loading ? (
                  <Text style={s.emptyText}>No places found</Text>
                ) : null
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={s.row}
                  onPress={() => { onChange(item.main_text); close(); }}
                  activeOpacity={0.7}
                >
                  <AppIcon name="profileCity" size={14} color="#9CA3AF" />
                  <View style={s.rowInfo}>
                    <Text style={s.rowName}>{item.main_text}</Text>
                    {item.secondary_text ? (
                      <Text style={s.rowSub}>{item.secondary_text}</Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  btn: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  btnText: { fontSize: 13, color: '#111827', flex: 1 },
  placeholder: { color: '#9CA3AF' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  sheetTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8 },
  search: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#111827',
    backgroundColor: '#FAFAFA',
  },
  searchLoader: { marginLeft: 8 },
  sep: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 16 },
  row: { paddingVertical: 11, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 13, color: '#111827' },
  rowSub: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  emptyText: { textAlign: 'center', color: '#9CA3AF', fontSize: 13, paddingVertical: 24 },
});
