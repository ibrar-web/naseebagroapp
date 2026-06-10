import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MockStatusBar from '../../components/MockStatusBar';
import type {
  CategoryRouteParam,
  RootStackParamList,
} from '../../../navigation/types';
import api from '../../../utils/api';

// ── Types ─────────────────────────────────────────────────────────────────────
type PostFormMode = 'buyer' | 'seller';
type PaymentMode = 'FIXED' | 'WEEKLY';
type FieldValue = string | string[] | null;

type CategoryFieldOption = {
  id?: string | number;
  value?: string | number;
  name?: string;
  label?: string;
  city?: string;
  province?: string;
  mill_id?: string;
};

type CategoryFormField = {
  id: string;
  field_key: string;
  label: string;
  field_type: string;
  icon?: string;
  is_required?: boolean;
  sort_order?: number;
  options?: CategoryFieldOption[];
};

type CategoryForm = {
  id: string;
  category_id: string;
  form_type: string;
  name: string;
  fields: CategoryFormField[];
};

type MillEntry = {
  id: string;
  name: string;
  city: string;
  price: string;
};

type QueuedPost = {
  payload: Record<string, unknown>;
  preview: string;
};

type Props = {
  categoryName: string;
  categoryData?: CategoryRouteParam;
  mode: PostFormMode;
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

// ── Constants ─────────────────────────────────────────────────────────────────
const PAYMENT_FIXED_DAYS = ['3', '7', '15', '30'];
const PAYMENT_WEEKLY_PERCENT = ['25', '50', '75', '100'];
const DELIVERY_DAY_PRESETS = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const parseNumber = (value: FieldValue) => {
  if (typeof value !== 'string') return null;
  const parsed = Number(value.replace(/[^\d.]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
};

const optionId = (option: CategoryFieldOption) =>
  String(option.id ?? option.value ?? option.name ?? option.label ?? '');

const optionLabel = (option: CategoryFieldOption) =>
  String(option.name ?? option.label ?? option.id ?? option.value ?? '');

const optionMeta = (option: CategoryFieldOption) => {
  const meta = [option.mill_id, option.city, option.province]
    .filter(Boolean)
    .join(' · ');
  return meta || null;
};

const normalizeForm = (response: any): CategoryForm | null => {
  const item =
    response?.item ??
    response?.data?.item ??
    response?.data?.data?.item ??
    response;
  if (!item || typeof item !== 'object' || !Array.isArray(item.fields))
    return null;
  return { ...item, fields: item.fields };
};

const isFilled = (value: FieldValue, fieldType: string) => {
  if (fieldType === 'multi_select')
    return Array.isArray(value) && value.length > 0;
  return value !== null && value !== undefined && String(value).trim() !== '';
};

const valueForPayload = (field: CategoryFormField, value: FieldValue) => {
  const fieldType = field.field_type?.toLowerCase();
  if (fieldType === 'number') return parseNumber(value);
  if (fieldType === 'multi_select') return Array.isArray(value) ? value : [];
  return value || null;
};

// ── Component ─────────────────────────────────────────────────────────────────
const CategoryPostForm = ({
  categoryName,
  categoryData,
  mode,
  navigation,
}: Props) => {
  const isBuyer = mode === 'buyer';

  const [form, setForm] = useState<CategoryForm | null>(null);
  const [values, setValues] = useState<Record<string, FieldValue>>({});
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
    {},
  );
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('FIXED');
  const [paymentValue, setPaymentValue] = useState('30');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Mills
  const [selectedMills, setSelectedMills] = useState<MillEntry[]>([]);
  const [pendingMill, setPendingMill] = useState({
    id: '',
    name: '',
    city: '',
    price: '',
  });

  // Delivery terms
  const [deliveryDays, setDeliveryDays] = useState('');
  const [isCustomDelivery, setIsCustomDelivery] = useState(false);
  const [customDeliveryInput, setCustomDeliveryInput] = useState('');

  // Multi-post queue
  const [queuedPosts, setQueuedPosts] = useState<QueuedPost[]>([]);

  const categoryId = categoryData?.id ?? form?.category_id;

  const sortedFields = useMemo(
    () =>
      [...(form?.fields ?? [])].sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
      ),
    [form],
  );

  const paymentField = sortedFields.find(
    f =>
      f.field_key === 'payment_terms' ||
      f.field_type?.toLowerCase() === 'payment_terms',
  );

  const millsFieldDef = sortedFields.find(f => f.field_key === 'mills');
  const millOptions = millsFieldDef?.options ?? [];

  // ── Validation ──────────────────────────────────────────────────────────────
  const effectiveDeliveryDays = isCustomDelivery
    ? customDeliveryInput
    : deliveryDays;

  const formIsValid = sortedFields.every(field => {
    const key = field.field_key;
    const type = field.field_type?.toLowerCase();

    if (!field.is_required) return true;
    if (key === 'mills') return true;
    if (key === 'price' && selectedMills.length > 0) return true;

    if (key === 'payment_terms' || type === 'payment_terms') {
      return paymentValue.trim().length > 0;
    }

    if (key === 'delivery_terms') {
      const d = effectiveDeliveryDays.trim();
      return d.length > 0 && Number(d) > 0;
    }

    return isFilled(values[key], type ?? '');
  });

  const canSubmit = Boolean(categoryId && form && formIsValid && !submitting);
  const canSubmitAny = canSubmit || queuedPosts.length > 0;

  // ── Alert on load error ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!loadError) return;
    Alert.alert(
      'Form Unavailable',
      loadError,
      [
        {
          text: 'OK',
          onPress: () => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'MainTabs',
                      params: {
                        screen: 'Post',
                        params: { initialTab: 'posts' },
                      },
                    },
                  ],
                }),
              );
            }
          },
        },
      ],
      { cancelable: false },
    );
  }, [loadError, navigation]);

  // ── Load form ───────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const loadForm = async () => {
      if (!categoryData?.id) {
        setLoading(false);
        setLoadError('Please select a category again.');
        return;
      }
      setLoading(true);
      setLoadError('');
      try {
        const response = isBuyer
          ? await api.buyer.getBuyerCategoryform(categoryData.id)
          : await api.seller.getSellerCategoryform(categoryData.id);
        const nextForm = normalizeForm(response);
        if (!mounted) return;
        if (!nextForm) {
          setForm(null);
          setLoadError('No form is configured for this category.');
          return;
        }
        setForm(nextForm);
        setValues({});
      } catch {
        if (!mounted) return;
        setLoadError('Unable to load the category form. Please try again.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadForm();
    return () => {
      mounted = false;
    };
  }, [categoryData?.id, isBuyer]);

  // ── Navigation ──────────────────────────────────────────────────────────────
  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'MainTabs',
            params: { screen: 'Post', params: { initialTab: 'posts' } },
          },
        ],
      }),
    );
  };

  // ── Field helpers ───────────────────────────────────────────────────────────
  const setFieldValue = (fieldKey: string, value: FieldValue) => {
    setValues(prev => ({ ...prev, [fieldKey]: value }));
  };

  const toggleDropdown = (fieldKey: string) => {
    setOpenDropdowns(prev => ({ [fieldKey]: !prev[fieldKey] }));
  };

  const closeDropdowns = () => setOpenDropdowns({});

  // ── Payment ─────────────────────────────────────────────────────────────────
  const setNextPaymentMode = (nextMode: PaymentMode) => {
    setPaymentMode(nextMode);
    setPaymentValue(nextMode === 'FIXED' ? '30' : '50');
  };

  // ── Mills ───────────────────────────────────────────────────────────────────
  const setPendingMillField = (key: keyof typeof pendingMill, val: string) => {
    setPendingMill(prev => ({ ...prev, [key]: val }));
  };

  const selectMillOption = (id: string) => {
    const opt = millOptions.find(o => optionId(o) === id);
    if (!opt) return;
    setPendingMill({
      id,
      name: optionLabel(opt),
      city: opt.city ?? '',
      price: '',
    });
    closeDropdowns();
  };

  const addMill = () => {
    if (!pendingMill.id || !pendingMill.price) return;
    if (selectedMills.some(m => m.id === pendingMill.id)) return;
    setSelectedMills(prev => [...prev, { ...pendingMill }]);
    setPendingMill({ id: '', name: '', city: '', price: '' });
  };

  const removeMill = (id: string) => {
    setSelectedMills(prev => prev.filter(m => m.id !== id));
  };

  // ── Build payload ───────────────────────────────────────────────────────────
  const buildPayload = (): Record<string, unknown> => {
    const payload: Record<string, unknown> = { category_id: categoryId };

    for (const field of sortedFields) {
      const key = field.field_key;
      const type = field.field_type?.toLowerCase();

      if (key === 'payment_terms' || type === 'payment_terms') continue;
      if (key === 'mills') continue;
      if (key === 'price' && selectedMills.length > 0) continue;

      if (key === 'delivery_terms') {
        const days = isCustomDelivery ? customDeliveryInput : deliveryDays;
        payload[key] = parseInt(days, 10) || null;
        continue;
      }

      payload[key] = valueForPayload(field, values[key]);
    }

    if (paymentField) {
      payload.payment_terms = {
        type: paymentMode,
        fixed_days: paymentMode === 'FIXED' ? parseNumber(paymentValue) : null,
        weekly_percent:
          paymentMode === 'WEEKLY' ? parseNumber(paymentValue) : null,
      };
    }

    if (selectedMills.length > 0) {
      payload.mills = selectedMills.map(m => ({
        id: m.id,
        price: parseFloat(m.price) || 0,
      }));
    }
    return payload;
  };

  const buildPreview = (): string => {
    const parts: string[] = [];
    const commodityVal = values['commodity'];
    if (typeof commodityVal === 'string' && commodityVal) {
      const opts =
        sortedFields.find(f => f.field_key === 'commodity')?.options ?? [];
      const opt = opts.find(o => optionId(o) === commodityVal);
      if (opt) parts.push(optionLabel(opt));
    }
    const qty = values['quantity'];
    if (qty) parts.push(`Qty: ${qty}`);
    const loc = values['location'];
    if (typeof loc === 'string' && loc) parts.push(loc);
    return parts.join(' · ') || 'Post';
  };

  // ── Reset form ──────────────────────────────────────────────────────────────
  const resetForm = () => {
    setValues({});
    setSelectedMills([]);
    setPendingMill({ id: '', name: '', city: '', price: '' });
    setDeliveryDays('');
    setIsCustomDelivery(false);
    setCustomDeliveryInput('');
    setPaymentMode('FIXED');
    setPaymentValue('30');
    setOpenDropdowns({});
  };

  // ── Save & Add Another ──────────────────────────────────────────────────────
  const handleSaveAndAdd = () => {
    if (!canSubmit) return;
    setQueuedPosts(prev => [
      ...prev,
      { payload: buildPayload(), preview: buildPreview() },
    ]);
    resetForm();
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!canSubmitAny) return;
    setSubmitting(true);
    setSubmitError('');

    // Collect all queued posts + current form into one array for a single API call
    const allPayloads: Record<string, unknown>[] = [
      ...queuedPosts.map(p => p.payload),
      ...(canSubmit ? [buildPayload()] : []),
    ];
    console.log('allPayloads form data:', allPayloads);
    try {
      const response = isBuyer
        ? await api.buyer.createBuyDemandPost(allPayloads)
        : await api.seller.createSupplyPost(allPayloads);

      navigation.navigate('PostCreated', {
        mode: isBuyer ? 'buyer' : 'seller',
        postData: response,
        categoryName,
        totalCount: allPayloads.length,
      });
    } catch (err) {
      if ((err as { code?: string })?.code !== 'AUTH_REQUIRED') {
        setSubmitError(
          isBuyer
            ? 'Unable to create demand. Please try again.'
            : 'Unable to create supply. Please try again.',
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Renderers ───────────────────────────────────────────────────────────────

  const renderFieldLabel = (field: CategoryFormField) => (
    <Text style={styles.fieldLabel}>
      {field.icon ? <Text style={styles.fieldIcon}>{field.icon} </Text> : null}
      {field.label}
      {field.is_required ? (
        <Text style={styles.required}> *</Text>
      ) : (
        <Text style={styles.optional}> (optional)</Text>
      )}
    </Text>
  );

  const renderDropdownField = (field: CategoryFormField) => {
    const options = field.options ?? [];
    const currentValue = values[field.field_key];
    const selectedOpt = options.find(
      o => optionId(o) === String(currentValue ?? ''),
    );
    const isOpen = openDropdowns[field.field_key];

    return (
      <View key={field.id} style={styles.field}>
        {renderFieldLabel(field)}
        <TouchableOpacity
          onPress={() => toggleDropdown(field.field_key)}
          style={[styles.picker, selectedOpt ? styles.pickerSelected : null]}
          activeOpacity={0.8}
        >
          <Text style={[styles.pickerText, !selectedOpt && styles.placeholder]}>
            {selectedOpt
              ? optionLabel(selectedOpt)
              : `Select ${field.label.toLowerCase()}`}
          </Text>
          <Text style={styles.chevron}>▾</Text>
        </TouchableOpacity>
        {isOpen ? (
          <View style={styles.dropdownList}>
            {options.length > 0 ? (
              options.map(opt => {
                const id = optionId(opt);
                const meta = optionMeta(opt);
                const selected = selectedOpt
                  ? optionId(selectedOpt) === id
                  : false;
                return (
                  <TouchableOpacity
                    key={id}
                    onPress={() => {
                      setFieldValue(field.field_key, id);
                      closeDropdowns();
                    }}
                    style={styles.dropdownItem}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        selected && styles.dropdownTextActive,
                      ]}
                    >
                      {optionLabel(opt)}
                    </Text>
                    {meta ? (
                      <Text style={styles.optionMeta}>{meta}</Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={styles.emptyOptionsText}>No options available</Text>
            )}
          </View>
        ) : null}
      </View>
    );
  };

  const renderMultiSelectField = (field: CategoryFormField) => {
    const selectedValues = Array.isArray(values[field.field_key])
      ? (values[field.field_key] as string[])
      : [];
    return (
      <View key={field.id} style={styles.field}>
        {renderFieldLabel(field)}
        <View style={styles.chipRow}>
          {(field.options ?? []).map(opt => {
            const id = optionId(opt);
            const selected = selectedValues.includes(id);
            return (
              <TouchableOpacity
                key={id}
                onPress={() =>
                  setFieldValue(
                    field.field_key,
                    selected
                      ? selectedValues.filter(v => v !== id)
                      : [...selectedValues, id],
                  )
                }
                style={[styles.chip, selected && styles.chipActive]}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.chipText, selected && styles.chipTextActive]}
                >
                  {optionLabel(opt)}
                </Text>
              </TouchableOpacity>
            );
          })}
          {(field.options ?? []).length === 0 ? (
            <Text style={styles.emptyOptionsText}>No options available</Text>
          ) : null}
        </View>
      </View>
    );
  };

  const renderDeliveryOptions = (field: CategoryFormField) => {
    const options = field.options ?? [];
    const selected = values['delivery_options'];
    return (
      <View key={field.id} style={styles.field}>
        {renderFieldLabel(field)}
        <View style={styles.deliveryRow}>
          {options.map(opt => {
            const id = optionId(opt);
            const label = optionLabel(opt);
            const isActive = selected === id;
            const isDelivered = id === 'DELIVERED';
            return (
              <TouchableOpacity
                key={id}
                onPress={() => setFieldValue('delivery_options', id)}
                style={[
                  styles.deliveryCard,
                  isActive && styles.deliveryCardActive,
                ]}
                activeOpacity={0.8}
              >
                <View style={styles.deliveryCardTop}>
                  <View
                    style={[
                      styles.deliveryCardIconBox,
                      isActive && styles.deliveryCardIconBoxActive,
                    ]}
                  >
                    <Text style={styles.deliveryCardEmoji}>
                      {isDelivered ? '🚚' : '📦'}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.deliveryCardLabel,
                      isActive && styles.deliveryCardLabelActive,
                    ]}
                  >
                    {label}
                  </Text>
                </View>
                <Text style={styles.deliveryCardSub}>
                  {isDelivered
                    ? 'You arrange delivery to buyer'
                    : 'Buyer picks up from your location'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderMillsField = (field: CategoryFormField) => {
    const pendingReady = pendingMill.id !== '' && pendingMill.price !== '';
    const alreadyAdded = selectedMills.some(m => m.id === pendingMill.id);
    const canAddMill = pendingReady && !alreadyAdded;

    return (
      <View key={field.id} style={styles.field}>
        {/* Header row */}
        <View style={styles.millsLabelRow}>
          <Text style={styles.fieldLabel}>
            Mills{' '}
            <Text style={styles.optional}>(optional — price auto-fill)</Text>
          </Text>
          {selectedMills.length > 0 ? (
            <Text style={styles.millsCountBadge}>
              {selectedMills.length} added
            </Text>
          ) : null}
        </View>

        {/* Added mills */}
        {selectedMills.map(mill => (
          <View key={mill.id} style={styles.millCard}>
            <View style={styles.millCardIconBox}>
              <Text style={styles.millCardEmoji}>🏭</Text>
            </View>
            <View style={styles.millCardBody}>
              <Text style={styles.millCardName}>{mill.name}</Text>
              <View style={styles.millCardMeta}>
                {mill.city ? (
                  <Text style={styles.millCardCity}>📍 {mill.city}</Text>
                ) : null}
                {mill.price ? (
                  <Text style={styles.millCardPrice}>₨{mill.price}</Text>
                ) : null}
              </View>
            </View>
            <TouchableOpacity
              onPress={() => removeMill(mill.id)}
              style={styles.millRemoveBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.millRemoveText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Add mill box */}
        <View style={styles.addMillBox}>
          <Text style={styles.addMillBoxTitle}>ADD A MILL</Text>

          {/* Mill dropdown */}
          <TouchableOpacity
            onPress={() => toggleDropdown('_millSelect')}
            style={styles.millPicker}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.millPickerText,
                !pendingMill.id && styles.placeholder,
              ]}
            >
              {pendingMill.id ? pendingMill.name : 'Select mill...'}
            </Text>
            <Text style={styles.chevronSmall}>▾</Text>
          </TouchableOpacity>
          {openDropdowns['_millSelect'] ? (
            <View style={styles.dropdownList}>
              {millOptions.length > 0 ? (
                millOptions.map(opt => {
                  const id = optionId(opt);
                  const meta = optionMeta(opt);
                  const added = selectedMills.some(m => m.id === id);
                  return (
                    <TouchableOpacity
                      key={id}
                      onPress={() => !added && selectMillOption(id)}
                      style={[
                        styles.dropdownItem,
                        added && styles.dropdownItemDisabled,
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.dropdownText,
                          pendingMill.id === id && styles.dropdownTextActive,
                        ]}
                      >
                        {optionLabel(opt)}
                      </Text>
                      {meta ? (
                        <Text style={styles.optionMeta}>{meta}</Text>
                      ) : null}
                      {added ? (
                        <Text style={styles.addedBadge}>Added</Text>
                      ) : null}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text style={styles.emptyOptionsText}>No mills available</Text>
              )}
            </View>
          ) : null}

          {/* Location (auto-filled) */}
          <View style={styles.millInputRow}>
            <Text style={styles.millInputIcon}>📍</Text>
            <TextInput
              style={[styles.millInput, styles.millInputReadOnly]}
              placeholder="Location (auto-filled)"
              value={pendingMill.city}
              editable={false}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Price */}
          <View style={styles.millInputRow}>
            <Text style={styles.millPricePrefix}>₨</Text>
            <TextInput
              style={styles.millInput}
              placeholder="Price"
              value={pendingMill.price}
              onChangeText={val => setPendingMillField('price', val)}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Add button */}
          <TouchableOpacity
            onPress={addMill}
            disabled={!canAddMill}
            style={[
              styles.addMillBtn,
              !canAddMill && styles.addMillBtnDisabled,
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.addMillBtnText,
                !canAddMill && styles.addMillBtnTextDisabled,
              ]}
            >
              + Add Mill
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderDeliveryTerms = (field: CategoryFormField) => {
    const hasSelection = isCustomDelivery || deliveryDays !== '';
    const displayLabel = isCustomDelivery
      ? customDeliveryInput
        ? `${customDeliveryInput} days (custom)`
        : 'Custom...'
      : deliveryDays
      ? `${deliveryDays} day${Number(deliveryDays) !== 1 ? 's' : ''}`
      : 'Select delivery window...';

    const hintText =
      !isCustomDelivery && deliveryDays
        ? `Committed to deliver within ${deliveryDays} day${
            Number(deliveryDays) !== 1 ? 's' : ''
          } of deal creation`
        : isCustomDelivery &&
          customDeliveryInput &&
          Number(customDeliveryInput) > 0
        ? `Committed to deliver within ${customDeliveryInput} day${
            Number(customDeliveryInput) !== 1 ? 's' : ''
          } of deal creation`
        : null;

    return (
      <View key={field.id} style={styles.field}>
        {renderFieldLabel(field)}
        <Text style={styles.fieldHint}>
          Committed delivery window from deal confirmation. Late delivery
          triggers a dispute.
        </Text>

        <TouchableOpacity
          onPress={() => toggleDropdown('_deliveryDays')}
          style={[styles.picker, hasSelection && styles.pickerSelected]}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.pickerText, !hasSelection && styles.placeholder]}
          >
            {displayLabel}
          </Text>
          <Text style={styles.chevron}>▾</Text>
        </TouchableOpacity>

        {openDropdowns['_deliveryDays'] ? (
          <View style={styles.dropdownList}>
            {DELIVERY_DAY_PRESETS.map(d => (
              <TouchableOpacity
                key={d}
                onPress={() => {
                  setDeliveryDays(d);
                  setIsCustomDelivery(false);
                  setCustomDeliveryInput('');
                  closeDropdowns();
                }}
                style={styles.dropdownItem}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    deliveryDays === d &&
                      !isCustomDelivery &&
                      styles.dropdownTextActive,
                  ]}
                >
                  {d} day{Number(d) !== 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => {
                setIsCustomDelivery(true);
                setDeliveryDays('');
                closeDropdowns();
              }}
              style={styles.dropdownItem}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.dropdownText,
                  isCustomDelivery && styles.dropdownTextActive,
                ]}
              >
                Custom...
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {isCustomDelivery ? (
          <View style={styles.customDaysRow}>
            <TextInput
              style={styles.customDaysInput}
              placeholder="Enter number of days"
              value={customDeliveryInput}
              onChangeText={setCustomDeliveryInput}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.customDaysSuffix}>days</Text>
          </View>
        ) : null}

        {hintText ? (
          <View style={styles.deliveryHintRow}>
            <Text style={styles.deliveryHintCheck}>✓</Text>
            <Text style={styles.deliveryHintText}>{hintText}</Text>
          </View>
        ) : null}
      </View>
    );
  };

  const renderPaymentField = (field: CategoryFormField) => {
    const paymentOptions =
      paymentMode === 'FIXED' ? PAYMENT_FIXED_DAYS : PAYMENT_WEEKLY_PERCENT;
    const paymentLabel = paymentValue
      ? paymentMode === 'FIXED'
        ? `Full payment in ${paymentValue} days`
        : `${paymentValue}% weekly`
      : 'Pay within how many days?';

    return (
      <View key={field.id} style={styles.field}>
        {renderFieldLabel(field)}
        <Text style={styles.fieldHint}>
          Payment is made after delivery is confirmed
        </Text>

        {/* Segmented toggle */}
        <View style={styles.paymentSegmentBg}>
          {(['FIXED', 'WEEKLY'] as PaymentMode[]).map(pm => (
            <TouchableOpacity
              key={pm}
              onPress={() => setNextPaymentMode(pm)}
              style={[
                styles.paymentSegmentBtn,
                paymentMode === pm && styles.paymentSegmentBtnActive,
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.paymentSegmentText,
                  paymentMode === pm && styles.paymentSegmentTextActive,
                ]}
              >
                {pm === 'FIXED' ? 'Fixed Days' : 'Weekly %'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Value dropdown */}
        <TouchableOpacity
          onPress={() => toggleDropdown('_payment')}
          style={[styles.picker, paymentValue ? styles.pickerSelected : null]}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.pickerText, !paymentValue && styles.placeholder]}
          >
            {paymentLabel}
          </Text>
          <Text style={styles.chevron}>▾</Text>
        </TouchableOpacity>

        {openDropdowns['_payment'] ? (
          <View style={styles.dropdownList}>
            {paymentOptions.map(opt => {
              const label =
                paymentMode === 'FIXED'
                  ? `Full payment in ${opt} days`
                  : `${opt}% weekly`;
              return (
                <TouchableOpacity
                  key={opt}
                  onPress={() => {
                    setPaymentValue(opt);
                    closeDropdowns();
                  }}
                  style={styles.dropdownItem}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      paymentValue === opt && styles.dropdownTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}
      </View>
    );
  };

  const renderInputField = (field: CategoryFormField) => {
    const isNumber = field.field_type?.toLowerCase() === 'number';
    const value =
      typeof values[field.field_key] === 'string'
        ? (values[field.field_key] as string)
        : '';

    return (
      <View key={field.id} style={styles.field}>
        {renderFieldLabel(field)}
        <View style={styles.priceInputRow}>
          {isNumber && field.field_key === 'price' ? (
            <Text style={styles.pricePrefix}>₨</Text>
          ) : null}
          <TextInput
            style={[
              styles.input,
              isNumber && field.field_key === 'price' && styles.inputWithPrefix,
            ]}
            placeholder={
              isNumber
                ? field.field_key === 'price'
                  ? 'e.g. 4200'
                  : 'Enter amount'
                : `Enter ${field.label.toLowerCase()}`
            }
            keyboardType={isNumber ? 'numeric' : 'default'}
            value={value}
            onChangeText={text => setFieldValue(field.field_key, text)}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>
    );
  };

  const renderField = (field: CategoryFormField) => {
    const key = field.field_key;
    const type = field.field_type?.toLowerCase();

    // Hide standalone price when mills are selected
    if (key === 'price' && selectedMills.length > 0) return null;

    // Custom renderers by field_key
    if (key === 'delivery_options') return renderDeliveryOptions(field);
    if (key === 'mills') return renderMillsField(field);
    if (key === 'delivery_terms') return renderDeliveryTerms(field);
    if (key === 'payment_terms' || type === 'payment_terms')
      return renderPaymentField(field);

    // Standard renderers
    if (type === 'dropdown') return renderDropdownField(field);
    if (type === 'multi_select') return renderMultiSelectField(field);
    return renderInputField(field);
  };

  // ── Submit label ─────────────────────────────────────────────────────────────
  const totalToSubmit = queuedPosts.length + (canSubmit ? 1 : 0);
  const submitLabel =
    totalToSubmit > 1
      ? `Submit ${totalToSubmit} ${isBuyer ? 'Demands' : 'Supplies'}`
      : `Publish ${isBuyer ? 'Demand' : 'Supply'}`;

  // ── Main render ──────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <MockStatusBar backgroundColor="#FFFFFF" textColor="#111827" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goBack}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isBuyer ? 'Create Demand' : 'Create Supply'}
        </Text>
        <View style={styles.categoryChip}>
          <Text style={styles.categoryChipText} numberOfLines={1}>
            {categoryName}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color="#217A3C" />
          <Text style={styles.stateText}>Loading form...</Text>
        </View>
      ) : loadError ? (
        <View style={styles.centerState} />
      ) : (
        <>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Queued posts banner */}
            {queuedPosts.length > 0 ? (
              <View style={styles.queueBanner}>
                <Text style={styles.queueBannerTitle}>
                  {queuedPosts.length} {isBuyer ? 'demand' : 'supply'}
                  {queuedPosts.length > 1 ? 's' : ''} saved — fill below to add
                  more
                </Text>
                {queuedPosts.map((qp, i) => (
                  <View key={i} style={styles.queueItem}>
                    <Text style={styles.queueItemDot}>•</Text>
                    <Text style={styles.queueItemText} numberOfLines={1}>
                      {qp.preview}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Form card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {isBuyer ? 'Post Details' : 'Listing Details'}
              </Text>

              {sortedFields.map(renderField)}

              {/* Save & Add Another */}
              <TouchableOpacity
                onPress={handleSaveAndAdd}
                disabled={!canSubmit}
                style={[
                  styles.saveAddBtn,
                  !canSubmit && styles.saveAddBtnDisabled,
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.saveAddBtnText,
                    !canSubmit && styles.saveAddBtnTextDisabled,
                  ]}
                >
                  + Save & Add Another
                </Text>
              </TouchableOpacity>
            </View>

            {submitError ? (
              <Text style={styles.submitError}>{submitError}</Text>
            ) : null}
          </ScrollView>

          {/* Fixed bottom bar */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!canSubmitAny || submitting}
              style={[
                styles.submitButton,
                (!canSubmitAny || submitting) && styles.submitButtonDisabled,
              ]}
              activeOpacity={0.86}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {!canSubmitAny
                    ? 'Fill the form above to continue'
                    : submitLabel}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  backArrow: { fontSize: 22, color: '#111827', lineHeight: 24 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  categoryChip: {
    maxWidth: 120,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#E8F7EE',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryChipText: { fontSize: 11, color: '#1A6B34', fontWeight: '700' },

  // States
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  stateText: { marginTop: 10, color: '#6B7280', fontSize: 13 },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 110 },

  // Queued banner
  queueBanner: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  queueBannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
    marginBottom: 6,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  queueItemDot: { fontSize: 10, color: '#15803D' },
  queueItemText: { fontSize: 11, color: '#166534', flex: 1 },

  // Form card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 14,
  },

  // Field
  field: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 7,
  },
  fieldIcon: { fontSize: 12 },
  required: { color: '#EF4444' },
  optional: { color: '#9CA3AF', fontWeight: '400' },
  fieldHint: { fontSize: 11, color: '#9CA3AF', marginBottom: 8 },

  // Picker / dropdown
  picker: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  pickerSelected: { borderColor: '#2E9E52' },
  pickerText: { flex: 1, fontSize: 13, color: '#111827', fontWeight: '600' },
  placeholder: { color: '#9CA3AF', fontWeight: '400' },
  chevron: { fontSize: 13, color: '#9CA3AF', marginLeft: 8 },
  chevronSmall: { fontSize: 12, color: '#9CA3AF', marginLeft: 6 },
  dropdownList: {
    marginTop: 4,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    zIndex: 100,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemDisabled: { opacity: 0.45 },
  dropdownText: { fontSize: 13, color: '#374151', fontWeight: '600' },
  dropdownTextActive: { color: '#217A3C' },
  optionMeta: { marginTop: 2, fontSize: 11, color: '#6B7280' },
  emptyOptionsText: { padding: 10, color: '#9CA3AF', fontSize: 12 },
  addedBadge: {
    fontSize: 10,
    color: '#217A3C',
    fontWeight: '700',
    marginTop: 2,
  },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  chipActive: { backgroundColor: '#217A3C', borderColor: '#217A3C' },
  chipText: { fontSize: 11, color: '#4B5563', fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF' },

  // Delivery option cards
  deliveryRow: { flexDirection: 'row', gap: 8 },
  deliveryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  deliveryCardActive: { borderColor: '#2E9E52', backgroundColor: '#F2FBF5' },
  deliveryCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  deliveryCardIconBox: {
    width: 24,
    height: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryCardIconBoxActive: { backgroundColor: '#217A3C' },
  deliveryCardEmoji: { fontSize: 12 },
  deliveryCardLabel: { fontSize: 12, fontWeight: '700', color: '#374151' },
  deliveryCardLabelActive: { color: '#1A6B34' },
  deliveryCardSub: { fontSize: 10, color: '#9CA3AF' },

  // Mills
  millsLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  millsCountBadge: { fontSize: 11, color: '#217A3C', fontWeight: '700' },
  millCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2FBF5',
    borderRadius: 11,
    padding: 10,
    marginBottom: 8,
    gap: 10,
  },
  millCardIconBox: {
    width: 34,
    height: 34,
    backgroundColor: '#E8F7EE',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  millCardEmoji: { fontSize: 15 },
  millCardBody: { flex: 1 },
  millCardName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  millCardMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
    alignItems: 'center',
  },
  millCardCity: { fontSize: 11, color: '#6B7280' },
  millCardPrice: { fontSize: 11, color: '#1A6B34', fontWeight: '700' },
  millRemoveBtn: {
    width: 28,
    height: 28,
    backgroundColor: '#FEE2E2',
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  millRemoveText: { fontSize: 13, color: '#EF4444', fontWeight: '700' },
  addMillBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
  },
  addMillBoxTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  millPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
    marginBottom: 6,
  },
  millPickerText: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  millInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    marginBottom: 6,
    paddingHorizontal: 11,
  },
  millInputIcon: { fontSize: 12, marginRight: 4 },
  millPricePrefix: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    marginRight: 4,
  },
  millInput: { flex: 1, fontSize: 12, color: '#374151', paddingVertical: 9 },
  millInputReadOnly: { color: '#6B7280' },
  addMillBtn: {
    backgroundColor: '#217A3C',
    borderRadius: 9,
    padding: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMillBtnDisabled: { backgroundColor: '#F3F4F6' },
  addMillBtnText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  addMillBtnTextDisabled: { color: '#9CA3AF' },

  // Delivery terms
  customDaysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  customDaysInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#2E9E52',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  customDaysSuffix: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  deliveryHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  deliveryHintCheck: { fontSize: 11, color: '#217A3C' },
  deliveryHintText: { fontSize: 11, color: '#1A6B34' },

  // Payment
  paymentSegmentBg: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 3,
    marginBottom: 10,
  },
  paymentSegmentBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  paymentSegmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  paymentSegmentText: { fontSize: 12, fontWeight: '500', color: '#6B7280' },
  paymentSegmentTextActive: { fontWeight: '700', color: '#111827' },

  // Input
  priceInputRow: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  pricePrefix: {
    position: 'absolute',
    left: 12,
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    zIndex: 1,
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#111827',
  },
  inputWithPrefix: { paddingLeft: 26 },

  // Save & Add button
  saveAddBtn: {
    marginTop: 6,
    paddingVertical: 11,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  saveAddBtnDisabled: { opacity: 0.45 },
  saveAddBtnText: { fontSize: 13, fontWeight: '700', color: '#374151' },
  saveAddBtnTextDisabled: { color: '#9CA3AF' },

  // Submit error
  submitError: {
    marginBottom: 8,
    color: '#DC2626',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  submitButton: {
    minHeight: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#217A3C',
  },
  submitButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.01,
  },
});

export default CategoryPostForm;
