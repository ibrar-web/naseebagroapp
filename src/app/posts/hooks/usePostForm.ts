import { useState, useMemo, useEffect, useRef } from 'react';
import { CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, CategoryRouteParam } from '../../../navigation/types';
import api from '../../../utils/api';
import type {
  CategoryForm, FieldValue, FieldOption, MillEntry,
  FormSnapshot, QueuedPost, PostFormMode, PaymentMode,
} from '../types/postForm.types';
import type { PostPrefillData } from '../../../navigation/types';

export const labelKey = (label: string) =>
  label.toLowerCase().replace(/\s+/g, '_');

const FIELD_ORDER = [
  'commodity', 'delivery_options', 'mills', 'quantity', 'units',
  'target_price', 'location', 'payment_terms', 'delivery_terms', 'grades',
];

const parseNumber = (v: FieldValue) => {
  if (typeof v !== 'string') return null;
  const n = Number(v.replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : null;
};

const normalizeForm = (res: any): CategoryForm | null => {
  const item = res?.item ?? res?.data?.item ?? res?.data?.data?.item ?? res;
  return item && Array.isArray(item?.fields) ? item : null;
};

const isFilled = (value: FieldValue, type: string) => {
  if (type === 'multi_select') return Array.isArray(value) && value.length > 0;
  return value !== null && value !== undefined && String(value).trim() !== '';
};

type Options = {
  categoryData?: CategoryRouteParam;
  categoryName: string;
  mode: PostFormMode;
  navigation: NativeStackNavigationProp<RootStackParamList>;
  prefillData?: PostPrefillData;
  postId?: string;
};

export const usePostForm = ({ categoryData, categoryName, mode, navigation, prefillData, postId }: Options) => {
  const isBuyer = mode === 'buyer';

  const [form, setForm] = useState<CategoryForm | null>(null);
  const [values, setValues] = useState<Record<string, FieldValue>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('FIXED');
  const [paymentValue, setPaymentValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [noForm, setNoForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [selectedMills, setSelectedMills] = useState<MillEntry[]>([]);
  const [pendingMill, setPendingMill] = useState<MillEntry>({ id: '', name: '', city: '', price: '' });
  const [deliveryDays, setDeliveryDays] = useState('');
  const [isCustomDelivery, setIsCustomDelivery] = useState(false);
  const [customDeliveryInput, setCustomDeliveryInput] = useState('');
  const [queuedPosts, setQueuedPosts] = useState<QueuedPost[]>([]);
  const prefillRef = useRef(prefillData);

  const sortedFields = useMemo(
    () => [...(form?.fields ?? [])].sort((a, b) => {
      const ai = FIELD_ORDER.indexOf(labelKey(a.label));
      const bi = FIELD_ORDER.indexOf(labelKey(b.label));
      if (ai === -1 && bi === -1) return (a.sort_order ?? 0) - (b.sort_order ?? 0);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    }),
    [form],
  );

  const findField = (lk: string) => sortedFields.find(f => labelKey(f.label) === lk);
  const paymentField = findField('payment_terms');
  const millsField = findField('mills');

  const effectiveDeliveryDays = isCustomDelivery ? customDeliveryInput : deliveryDays;

  const formIsValid = sortedFields.every(field => {
    if (!field.is_required) return true;
    const lk = labelKey(field.label);
    const type = field.field_type?.toLowerCase();
    if (lk === 'payment_terms') return paymentValue.trim().length > 0;
    if (lk === 'delivery_terms') return effectiveDeliveryDays.trim().length > 0;
    if (lk === 'mills') return selectedMills.length > 0;
    if (lk === 'location') return Boolean((values[field.id] as { id?: string } | null)?.id);
    return isFilled(values[field.id], type ?? '');
  });

  const canSubmit = Boolean(categoryData?.id && form && formIsValid && !submitting);
  const canSubmitAny = canSubmit || queuedPosts.length > 0;

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!categoryData?.id) { setLoading(false); setLoadError(postId ? 'Unable to load form. Please go back and try again.' : 'Select a category first.'); return; }
      setLoading(true); setLoadError(''); setNoForm(false);
      try {
        const res = isBuyer
          ? await api.buyer.getBuyerCategoryform(categoryData.id)
          : await api.seller.getSellerCategoryform(categoryData.id);
        const next = normalizeForm(res);
        if (!mounted) return;
        if (!next) { setNoForm(true); return; }
        setForm(next);

        const fill = prefillRef.current;
        if (fill) {
          const initialValues: Record<string, FieldValue> = {};
          for (const field of next.fields) {
            const lk = labelKey(field.label);
            if (lk === 'commodity' && fill.commodity_id) {
              initialValues[field.id] = fill.commodity_id;
            } else if (lk === 'quantity' && fill.quantity != null) {
              initialValues[field.id] = fill.quantity;
            } else if (lk === 'target_price' && fill.price_per_unit != null) {
              initialValues[field.id] = fill.price_per_unit;
            } else if (lk === 'delivery_options' && fill.delivery_option) {
              initialValues[field.id] = fill.delivery_option;
            } else if (lk === 'location' && fill.city_id && fill.city_name) {
              initialValues[field.id] = { id: fill.city_id, name: fill.city_name };
            } else if (lk === 'grades' && fill.grades?.length) {
              initialValues[field.id] = fill.grades;
            }
          }
          setValues(initialValues);

          if (fill.payment_type) {
            setPaymentMode(fill.payment_type as PaymentMode);
            setPaymentValue(fill.payment_term_id ?? '');
          }
          if (fill.delivery_term_id) {
            setDeliveryDays(fill.delivery_term_id);
          }
          if (fill.mills?.length) {
            setSelectedMills(fill.mills.map(m => ({
              id: m.id ?? '',
              name: m.name ?? '',
              city: m.city ?? '',
              price: m.price ?? '',
              isCustom: !m.id,
            })));
          }
        }
      } catch (err: any) {
        if (!mounted) return;
        const status = err?.response?.status ?? err?.status;
        if (status === 404 || String(err?.response?.data?.message ?? '').toLowerCase().includes('not found')) {
          setNoForm(true);
        } else {
          setLoadError('Unable to load form. Please try again.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [categoryData?.id, isBuyer, postId]);

  const goBack = () => {
    if (navigation.canGoBack()) { navigation.goBack(); return; }
    navigation.dispatch(CommonActions.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Post', params: { initialTab: 'posts' } } }],
    }));
  };

  const setFieldValue = (fieldId: string, value: FieldValue) =>
    setValues(prev => ({ ...prev, [fieldId]: value }));

  const toggleDropdown = (id: string) =>
    setOpenDropdown(prev => (prev === id ? null : id));

  const closeDropdown = () => setOpenDropdown(null);

  const setNextPaymentMode = (next: PaymentMode) => { setPaymentMode(next); setPaymentValue(''); };

  const selectMillOption = (millId: string, opts: FieldOption[]) => {
    if (millId === '__other__') {
      setPendingMill({ id: '__other__', name: '', city: '', price: '', isCustom: true });
      closeDropdown();
      return;
    }
    const opt = opts.find(o => String(o.id ?? o.value ?? '') === millId);
    if (!opt) return;
    setPendingMill({ id: millId, name: String(opt.name ?? ''), city: opt.city ?? '', price: '', isCustom: false });
    closeDropdown();
  };

  const addMill = () => {
    if (pendingMill.isCustom) {
      if (!pendingMill.name.trim() || !pendingMill.city.trim() || !pendingMill.price.trim()) return;
      const tempId = `__custom_${Date.now()}`;
      setSelectedMills(prev => [...prev, { ...pendingMill, id: tempId }]);
    } else {
      if (!pendingMill.id || !pendingMill.price || selectedMills.some(m => m.id === pendingMill.id)) return;
      setSelectedMills(prev => [...prev, { ...pendingMill }]);
    }
    setPendingMill({ id: '', name: '', city: '', price: '', isCustom: false });
  };

  const removeMill = (id: string) => setSelectedMills(prev => prev.filter(m => m.id !== id));

  const buildPayload = (): Record<string, unknown> => {
    const payload: Record<string, unknown> = { category_id: categoryData?.id ?? form?.category_id };
    for (const field of sortedFields) {
      const lk = labelKey(field.label);
      const type = field.field_type?.toLowerCase();
      if (lk === 'payment_terms' || lk === 'mills') continue;
      if (lk === 'target_price' && selectedMills.length > 0) continue;
      if (lk === 'delivery_terms') {
        payload[lk] = isCustomDelivery ? customDeliveryInput : (deliveryDays || null);
        continue;
      }
      if (lk === 'location') {
        const cv = values[field.id] as { id?: string; name?: string } | null;
        payload.city_id = cv?.id ?? null;
        payload.location = cv?.name ?? null;
        continue;
      }
      if (type === 'number') { payload[lk] = parseNumber(values[field.id]); continue; }
      if (type === 'multi_select') { payload[lk] = Array.isArray(values[field.id]) ? values[field.id] : []; continue; }
      payload[lk] = values[field.id] ?? null;
    }
    if (paymentField) {
      payload.payment_terms = {
        type: paymentMode,
        fixed_days: paymentMode === 'FIXED' ? (paymentValue || null) : null,
        weekly_percent: paymentMode === 'WEEKLY' ? (paymentValue || null) : null,
      };
    }
    if (selectedMills.length > 0) {
      payload.mills = selectedMills.map(m =>
        m.isCustom
          ? { name: m.name, city: m.city, price: parseFloat(m.price) || 0 }
          : { id: m.id, price: parseFloat(m.price) || 0 },
      );
    }
    return payload;
  };

  const buildPreview = (): string => {
    const parts: string[] = [];
    const cf = findField('commodity');
    if (cf) { const opt = cf.options?.find(o => String(o.id ?? o.value ?? '') === String(values[cf.id] ?? '')); if (opt) parts.push(String(opt.name ?? '')); }
    const qf = findField('quantity');
    if (qf && values[qf.id]) parts.push(`Qty: ${values[qf.id]}`);
    const lf = findField('location');
    if (lf) {
      const cv = values[lf.id] as { name?: string } | null;
      if (cv?.name) parts.push(cv.name);
    }
    return parts.join(' · ') || 'Post';
  };

  const resetForm = () => {
    setValues({}); setSelectedMills([]); setPendingMill({ id: '', name: '', city: '', price: '', isCustom: false });
    setDeliveryDays(''); setIsCustomDelivery(false); setCustomDeliveryInput('');
    setPaymentMode('FIXED'); setPaymentValue(''); setOpenDropdown(null);
  };

  const handleSaveAndAdd = () => {
    if (!canSubmit) return;
    const snap: FormSnapshot = { values: { ...values }, selectedMills: [...selectedMills], deliveryDays, isCustomDelivery, customDeliveryInput, paymentMode, paymentValue };
    setQueuedPosts(prev => [...prev, { payload: buildPayload(), preview: buildPreview(), formSnapshot: snap }]);
    resetForm();
  };

  const removeQueuedPost = (i: number) => setQueuedPosts(prev => prev.filter((_, idx) => idx !== i));

  const editQueuedPost = (i: number) => {
    const { formSnapshot: s } = queuedPosts[i];
    setValues(s.values); setSelectedMills(s.selectedMills); setDeliveryDays(s.deliveryDays);
    setIsCustomDelivery(s.isCustomDelivery); setCustomDeliveryInput(s.customDeliveryInput);
    setPaymentMode(s.paymentMode); setPaymentValue(s.paymentValue);
    setQueuedPosts(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    if (!canSubmitAny) return;
    setSubmitting(true); setSubmitError('');

    if (postId) {
      try {
        const payload = buildPayload();
        if (isBuyer) {
          await api.buyer.updateDemandPost(postId, payload);
        } else {
          await api.seller.updateSupplyPost(postId, payload);
        }
        if (navigation.canGoBack()) navigation.goBack();
      } catch (err: any) {
        if (err?.code !== 'AUTH_REQUIRED') setSubmitError(isBuyer ? 'Unable to update demand.' : 'Unable to update supply.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    const payloads = [...queuedPosts.map(p => p.payload), ...(canSubmit ? [buildPayload()] : [])];
    try {
      const res = isBuyer
        ? await api.buyer.createBuyDemandPost(payloads)
        : await api.seller.createSupplyPost(payloads);
      navigation.navigate('PostCreated', { mode: isBuyer ? 'buyer' : 'seller', postData: res, categoryName, totalCount: payloads.length });
    } catch (err: any) {
      if (err?.code !== 'AUTH_REQUIRED') setSubmitError(isBuyer ? 'Unable to create demand.' : 'Unable to create supply.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    form, sortedFields, values, openDropdown,
    paymentMode, paymentValue, setNextPaymentMode, setPaymentValue,
    loading, loadError, noForm, submitting, submitError,
    selectedMills, pendingMill, setPendingMill,
    deliveryDays, setDeliveryDays,
    isCustomDelivery, setIsCustomDelivery,
    customDeliveryInput, setCustomDeliveryInput,
    queuedPosts,
    paymentField, millsField, effectiveDeliveryDays,
    canSubmit, canSubmitAny, isBuyer,
    goBack, setFieldValue, toggleDropdown, closeDropdown,
    selectMillOption, addMill, removeMill,
    handleSaveAndAdd, removeQueuedPost, editQueuedPost, handleSubmit,
  };
};
