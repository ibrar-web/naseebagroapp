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

type Props = {
  categoryName: string;
  categoryData?: CategoryRouteParam;
  mode: PostFormMode;
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const PAYMENT_FIXED_DAYS = ['3', '7', '15', '30'];
const PAYMENT_WEEKLY_PERCENT = ['25', '50', '75', '100'];

const parseNumber = (value: FieldValue) => {
  if (typeof value !== 'string') {
    return null;
  }

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

  if (!item || typeof item !== 'object' || !Array.isArray(item.fields)) {
    return null;
  }

  return {
    ...item,
    fields: item.fields,
  };
};

const isFilled = (value: FieldValue, fieldType: string) => {
  if (fieldType === 'multi_select') {
    return Array.isArray(value) && value.length > 0;
  }

  return value !== null && value !== undefined && String(value).trim() !== '';
};

const valueForPayload = (field: CategoryFormField, value: FieldValue) => {
  const fieldType = field.field_type?.toLowerCase();

  if (fieldType === 'number') {
    return parseNumber(value);
  }

  if (fieldType === 'multi_select') {
    return Array.isArray(value) ? value : [];
  }

  return value || null;
};

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

  const categoryId = categoryData?.id ?? form?.category_id;

  const sortedFields = useMemo(
    () =>
      [...(form?.fields ?? [])].sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
      ),
    [form],
  );

  const paymentField = sortedFields.find(
    field =>
      field.field_key === 'payment_terms' ||
      field.field_type?.toLowerCase() === 'payment_terms',
  );

  const formIsValid = sortedFields.every(field => {
    const fieldType = field.field_type?.toLowerCase();

    if (field.field_key === 'payment_terms' || fieldType === 'payment_terms') {
      return !field.is_required || paymentValue.trim().length > 0;
    }

    if (!field.is_required) {
      return true;
    }

    return isFilled(values[field.field_key], fieldType);
  });

  const canSubmit = Boolean(categoryId && form && formIsValid && !submitting);

  useEffect(() => {
    if (!loadError) {
      return;
    }

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
        console.log('response: form data', response);
        if (!mounted) {
          return;
        }

        if (!nextForm) {
          setForm(null);
          setLoadError('No form is configured for this category.');
          return;
        }

        setForm(nextForm);
        setValues({});
      } catch {
        if (!mounted) {
          return;
        }

        setLoadError('Unable to load the category form. Please try again.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadForm();

    return () => {
      mounted = false;
    };
  }, [categoryData?.id, isBuyer]);

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

  const setFieldValue = (fieldKey: string, value: FieldValue) => {
    setValues(prev => ({
      ...prev,
      [fieldKey]: value,
    }));
  };

  const toggleDropdown = (fieldKey: string) => {
    setOpenDropdowns(prev => ({
      [fieldKey]: !prev[fieldKey],
    }));
  };

  const setNextPaymentMode = (nextMode: PaymentMode) => {
    setPaymentMode(nextMode);
    setPaymentValue(nextMode === 'FIXED' ? '30' : '50');
  };

  const buildPayload = () => {
    const payload = sortedFields.reduce<Record<string, unknown>>(
      (acc, field) => {
        const fieldType = field.field_type?.toLowerCase();

        if (
          field.field_key === 'payment_terms' ||
          fieldType === 'payment_terms'
        ) {
          return acc;
        }

        acc[field.field_key] = valueForPayload(field, values[field.field_key]);
        return acc;
      },
      {
        category_id: categoryId,
      },
    );

    if (paymentField) {
      payload.payment_terms = {
        type: paymentMode,
        fixed_days: paymentMode === 'FIXED' ? parseNumber(paymentValue) : null,
        weekly_percent:
          paymentMode === 'WEEKLY' ? parseNumber(paymentValue) : null,
      };
    }

    return payload;
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const response = isBuyer
        ? await api.buyer.createBuyDemandPost(buildPayload())
        : await api.seller.createSupplyPost(buildPayload());

      navigation.navigate('PostCreated', {
        mode: isBuyer ? 'buyer' : 'seller',
        postData: response,
        categoryName,
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
    const selectedOption = options.find(
      option => optionId(option) === String(currentValue ?? ''),
    );

    return (
      <View key={field.id} style={styles.field}>
        {renderFieldLabel(field)}
        <TouchableOpacity
          onPress={() => toggleDropdown(field.field_key)}
          style={styles.picker}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.pickerText, !selectedOption && styles.placeholder]}
          >
            {selectedOption
              ? optionLabel(selectedOption)
              : `Select ${field.label.toLowerCase()}`}
          </Text>
          <Text style={styles.chevron}>v</Text>
        </TouchableOpacity>
        {openDropdowns[field.field_key] ? (
          <View style={styles.dropdownList}>
            {options.length > 0 ? (
              options.map(option => {
                const id = optionId(option);
                const meta = optionMeta(option);
                const selected = selectedOption
                  ? optionId(selectedOption) === id
                  : false;

                return (
                  <TouchableOpacity
                    key={id}
                    onPress={() => {
                      setFieldValue(field.field_key, id);
                      setOpenDropdowns({});
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
                      {optionLabel(option)}
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
          {(field.options ?? []).map(option => {
            const id = optionId(option);
            const selected = selectedValues.includes(id);

            return (
              <TouchableOpacity
                key={id}
                onPress={() => {
                  setFieldValue(
                    field.field_key,
                    selected
                      ? selectedValues.filter(value => value !== id)
                      : [...selectedValues, id],
                  );
                }}
                style={[styles.chip, selected && styles.chipActive]}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.chipText, selected && styles.chipTextActive]}
                >
                  {optionLabel(option)}
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

  const renderPaymentField = (field: CategoryFormField) => {
    const paymentOptions =
      paymentMode === 'FIXED' ? PAYMENT_FIXED_DAYS : PAYMENT_WEEKLY_PERCENT;

    return (
      <View key={field.id} style={styles.field}>
        {renderFieldLabel(field)}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            onPress={() => setNextPaymentMode('FIXED')}
            style={[
              styles.toggleButton,
              paymentMode === 'FIXED' && styles.toggleButtonActive,
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleText,
                paymentMode === 'FIXED' && styles.toggleTextActive,
              ]}
            >
              Fixed Days
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setNextPaymentMode('WEEKLY')}
            style={[
              styles.toggleButton,
              paymentMode === 'WEEKLY' && styles.toggleButtonActive,
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleText,
                paymentMode === 'WEEKLY' && styles.toggleTextActive,
              ]}
            >
              Weekly %
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.chipRow}>
          {paymentOptions.map(option => {
            const selected = paymentValue === option;
            const suffix = paymentMode === 'FIXED' ? ' days' : '%';

            return (
              <TouchableOpacity
                key={option}
                onPress={() => setPaymentValue(option)}
                style={[styles.chip, selected && styles.chipActive]}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.chipText, selected && styles.chipTextActive]}
                >
                  {option}
                  {suffix}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderInputField = (field: CategoryFormField) => {
    const fieldType = field.field_type?.toLowerCase();
    const isNumber = fieldType === 'number';
    const value =
      typeof values[field.field_key] === 'string'
        ? (values[field.field_key] as string)
        : '';

    return (
      <View key={field.id} style={styles.field}>
        {renderFieldLabel(field)}
        <TextInput
          style={styles.input}
          placeholder={
            isNumber ? 'Enter amount' : `Enter ${field.label.toLowerCase()}`
          }
          keyboardType={isNumber ? 'numeric' : 'default'}
          value={value}
          onChangeText={text => setFieldValue(field.field_key, text)}
          placeholderTextColor="#9CA3AF"
        />
      </View>
    );
  };

  const renderField = (field: CategoryFormField) => {
    const fieldType = field.field_type?.toLowerCase();

    if (field.field_key === 'payment_terms' || fieldType === 'payment_terms') {
      return renderPaymentField(field);
    }

    if (fieldType === 'dropdown') {
      return renderDropdownField(field);
    }

    if (fieldType === 'multi_select') {
      return renderMultiSelectField(field);
    }

    return renderInputField(field);
  };

  return (
    <View style={styles.container}>
      <MockStatusBar backgroundColor="#FFFFFF" textColor="#111827" />
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
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {isBuyer ? 'Demand Details' : 'Listing Details'}
            </Text>
            {sortedFields.map(renderField)}
          </View>

          {submitError ? (
            <Text style={styles.submitError}>{submitError}</Text>
          ) : null}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={[
              styles.submitButton,
              !canSubmit && styles.submitButtonDisabled,
            ]}
            activeOpacity={0.86}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isBuyer ? 'Publish Demand' : 'Publish Supply'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#ECFDF3',
    borderWidth: 1,
    borderColor: '#CFE9D9',
  },
  categoryChipText: {
    fontSize: 11,
    color: '#217A3C',
    fontWeight: '700',
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 36 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 18,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '800',
    marginBottom: 18,
  },
  field: { marginBottom: 18 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  fieldIcon: { fontSize: 13 },
  required: { color: '#DC2626' },
  optional: { color: '#9CA3AF', fontWeight: '500' },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#111827',
  },
  picker: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  pickerText: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  placeholder: { color: '#9CA3AF', fontWeight: '500' },
  chevron: { fontSize: 13, color: '#6B7280', marginLeft: 10 },
  dropdownList: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  dropdownTextActive: { color: '#217A3C' },
  optionMeta: { marginTop: 3, fontSize: 11, color: '#6B7280' },
  emptyOptionsText: {
    paddingVertical: 10,
    color: '#9CA3AF',
    fontSize: 13,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 34,
    borderRadius: 999,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: { backgroundColor: '#217A3C', borderColor: '#217A3C' },
  chipText: { fontSize: 12, color: '#374151', fontWeight: '700' },
  chipTextActive: { color: '#FFFFFF' },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  toggleButton: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  toggleButtonActive: {
    backgroundColor: '#217A3C',
    borderColor: '#217A3C',
  },
  toggleText: { fontSize: 12, color: '#374151', fontWeight: '800' },
  toggleTextActive: { color: '#FFFFFF' },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  stateText: { marginTop: 10, color: '#6B7280', fontSize: 13 },
  submitError: {
    marginTop: 14,
    color: '#DC2626',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  },
  submitButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#217A3C',
    marginTop: 18,
  },
  submitButtonDisabled: { opacity: 0.45 },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});

export default CategoryPostForm;
