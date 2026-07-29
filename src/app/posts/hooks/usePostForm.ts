import { useState, useMemo, useEffect, useRef } from 'react';
import { CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, CategoryRouteParam, CommodityRouteParam } from '../../../navigation/types';
import api from '../../../utils/api';
import type {
  CategoryForm, FieldValue, FieldOption, MillEntry,
  FormSnapshot, QueuedPost, PostFormMode, PaymentMode,
} from '../types/postForm.types';
import type { PostPrefillData } from '../../../navigation/types';

export const labelKey = (label: string) =>
  label.toLowerCase().replace(/\s+/g, '_');

const FIELD_ORDER = [
  'delivery_options', 'mills', 'quantity', 'target_price',
  'location', 'payment_terms', 'delivery_terms', 'grades',
];

const DELIVERY_OPTIONS = [
  { id: 'DELIVERED', name: 'Delivered' },
  { id: 'EX_LOAD', name: 'Ex Load' },
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

const normalizeCommodities = (res: any): CommodityRouteParam[] => {
  const items = res?.items ?? res?.data?.items ?? [];
  const result = items
    .filter((c: any) => c?.id && c?.name)
    .map((c: any) => ({
      id: String(c.id),
      name: String(c.name),
      default_unit: c.default_unit
        ? { id: String(c.default_unit.id), name: String(c.default_unit.name) }
        : null,
      grades: Array.isArray(c.grades) ? c.grades : [],
      minimum_quantity: typeof c.minimum_quantity === 'number' ? c.minimum_quantity : null,
    }));
  console.log('[PostForm] commodities normalized:', result.map((c: any) => ({ id: c.id, name: c.name, grades: c.grades })));
  return result;
};

const normalizeMills = (res: any): FieldOption[] => {
  const items = res?.items ?? res?.data?.items ?? res?.data ?? [];
  console.log('[PostForm] mills raw response:', JSON.stringify(res));
  return items.map((m: any) => ({
    id: String(m.id ?? ''),
    name: String(m.name ?? ''),
    location: m.location ?? '',
  }));
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

  const [commodities, setCommodities] = useState<CommodityRouteParam[]>([]);
  const [commoditiesLoading, setCommoditiesLoading] = useState(false);
  const [selectedCommodity, setSelectedCommodity] = useState<CommodityRouteParam | null>(null);
  const [millsOptions, setMillsOptions] = useState<FieldOption[]>([]);
  const [tradeConfigs, setTradeConfigs] = useState<any[]>([]);

  const [form, setForm] = useState<CategoryForm | null>(null);
  const [values, setValues] = useState<Record<string, FieldValue>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('FIXED');
  const [paymentValue, setPaymentValue] = useState('');
  const [loading, setLoading] = useState(false);
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
  const prefillAppliedRef = useRef(false);

  // Load commodities + mills + trade-configs when category changes
  useEffect(() => {
    if (!categoryData?.id) return;
    setCommoditiesLoading(true);
    setSelectedCommodity(null);
    setForm(null);
    setValues({});
    prefillAppliedRef.current = false;

    Promise.all([
      api.marketplace.public.getCommoditiesByCategory(categoryData.id) as Promise<any>,
      api.marketplace.public.getPublicMills() as Promise<any>,
      api.marketplace.public.getTradeConfigs() as Promise<any>,
    ])
      .then(([comRes, millsRes, configsRes]) => {
        console.log('[PostForm] commodities raw:', JSON.stringify(comRes));
        console.log('[PostForm] tradeConfigs raw:', JSON.stringify(configsRes));
        const loaded = normalizeCommodities(comRes);
        setCommodities(loaded);
        setMillsOptions(normalizeMills(millsRes));
        const rawConfigs = configsRes?.data ?? configsRes?.items ?? configsRes?.data?.items ?? [];
        const configs = Array.isArray(rawConfigs) ? rawConfigs : [];
        console.log('[PostForm] tradeConfigs parsed:', JSON.stringify(configs));
        setTradeConfigs(configs);

        // Auto-select commodity when editing a post
        const fill = prefillRef.current;
        if (fill?.commodity_id) {
          const match = loaded.find(c => c.id === fill.commodity_id);
          if (match) setSelectedCommodity(match);
        }
      })
      .catch(() => {})
      .finally(() => setCommoditiesLoading(false));
  }, [categoryData?.id]);

  // Load form when commodity selected
  useEffect(() => {
    if (!selectedCommodity) {
      setForm(null);
      setLoadError('');
      setNoForm(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    setLoadError('');
    setNoForm(false);

    const formType = isBuyer ? 'demand' : 'supply';

    (api.marketplace.public.getFormByCommodity(selectedCommodity.id, formType) as Promise<any>)
      .then((res: any) => {
        if (!mounted) return;
        console.log('[PostForm] form raw response for commodity', selectedCommodity.id, ':', JSON.stringify(res));
        const next = normalizeForm(res);
        if (!next) { setNoForm(true); return; }
        console.log('[PostForm] form fields:', JSON.stringify(next.fields?.map((f: any) => ({ id: f.id, label: f.label, type: f.field_type, options: f.options?.length }))));
        setForm(next);

        const fill = prefillRef.current;
        if (fill && !prefillAppliedRef.current) {
          prefillAppliedRef.current = true;
          const initialValues: Record<string, FieldValue> = {};
          for (const field of next.fields) {
            const lk = labelKey(field.label);
            if (lk === 'quantity' && fill.quantity != null) {
              initialValues[field.id] = fill.quantity;
            } else if (lk === 'target_price' && fill.price_per_unit != null) {
              initialValues[field.id] = fill.price_per_unit;
            } else if (lk === 'delivery_options' && fill.delivery_option) {
              initialValues[field.id] = fill.delivery_option;
            } else if (lk === 'location' && fill.city_name) {
              initialValues[field.id] = { id: fill.city_id ?? null, name: fill.city_name };
            } else if (lk === 'grades' && fill.grades?.length) {
              initialValues[field.id] = fill.grades;
            }
          }
          setValues(initialValues);

          if (fill.payment_type) {
            setPaymentMode(fill.payment_type as PaymentMode);
            setPaymentValue(fill.payment_term_id ?? '');
          }
          if (fill.delivery_term_id) setDeliveryDays(fill.delivery_term_id);
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
      })
      .catch((err: any) => {
        if (!mounted) return;
        const status = err?.response?.status ?? err?.status;
        if (status === 404 || String(err?.response?.data?.message ?? '').toLowerCase().includes('not found')) {
          setNoForm(true);
        } else {
          setLoadError('Unable to load form. Please try again.');
        }
      })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [selectedCommodity?.id, isBuyer]);

  const commodityUnit = selectedCommodity?.default_unit?.name ?? 'Bag';

  const deliveryTermOptions = useMemo(() => {
    console.log('[PostForm] tradeConfigs count:', tradeConfigs.length, 'sample:', JSON.stringify(tradeConfigs[0]));
    const opts = tradeConfigs.filter((c: any) => c.type === 'fixed_days' || c.type === 'weekly_percent');
    console.log('[PostForm] deliveryTermOptions:', JSON.stringify(opts));
    return opts;
  }, [tradeConfigs]);

  const sortedFields = useMemo(
    () => {
      const sorted = [...(form?.fields ?? [])].sort((a, b) => {
        const ai = FIELD_ORDER.indexOf(labelKey(a.label));
        const bi = FIELD_ORDER.indexOf(labelKey(b.label));
        if (ai === -1 && bi === -1) return (a.sort_order ?? 0) - (b.sort_order ?? 0);
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      });

      console.log('[PostForm] selectedCommodity grades:', selectedCommodity?.name, JSON.stringify(selectedCommodity?.grades));

      return sorted.map(field => {
        const lk = labelKey(field.label);
        if (lk === 'grades') {
          const gradeOpts = selectedCommodity?.grades.map(g => ({ id: g, name: g })) ?? [];
          console.log('[PostForm] grades options for', selectedCommodity?.name, ':', JSON.stringify(gradeOpts));
          return { ...field, options: gradeOpts };
        }
        if (lk === 'mills') return { ...field, options: millsOptions };
        if (lk === 'delivery_options') return { ...field, options: DELIVERY_OPTIONS };
        if (lk === 'delivery_terms' || lk === 'payment_terms') {
          return { ...field, options: deliveryTermOptions };
        }
        return field;
      });
    },
    [form, selectedCommodity, millsOptions, deliveryTermOptions],
  );

  const findField = (lk: string) => sortedFields.find(f => labelKey(f.label) === lk);
  const paymentField = findField('payment_terms');
  const millsField = findField('mills');

  const effectiveDeliveryDays = isCustomDelivery ? customDeliveryInput : deliveryDays;

  const fieldResults = sortedFields.map(field => {
    const lk = labelKey(field.label);
    const type = field.field_type?.toLowerCase();

    if (!field.is_required) return { lk, required: false, valid: true };

    let valid = false;
    if (lk === 'target_price' && selectedMills.length > 0) {
      valid = true;
    } else if (lk === 'payment_terms') {
      valid = paymentValue.trim().length > 0;
    } else if (lk === 'delivery_terms') {
      valid = effectiveDeliveryDays.trim().length > 0;
    } else if (lk === 'mills') {
      valid = selectedMills.length > 0;
    } else if (lk === 'location') {
      valid = Boolean((values[field.id] as { name?: string } | null)?.name?.trim());
    } else if (lk === 'quantity') {
      const qty = parseNumber(values[field.id]);
      if (qty === null || qty <= 0) { valid = false; }
      else {
        const minQty = selectedCommodity?.minimum_quantity ?? 0;
        valid = minQty > 0 ? qty >= minQty : true;
      }
    } else {
      valid = isFilled(values[field.id], type ?? '');
    }

    return { lk, required: true, valid, value: values[field.id], type };
  });

  console.log('[PostForm] field validation:', JSON.stringify(fieldResults));

  const formIsValid = fieldResults.every(r => r.valid);

  console.log('[PostForm] canSubmit check — categoryData:', !!categoryData?.id, '| commodity:', !!selectedCommodity, '| form:', !!form, '| formIsValid:', formIsValid);
  const canSubmit = Boolean(categoryData?.id && selectedCommodity && form && formIsValid && !submitting);
  const canSubmitAny = canSubmit || queuedPosts.length > 0;

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
    setPendingMill({ id: millId, name: String(opt.name ?? ''), city: (opt as any).city ?? '', price: '', isCustom: false });
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
    const payload: Record<string, unknown> = {
      category_id: categoryData?.id ?? (form as any)?.category_id,
      commodity: selectedCommodity?.id ?? null,
    };
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
        const cv = values[field.id] as { id?: string | null; name?: string } | null;
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
          ? { name: m.name, city: m.city, parsedCity: m.parsedCity, province: m.province, price: parseFloat(m.price) || 0 }
          : { id: m.id, price: parseFloat(m.price) || 0 },
      );
    }
    return payload;
  };

  const buildPreview = (): string => {
    const parts: string[] = [];
    if (selectedCommodity) parts.push(selectedCommodity.name);
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
    setValues({});
    setSelectedMills([]);
    setPendingMill({ id: '', name: '', city: '', price: '', isCustom: false });
    setDeliveryDays('');
    setIsCustomDelivery(false);
    setCustomDeliveryInput('');
    setPaymentMode('FIXED');
    setPaymentValue('');
    setOpenDropdown(null);
  };

  const handleSaveAndAdd = () => {
    if (!canSubmit) return;
    const snap: FormSnapshot = {
      values: { ...values }, selectedMills: [...selectedMills],
      deliveryDays, isCustomDelivery, customDeliveryInput, paymentMode, paymentValue,
    };
    setQueuedPosts(prev => [...prev, { payload: buildPayload(), preview: buildPreview(), formSnapshot: snap }]);
    resetForm();
  };

  const removeQueuedPost = (i: number) => setQueuedPosts(prev => prev.filter((_, idx) => idx !== i));

  const editQueuedPost = (i: number) => {
    const { formSnapshot: s } = queuedPosts[i];
    setValues(s.values);
    setSelectedMills(s.selectedMills);
    setDeliveryDays(s.deliveryDays);
    setIsCustomDelivery(s.isCustomDelivery);
    setCustomDeliveryInput(s.customDeliveryInput);
    setPaymentMode(s.paymentMode);
    setPaymentValue(s.paymentValue);
    setQueuedPosts(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    if (!canSubmitAny) return;
    setSubmitting(true);
    setSubmitError('');

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
        if (err?.code !== 'AUTH_REQUIRED') {
          setSubmitError(isBuyer ? 'Unable to update demand.' : 'Unable to update supply.');
        }
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
      navigation.navigate('PostCreated', {
        mode: isBuyer ? 'buyer' : 'seller',
        postData: res,
        categoryName,
        totalCount: payloads.length,
      });
    } catch (err: any) {
      if (err?.code !== 'AUTH_REQUIRED') {
        setSubmitError(isBuyer ? 'Unable to create demand.' : 'Unable to create supply.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return {
    commodities, commoditiesLoading, selectedCommodity, setSelectedCommodity, commodityUnit,
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
