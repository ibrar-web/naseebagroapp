import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../../assets/icons';
import ENV from '../../environment';

type Suggestion = { placeId: string; mainText: string; secondaryText: string };

export type PlaceDetails = {
  name: string;
  city: string;
  province: string;
  latitude: number | null;
  longitude: number | null;
};

const Separator = () => <View style={s.sep} />;

type Props = {
  value: string;
  onChange: (name: string) => void;
  onPlaceSelect?: (details: PlaceDetails) => void;
  placeholder?: string;
  countryCode?: string;
  buttonStyle?: object;
};

export const GooglePlacesInput = ({
  value,
  onChange,
  onPlaceSelect,
  placeholder = 'Search location...',
  countryCode = 'pk',
  buttonStyle,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onPlaceSelectRef = useRef(onPlaceSelect);
  useEffect(() => { onPlaceSelectRef.current = onPlaceSelect; }, [onPlaceSelect]);

  const close = () => {
    setOpen(false);
    setQuery('');
    setSuggestions([]);
    Keyboard.dismiss();
  };

  const fetchSuggestions = useCallback(
    async (input: string) => {
      if (!input.trim()) {
        setSuggestions([]);
        return;
      }
      console.log("searching",ENV.API_BASE_URL)
      setLoading(true);
      try {
        const res = await fetch(
          `${ENV.API_BASE_URL}/public/places/autocomplete?input=${encodeURIComponent(input)}&countryCode=${countryCode}`,
        );
        const json = await res.json();
        console.log('[GooglePlaces] response:', JSON.stringify(json));
        const items: Suggestion[] = ((json.data?.suggestions ?? json.suggestions) ?? []).map((s: any) => {
          const p = s.placePrediction;
          return {
            placeId: p.placeId ?? '',
            mainText: p.structuredFormat?.mainText?.text ?? p.text?.text ?? '',
            secondaryText: p.structuredFormat?.secondaryText?.text ?? '',
          };
        });
        setSuggestions(items);
      } catch (err) {
        console.error('[GooglePlaces] fetch error:', err);
      } finally {
        setLoading(false);
      }
    },
    [countryCode],
  );

  const onQueryChange = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(text), 300);
  };

  const onSelect = async (item: Suggestion) => {
    console.log('[GooglePlaces] selected:', item.mainText);
    onChange(item.mainText);
    close();
    if (!onPlaceSelectRef.current) return;
    try {
      const res = await fetch(
        `${ENV.API_BASE_URL}/public/places/details/${item.placeId}`,
      );
      const json = await res.json();
      const components: { types: string[]; longText: string }[] =
        json.data?.addressComponents ?? json.addressComponents ?? [];
      const get = (type: string) =>
        components.find(c => c.types.includes(type))?.longText ?? '';
      const loc = json.data?.location ?? json.location ?? null;
      onPlaceSelectRef.current({
        name: item.mainText,
        city: get('locality') || get('administrative_area_level_2'),
        province: get('administrative_area_level_1'),
        latitude: typeof loc?.latitude === 'number' ? loc.latitude : null,
        longitude: typeof loc?.longitude === 'number' ? loc.longitude : null,
      });
    } catch (err) {
      console.error('[GooglePlaces] details error:', err);
      onPlaceSelectRef.current?.({ name: item.mainText, city: '', province: '' });
    }
  };

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
        <KeyboardAvoidingView
          style={s.backdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={s.sheet}>
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Search Location</Text>
              <TouchableOpacity onPress={close} activeOpacity={0.7}>
                <AppIcon name="cache" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={s.inputContainer}>
              <TextInput
                style={s.textInput}
                value={query}
                onChangeText={onQueryChange}
                placeholder="Type city name..."
                placeholderTextColor="#9CA3AF"
                autoFocus
                autoCorrect={false}
              />
              {loading && (
                <ActivityIndicator style={s.spinner} size="small" color="#9CA3AF" />
              )}
            </View>

            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.placeId}
              keyboardShouldPersistTaps="handled"
              style={s.list}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={s.row}
                  onPress={() => onSelect(item)}
                  activeOpacity={0.7}
                >
                  <Text style={s.mainText}>{item.mainText}</Text>
                  {!!item.secondaryText && (
                    <Text style={s.secondaryText}>{item.secondaryText}</Text>
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={Separator}
            />

            <SafeAreaView />
          </View>
        </KeyboardAvoidingView>
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    minHeight: 350,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sheetTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  inputContainer: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
    position: 'relative',
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    fontSize: 13,
    color: '#111827',
    backgroundColor: '#FAFAFA',
    height: 44,
    paddingHorizontal: 12,
    paddingRight: 36,
  },
  spinner: { position: 'absolute', right: 22, top: 20 },
  list: { marginHorizontal: 12, marginTop: 4 },
  row: { paddingVertical: 12, paddingHorizontal: 14, backgroundColor: '#FFFFFF' },
  mainText: { fontSize: 13, color: '#111827' },
  secondaryText: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  sep: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 2 },
});
