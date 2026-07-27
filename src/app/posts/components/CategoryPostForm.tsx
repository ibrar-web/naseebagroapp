import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MockStatusBar from '../../components/MockStatusBar';
import { AppIcon } from '../../../assets/icons';
import type {
  CategoryRouteParam,
  CommodityRouteParam,
  PostPrefillData,
  RootStackParamList,
} from '../../../navigation/types';
import { usePostForm, labelKey } from '../hooks/usePostForm';
import { PostFormField } from './PostFormField';
import { PostFormCityPicker } from './PostFormCityPicker';
import { PostFormDeliveryOptions } from './PostFormDeliveryOptions';
import { PostFormMills } from './PostFormMills';
import { PostFormPaymentTerms } from './PostFormPaymentTerms';
import { PostFormDeliveryTerms } from './PostFormDeliveryTerms';
import type { CityValue } from '../types/postForm.types';
import { AppLoader } from '../../components';

type Props = {
  categoryName: string;
  categoryData?: CategoryRouteParam;
  mode: 'buyer' | 'seller';
  navigation: NativeStackNavigationProp<RootStackParamList>;
  prefillData?: PostPrefillData;
  postId?: string;
};

const CommodityPicker = ({
  commodities,
  loading,
  selected,
  onSelect,
}: {
  commodities: CommodityRouteParam[];
  loading: boolean;
  selected: CommodityRouteParam | null;
  onSelect: (c: CommodityRouteParam) => void;
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <View style={cp.wrap}>
      <TouchableOpacity
        style={[cp.btn, selected && cp.btnActive]}
        onPress={() => { if (!loading) setOpen(v => !v); }}
        activeOpacity={0.8}
      >
        <Text style={[cp.btnText, !selected && cp.placeholder]} numberOfLines={1}>
          {selected ? selected.name : 'Select commodity...'}
        </Text>
        {loading
          ? <ActivityIndicator size="small" color="#9CA3AF" />
          : <AppIcon name="chevronDown" size={13} color={selected ? '#2E9E52' : '#9CA3AF'} />}
      </TouchableOpacity>

      {open && !loading && (
        <View style={cp.sheet}>
          <ScrollView style={cp.optScroll} nestedScrollEnabled>
            {commodities.map(c => {
              const active = c.id === selected?.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[cp.opt, active && cp.optActive]}
                  onPress={() => { onSelect(c); setOpen(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={[cp.optText, active && cp.optTextActive]}>{c.name}</Text>
                  {c.minimum_quantity ? (
                    <Text style={cp.optSub}>Min: {c.minimum_quantity} {c.default_unit?.name ?? 'units'}</Text>
                  ) : null}
                  {active && <AppIcon name="approved" size={14} color="#2E9E52" />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export const CategoryPostForm = ({
  categoryName,
  categoryData,
  mode,
  navigation,
  prefillData,
  postId,
}: Props) => {
  const f = usePostForm({ categoryData, categoryName, mode, navigation, prefillData, postId });
  const [qtyBlurred, setQtyBlurred] = React.useState(false);

  const renderFormContent = () => {
    if (f.loading) {
      return (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#2E9E52" />
        </View>
      );
    }

    if (f.noForm) {
      return (
        <View style={s.center}>
          <View style={s.noFormIconBox}>
            <AppIcon name="menuBusiness" size={36} color="#9CA3AF" />
          </View>
          <Text style={s.noFormTitle}>No Form Available</Text>
          <Text style={s.noFormSub}>
            This commodity doesn't have a form set up yet.{'\n'}Please try a different commodity or check back later.
          </Text>
          <TouchableOpacity
            style={s.goBackBtn}
            onPress={() => f.setSelectedCommodity(null)}
            activeOpacity={0.7}
          >
            <Text style={s.goBackText}>Choose Different Commodity</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (f.loadError) {
      return (
        <View style={s.center}>
          <Text style={s.errText}>{f.loadError}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => f.setSelectedCommodity(null)} activeOpacity={0.7}>
            <Text style={s.retryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!f.selectedCommodity) {
      return (
        <View style={s.selectPrompt}>
          <AppIcon name="menuBusiness" size={28} color="#D1D5DB" />
          <Text style={s.selectPromptText}>Select a commodity above to continue</Text>
        </View>
      );
    }

    if (!f.form) return null;

    return (
      <>
        {/* Queued posts */}
        {f.queuedPosts.length > 0 && (
          <View style={s.queueCard}>
            <Text style={s.queueTitle}>
              {f.queuedPosts.length} post{f.queuedPosts.length > 1 ? 's' : ''} queued
            </Text>
            {f.queuedPosts.map((p, i) => (
              <View key={i} style={s.queueRow}>
                <Text style={s.queuePreview} numberOfLines={1}>{p.preview}</Text>
                <View style={s.queueActions}>
                  <TouchableOpacity onPress={() => f.editQueuedPost(i)} activeOpacity={0.7}>
                    <AppIcon name="edit" size={14} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => f.removeQueuedPost(i)} activeOpacity={0.7}>
                    <AppIcon name="cache" size={14} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Form card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Post Details</Text>
          {f.sortedFields.map(field => {
            const lk = labelKey(field.label);
            const isUnitField = lk === 'quantity' || lk === 'target_price';
            return (
              <View key={field.id} style={s.fieldWrap}>
                <View style={s.labelRow}>
                  <Text style={s.label}>{field.label}</Text>
                  {isUnitField && f.commodityUnit ? (
                    <View style={s.unitBadge}>
                      <Text style={s.unitBadgeText}>{f.commodityUnit}</Text>
                    </View>
                  ) : null}
                  {field.is_required ? (
                    <View style={s.tagRequired}>
                      <Text style={s.tagRequiredText}>Required</Text>
                    </View>
                  ) : (
                    <View style={s.tagOptional}>
                      <Text style={s.tagOptionalText}>Optional</Text>
                    </View>
                  )}
                  {lk === 'grades' && (
                    <View style={s.tagOptional}>
                      <Text style={s.tagOptionalText}>Multi-select</Text>
                    </View>
                  )}
                  {lk === 'mills' && f.selectedMills.length > 0 && (
                    <Text style={s.millCount}>{f.selectedMills.length} added</Text>
                  )}
                </View>

                {lk === 'quantity' && f.selectedCommodity?.minimum_quantity ? (
                  <Text style={s.minQtyHint}>
                    Minimum: {f.selectedCommodity.minimum_quantity} {f.commodityUnit}
                  </Text>
                ) : null}

                {lk === 'location' ? (
                  <PostFormCityPicker
                    value={f.values[field.id] as CityValue | null}
                    onChange={v => f.setFieldValue(field.id, v)}
                  />
                ) : lk === 'delivery_options' ? (
                  <PostFormDeliveryOptions
                    value={f.values[field.id] as string | null}
                    options={field.options ?? []}
                    onChange={v => f.setFieldValue(field.id, v)}
                  />
                ) : lk === 'mills' ? (
                  <PostFormMills
                    millsField={f.millsField}
                    openDropdown={f.openDropdown}
                    selectedMills={f.selectedMills}
                    pendingMill={f.pendingMill}
                    commodityUnit={f.commodityUnit}
                    onToggleDropdown={f.toggleDropdown}
                    onSelectMill={f.selectMillOption}
                    onPendingMillChange={f.setPendingMill}
                    onAddMill={f.addMill}
                    onRemoveMill={f.removeMill}
                  />
                ) : lk === 'payment_terms' ? (
                  <PostFormPaymentTerms
                    field={field}
                    paymentMode={f.paymentMode}
                    paymentValue={f.paymentValue}
                    onModeChange={f.setNextPaymentMode}
                    onValueChange={f.setPaymentValue}
                  />
                ) : lk === 'delivery_terms' ? (
                  <PostFormDeliveryTerms
                    field={field}
                    deliveryDays={f.deliveryDays}
                    isCustom={f.isCustomDelivery}
                    customInput={f.customDeliveryInput}
                    onSelectDays={f.setDeliveryDays}
                    onToggleCustom={f.setIsCustomDelivery}
                    onCustomInput={f.setCustomDeliveryInput}
                  />
                ) : (
                  <PostFormField
                    field={field}
                    value={f.values[field.id] ?? null}
                    isOpen={f.openDropdown === field.id}
                    onToggle={() => f.toggleDropdown(field.id)}
                    onChange={v => { f.setFieldValue(field.id, v); if (lk === 'quantity') setQtyBlurred(false); }}
                    onBlur={lk === 'quantity' ? () => setQtyBlurred(true) : undefined}
                  />
                )}

                {lk === 'quantity' && qtyBlurred && (() => {
                  const minQty = f.selectedCommodity?.minimum_quantity ?? 0;
                  const entered = Number(String(f.values[field.id] ?? '').replace(/[^\d.]/g, ''));
                  if (minQty > 0 && entered > 0 && entered < minQty) {
                    return (
                      <View style={s.validationAlert}>
                        <AppIcon name="alertCircle" size={14} color="#B45309" />
                        <Text style={s.validationAlertText}>
                          Minimum quantity is {minQty} {f.commodityUnit}
                        </Text>
                      </View>
                    );
                  }
                  return null;
                })()}
              </View>
            );
          })}

          <TouchableOpacity
            style={[s.saveBtn, f.canSubmit && s.saveBtnActive]}
            onPress={f.handleSaveAndAdd}
            disabled={!f.canSubmit}
            activeOpacity={0.7}
          >
            <AppIcon name="add" size={15} color={f.canSubmit ? '#2E9E52' : '#9CA3AF'} />
            <Text style={[s.saveBtnText, f.canSubmit && s.saveBtnTextActive]}>
              Save &amp; Add Another
            </Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  return (
    <View style={s.root}>
      <MockStatusBar />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={f.goBack} activeOpacity={0.7}>
          <AppIcon name="back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={s.title}>{f.isBuyer ? 'Create Demand' : 'Create Supply'}</Text>
        <View style={s.badge}>
          <Text style={s.badgeText}>{categoryName}</Text>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Commodity picker */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Select Commodity</Text>
          <CommodityPicker
            commodities={f.commodities}
            loading={f.commoditiesLoading}
            selected={f.selectedCommodity}
            onSelect={f.setSelectedCommodity}
          />
        </View>

        {renderFormContent()}
      </ScrollView>

      {/* Bottom bar */}
      {f.selectedCommodity && f.form && (
        <View style={s.bottomBar}>
          {f.submitError ? (
            <Text style={s.submitError}>{f.submitError}</Text>
          ) : null}
          <TouchableOpacity
            style={[s.submitBtn, f.canSubmitAny && s.submitBtnActive]}
            onPress={f.handleSubmit}
            disabled={!f.canSubmitAny || f.submitting}
            activeOpacity={0.7}
          >
            {f.submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={[s.submitText, f.canSubmitAny && s.submitTextActive]}>
                {f.canSubmitAny
                  ? `Submit${f.queuedPosts.length > 0
                      ? ` (${f.queuedPosts.length + (f.canSubmit ? 1 : 0)})`
                      : ''}`
                  : 'Fill the form above to continue'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <AppLoader overlay visible={f.submitting} message="Submitting..." />
    </View>
  );
};

export default CategoryPostForm;

const cp = StyleSheet.create({
  wrap: {},
  loadRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  loadText: { fontSize: 12, color: '#6B7280' },
  btn: {
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10,
    paddingVertical: 11, paddingHorizontal: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  btnActive: { borderColor: '#2E9E52' },
  btnText: { fontSize: 13, color: '#111827', flex: 1 },
  placeholder: { color: '#9CA3AF' },
  sheet: {
    marginTop: 4, backgroundColor: '#FFFFFF', borderRadius: 10,
    borderWidth: 1.5, borderColor: '#E5E7EB', overflow: 'hidden',
  },
  opt: { paddingVertical: 11, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optActive: { backgroundColor: '#F2FBF5' },
  optText: { fontSize: 13, color: '#374151', flex: 1 },
  optTextActive: { color: '#1A6B34', fontWeight: '600' },
  optSub: { fontSize: 11, color: '#9CA3AF' },
  optScroll: { maxHeight: 220 },
});

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: 160 },
  errText: { fontSize: 14, color: '#374151', textAlign: 'center', marginBottom: 16 },
  retryBtn: {
    backgroundColor: '#2E9E52', borderRadius: 10, paddingVertical: 11, paddingHorizontal: 24,
  },
  retryText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  noFormIconBox: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  noFormTitle: { fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 8 },
  noFormSub: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  goBackBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F0FDF4',
    borderRadius: 10, paddingVertical: 11, paddingHorizontal: 20,
    borderWidth: 1.5, borderColor: '#217A3C',
  },
  goBackText: { fontSize: 13, fontWeight: '700', color: '#217A3C' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 20, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  backBtn: { padding: 4, borderRadius: 8 },
  title: { fontSize: 16, fontWeight: '700', color: '#111827' },
  badge: { backgroundColor: '#E8F7EE', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#1A6B34' },
  scroll: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 100 },
  queueCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, marginBottom: 12,
    borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  queueTitle: { fontSize: 11, fontWeight: '700', color: '#2E9E52', marginBottom: 8 },
  queueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  queuePreview: { flex: 1, fontSize: 12, color: '#374151' },
  queueActions: { flexDirection: 'row', gap: 12, marginLeft: 12 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 2 },
    elevation: 3, borderWidth: 1.5, borderColor: '#F3F4F6',
  },
  cardTitle: { fontSize: 13, fontWeight: '800', color: '#111827', marginBottom: 14 },
  fieldWrap: { marginBottom: 14 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 7, flexWrap: 'wrap', gap: 4 },
  label: { fontSize: 12, fontWeight: '700', color: '#374151' },
  unitBadge: { backgroundColor: '#EFF6FF', borderRadius: 6, paddingVertical: 2, paddingHorizontal: 6 },
  unitBadgeText: { fontSize: 10, fontWeight: '600', color: '#3B82F6' },
  minQtyHint: { fontSize: 10, color: '#D97706', marginBottom: 5 },
  millCount: { fontSize: 11, color: '#217A3C', fontWeight: '700', marginLeft: 'auto' },
  tagRequired: { backgroundColor: '#FEE2E2', borderRadius: 10, paddingVertical: 2, paddingHorizontal: 7 },
  tagRequiredText: { fontSize: 10, fontWeight: '600', color: '#EF4444' },
  tagOptional: { backgroundColor: '#F3F4F6', borderRadius: 10, paddingVertical: 2, paddingHorizontal: 7 },
  tagOptionalText: { fontSize: 10, fontWeight: '500', color: '#9CA3AF' },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 11, borderRadius: 10, backgroundColor: '#F3F4F6', marginTop: 4,
  },
  saveBtnActive: { backgroundColor: '#F2FBF5', borderWidth: 1.5, borderColor: '#2E9E52' },
  saveBtnText: { fontSize: 13, fontWeight: '700', color: '#9CA3AF' },
  saveBtnTextActive: { color: '#2E9E52' },
  bottomBar: {
    padding: 12, paddingBottom: 16, backgroundColor: '#FFFFFF',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: -4 }, elevation: 8,
  },
  submitError: { fontSize: 12, color: '#EF4444', textAlign: 'center', marginBottom: 8 },
  submitBtn: {
    alignItems: 'center', justifyContent: 'center', paddingVertical: 13, paddingHorizontal: 20,
    borderWidth: 1.5, borderColor: '#D1D5DB', borderRadius: 12, opacity: 0.6,
  },
  submitBtnActive: { backgroundColor: '#2E9E52', borderColor: '#2E9E52', opacity: 1 },
  submitText: { fontSize: 14, fontWeight: '600', color: '#4B5563' },
  submitTextActive: { color: '#FFFFFF' },
  selectPrompt: {
    alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 28, paddingHorizontal: 16,
    backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 12,
    borderWidth: 1.5, borderColor: '#F3F4F6', borderStyle: 'dashed',
  },
  selectPromptText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
  validationAlert: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFFBEB', borderRadius: 10, padding: 12, marginBottom: 10,
    borderWidth: 1, borderColor: '#FCD34D',
  },
  validationAlertText: { fontSize: 12, color: '#92400E', flex: 1, lineHeight: 18 },
});
