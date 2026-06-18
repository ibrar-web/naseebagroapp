import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import api from '../../../utils/api';

export interface TruckDocument {
  id: string;
  doc_type: 'bilti' | 'waybill' | 'pohnch';
  document_name: string;
  status: string;
  uploaded_by_role: 'buyer' | 'seller' | null;
  signed_url: string | null;
}

export interface FullTruck {
  id: string;
  truck_number: string;
  driver_name: string | null;
  weight_tons: number | null;
  freight_amount: number | null;
  unloaded_weight_tons: number | null;
  calculated_amount: number | null;
  status: string;
  dispatched_at: string | null;
  delivered_at: string | null;
  documents: TruckDocument[];
}

interface AddTruckData {
  truck_number: string;
  driver_name?: string;
  weight_tons?: number;
}

interface Props {
  deal: {
    deal_id: string;
    total_amount?: number | null;
    offer?: { payment_term_type?: string | null };
  };
  mode: 'buyer' | 'seller';
  onAddTruck: (data: AddTruckData) => Promise<void>;
  onTrucksLoaded?: (trucks: FullTruck[]) => void;
}

const STATUS_BADGE: Record<string, { label: string; bg: string; border: string; text: string }> = {
  registered: { label: 'Upcoming',   bg: '#F9FAFB', border: '#E5E7EB', text: '#9CA3AF' },
  dispatched:  { label: 'Dispatched', bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8' },
  delivered:   { label: 'Delivered',  bg: '#F2FBF5', border: '#7FD4A0', text: '#1A6B34' },
};

const DOC_LABELS: Record<string, string> = {
  bilti: 'Bilti',
  waybill: 'Waybill',
  pohnch: 'Pohnch',
};

const fmtNum = (n: number) => Math.round(n).toLocaleString('en-PK');

const TrucksTab: React.FC<Props> = ({ deal, mode, onAddTruck, onTrucksLoaded }) => {
  const [trucks, setTrucks] = useState<FullTruck[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [vehicleNo, setVehicleNo] = useState('');
  const [driverName, setDriverName] = useState('');
  const [weight, setWeight] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [editFreight, setEditFreight] = useState('');
  const [editUnloaded, setEditUnloaded] = useState('');
  const [savingFields, setSavingFields] = useState(false);

  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const loadTrucks = useCallback(async () => {
    try {
      const resp: any =
        mode === 'buyer'
          ? await api.buyer.getTrucks(deal.deal_id)
          : await api.seller.getDealTrucks(deal.deal_id);
      const list: FullTruck[] = Array.isArray(resp) ? resp : (resp?.data ?? []);
      setTrucks(list);
      onTrucksLoaded?.(list);
    } catch {
      // keep existing list
    } finally {
      setLoading(false);
    }
  }, [deal.deal_id, mode, onTrucksLoaded]);

  useEffect(() => {
    loadTrucks();
  }, [loadTrucks]);

  const handleToggleExpand = (truck: FullTruck) => {
    if (expandedId === truck.id) {
      setExpandedId(null);
    } else {
      setExpandedId(truck.id);
      setEditFreight(truck.freight_amount != null ? String(truck.freight_amount) : '');
      setEditUnloaded(truck.unloaded_weight_tons != null ? String(truck.unloaded_weight_tons) : '');
    }
  };

  const handleAddTruckSubmit = async () => {
    if (!vehicleNo.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onAddTruck({
        truck_number: vehicleNo.trim(),
        driver_name: driverName.trim() || undefined,
        weight_tons: weight ? Number(weight) : undefined,
      });
      setVehicleNo('');
      setDriverName('');
      setWeight('');
      setShowForm(false);
      await loadTrucks();
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveBuyerFields = async (truckId: string) => {
    if (savingFields) return;
    setSavingFields(true);
    try {
      await api.buyer.updateTruck(deal.deal_id, truckId, {
        freight_amount: editFreight ? Number(editFreight) : undefined,
        unloaded_weight_tons: editUnloaded ? Number(editUnloaded) : undefined,
      });
      await loadTrucks();
    } catch {
      Alert.alert('Error', 'Failed to save changes.');
    } finally {
      setSavingFields(false);
    }
  };

  const handleUploadDoc = (truckId: string, docType: 'bilti' | 'waybill' | 'pohnch') => {
    const key = `${truckId}_${docType}`;
    launchImageLibrary({ mediaType: 'mixed', quality: 1 }, async (response) => {
      if (response.didCancel || !response.assets?.length) return;
      const asset = response.assets[0];
      if (!asset.uri) return;

      setUploadingDoc(key);
      try {
        const form = new FormData();
        form.append('file', {
          uri: asset.uri,
          type: asset.type ?? 'application/octet-stream',
          name: asset.fileName ?? `doc_${truckId}`,
        } as any);

        if (mode === 'seller') {
          form.append('doc_type', docType);
          await api.seller.addTruckDoc(deal.deal_id, truckId, form);
        } else {
          await api.buyer.addTruckDocument(deal.deal_id, truckId, form);
        }
        await loadTrucks();
      } catch {
        Alert.alert('Error', 'Failed to upload document.');
      } finally {
        setUploadingDoc(null);
      }
    });
  };

  const openDocument = (signedUrl: string | null) => {
    if (!signedUrl) return;
    Linking.openURL(signedUrl).catch(() =>
      Alert.alert('Error', 'Could not open document.'),
    );
  };

  // Doc chip: shows different states based on upload + verification status
  const renderDocChipRow = (
    truck: FullTruck,
    docType: 'bilti' | 'waybill' | 'pohnch',
    canUpload: boolean,
    uploadBtnBg: string,
    uploadBtnTextColor: string,
  ) => {
    const doc = truck.documents.find(d => d.doc_type === docType);
    const uploadKey = `${truck.id}_${docType}`;
    const isUploading = uploadingDoc === uploadKey;
    const label = DOC_LABELS[docType];

    return (
      <View key={docType} style={s.docRow}>
        {/* Chip */}
        {doc ? (
          doc.status === 'verified' ? (
            // Verified — green chip, tappable to view/download
            <TouchableOpacity
              style={s.chipGreen}
              onPress={() => openDocument(doc.signed_url)}
              activeOpacity={0.75}
            >
              <Text style={s.chipCheck}>✓</Text>
              <Text style={s.chipGreenLabel}>{label}</Text>
              <Text style={s.chipFileName} numberOfLines={1}>
                {doc.document_name}
              </Text>
            </TouchableOpacity>
          ) : (
            // Uploaded but pending admin review — amber chip
            <View style={s.chipAmber}>
              <Text style={s.chipPendingDot}>●</Text>
              <Text style={s.chipAmberLabel}>{label}</Text>
              <Text style={s.chipPendingText}>Pending review</Text>
            </View>
          )
        ) : (
          // Not uploaded — gray chip
          <View style={s.chipGray}>
            <View style={s.fileIconBox} />
            <Text style={s.chipGrayLabel}>{label}</Text>
          </View>
        )}

        {/* Upload button — only if canUpload and not uploaded at all */}
        {canUpload && !doc && (
          <TouchableOpacity
            style={[s.uploadBtn, { backgroundColor: uploadBtnBg }]}
            onPress={() => handleUploadDoc(truck.id, docType)}
            disabled={isUploading}
            activeOpacity={0.85}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color={uploadBtnTextColor} />
            ) : (
              <Text style={[s.uploadBtnText, { color: uploadBtnTextColor }]}>Upload</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderExpandedPanel = (truck: FullTruck) => (
    <View style={s.panel}>
      {/* Stats bar */}
      <View style={s.statsBar}>
        <View>
          <Text style={s.statsBarLabel}>DRIVER</Text>
          <Text style={s.statsBarVal}>{truck.driver_name ?? '—'}</Text>
        </View>
        <View style={s.statsBarDivider} />
        <View>
          <Text style={s.statsBarLabel}>VEHICLE</Text>
          <Text style={s.statsBarVal}>{truck.truck_number}</Text>
        </View>
        <View style={s.statsBarDivider} />
        <View>
          <Text style={s.statsBarLabel}>LOAD</Text>
          <Text style={s.statsBarVal}>
            {truck.weight_tons != null ? `${truck.weight_tons} tons` : '—'}
          </Text>
        </View>
      </View>

      {mode === 'seller' ? (
        <>
          {/* DISPATCH DOCUMENTS */}
          <View style={s.docSection}>
            <Text style={s.sectionHead}>DISPATCH DOCUMENTS</Text>
            {renderDocChipRow(truck, 'bilti', true, '#217A3C', '#FFFFFF')}
            {renderDocChipRow(truck, 'waybill', true, '#217A3C', '#FFFFFF')}
          </View>

          {/* POHNCH DOCUMENT (buyer uploads — seller sees status only) */}
          <View style={s.docSection}>
            <Text style={s.sectionHead}>POHNCH DOCUMENT</Text>
            {renderDocChipRow(truck, 'pohnch', false, '#F3CD03', '#0D3B1F')}
          </View>
        </>
      ) : (
        <>
          {/* DELIVERY PROOF */}
          <View style={s.docSection}>
            <Text style={s.sectionHead}>DELIVERY PROOF</Text>
            {renderDocChipRow(truck, 'pohnch', true, '#217A3C', '#FFFFFF')}
          </View>

          {/* Freight + Weight inputs — side by side */}
          <View style={s.inputsRow}>
            <View style={s.inputHalf}>
              <Text style={s.inputLabel}>Freight (PKR)</Text>
              <TextInput
                style={s.inputField}
                placeholder="e.g. 12500"
                placeholderTextColor="#9CA3AF"
                value={editFreight}
                onChangeText={setEditFreight}
                keyboardType="numeric"
              />
            </View>
            <View style={s.inputHalf}>
              <Text style={s.inputLabel}>Weight Unloaded (tons)</Text>
              <TextInput
                style={s.inputField}
                placeholder="e.g. 10.2"
                placeholderTextColor="#9CA3AF"
                value={editUnloaded}
                onChangeText={setEditUnloaded}
                keyboardType="numeric"
              />
            </View>
          </View>
          <TouchableOpacity
            style={[s.saveBtn, savingFields && s.saveBtnDisabled]}
            onPress={() => handleSaveBuyerFields(truck.id)}
            disabled={savingFields}
            activeOpacity={0.85}
          >
            {savingFields ? (
              <ActivityIndicator size="small" color="#111827" />
            ) : (
              <Text style={s.saveBtnText}>Save Changes</Text>
            )}
          </TouchableOpacity>

          {/* DISPATCH DOCUMENTS — buyer sees seller docs when verified */}
          {truck.documents.some(d => (d.doc_type === 'bilti' || d.doc_type === 'waybill') && d.status === 'verified') && (
            <View style={s.docSectionTop}>
              <Text style={s.sectionHead}>DISPATCH DOCUMENTS</Text>
              {renderDocChipRow(truck, 'bilti', false, '#217A3C', '#FFFFFF')}
              {renderDocChipRow(truck, 'waybill', false, '#217A3C', '#FFFFFF')}
            </View>
          )}
        </>
      )}
    </View>
  );

  const total = trucks.length;
  const dispatched = trucks.filter(t => t.status === 'dispatched' || t.status === 'delivered').length;
  const delivered = trucks.filter(t => t.status === 'delivered').length;
  const totalAmount = Number(deal.total_amount ?? 0);
  const paymentLabel = deal.offer?.payment_term_type
    ? deal.offer.payment_term_type.charAt(0).toUpperCase() +
      deal.offer.payment_term_type.slice(1).toLowerCase()
    : '—';

  if (loading) {
    return (
      <View style={s.loaderWrap}>
        <ActivityIndicator size="large" color="#217A3C" />
      </View>
    );
  }

  return (
    <View>
      {/* Summary header bar */}
      <View style={s.summaryHeader}>
        <View style={s.summaryHeaderTop}>
          <Text style={s.summaryTitle}>
            {total} Truck{total !== 1 ? 's' : ''}
            {totalAmount > 0 ? `  ·  PKR ${fmtNum(totalAmount)}` : ''}
          </Text>
        </View>
        <View style={s.statsRow}>
          <View>
            <Text style={s.statLabel}>DISPATCHED</Text>
            <Text style={s.statValue}>{dispatched}/{total}</Text>
          </View>
          <View style={s.statDivider} />
          <View>
            <Text style={s.statLabel}>DELIVERED</Text>
            <Text style={s.statValue}>{delivered}/{total}</Text>
          </View>
          <View style={s.statDivider} />
          <View>
            <Text style={s.statLabel}>PAYMENT</Text>
            <Text style={s.statValue}>{paymentLabel}</Text>
          </View>
        </View>
      </View>

      {/* Truck list */}
      {trucks.length === 0 && !showForm ? (
        <Text style={s.empty}>No trucks added yet.</Text>
      ) : (
        trucks.map((truck, idx) => {
          const badge = STATUS_BADGE[truck.status] ?? STATUS_BADGE.registered;
          const isExpanded = expandedId === truck.id;
          const subtitle = [
            truck.truck_number,
            truck.weight_tons != null ? `${truck.weight_tons} tons` : null,
            truck.calculated_amount != null ? `PKR ${fmtNum(truck.calculated_amount)}` : null,
          ]
            .filter(Boolean)
            .join(' · ');

          return (
            <View key={truck.id} style={s.truckCard}>
              {/* Card header row */}
              <TouchableOpacity
                style={s.truckRow}
                onPress={() => handleToggleExpand(truck)}
                activeOpacity={0.8}
              >
                {/* Truck icon box */}
                <View style={s.truckIconBox}>
                  <Text style={s.truckIconText}>🚛</Text>
                </View>

                {/* Title + subtitle */}
                <View style={s.truckInfo}>
                  <Text style={s.truckTitle}>
                    Truck {idx + 1} — {truck.truck_number}
                  </Text>
                  {subtitle ? (
                    <Text style={s.truckSubtitle} numberOfLines={1}>
                      {subtitle}
                    </Text>
                  ) : null}
                </View>

                {/* Status badge + chevron */}
                <View style={s.truckRightWrap}>
                  <View
                    style={[
                      s.statusBadge,
                      { backgroundColor: badge.bg, borderColor: badge.border },
                    ]}
                  >
                    <Text style={[s.statusBadgeText, { color: badge.text }]}>
                      {badge.label}
                    </Text>
                  </View>
                  <Text style={s.chevron}>{isExpanded ? '▴' : '▾'}</Text>
                </View>
              </TouchableOpacity>

              {/* Expanded panel */}
              {isExpanded && renderExpandedPanel(truck)}
            </View>
          );
        })
      )}

      {/* Seller: add truck form / button */}
      {mode === 'seller' && (
        <>
          {showForm ? (
            <View style={s.formCard}>
              <View style={s.formHeader}>
                <Text style={s.formTitle}>New Truck</Text>
                <TouchableOpacity
                  style={s.cancelChip}
                  onPress={() => {
                    setVehicleNo('');
                    setDriverName('');
                    setWeight('');
                    setShowForm(false);
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={s.cancelChipText}>Cancel</Text>
                </TouchableOpacity>
              </View>

              <View style={s.formField}>
                <Text style={s.formFieldLabel}>Vehicle No.</Text>
                <TextInput
                  style={s.formInput}
                  placeholder="e.g. LHR-5001"
                  placeholderTextColor="#9CA3AF"
                  value={vehicleNo}
                  onChangeText={setVehicleNo}
                  autoCapitalize="characters"
                />
              </View>
              <View style={s.formField}>
                <Text style={s.formFieldLabel}>Driver Name</Text>
                <TextInput
                  style={s.formInput}
                  placeholder="e.g. Ali Hassan"
                  placeholderTextColor="#9CA3AF"
                  value={driverName}
                  onChangeText={setDriverName}
                />
              </View>
              <View style={s.formField}>
                <Text style={s.formFieldLabel}>Loaded Weight (tons)</Text>
                <TextInput
                  style={s.formInput}
                  placeholder="e.g. 10"
                  placeholderTextColor="#9CA3AF"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity
                style={[s.submitBtn, !vehicleNo.trim() && s.submitBtnDisabled]}
                onPress={handleAddTruckSubmit}
                disabled={!vehicleNo.trim() || submitting}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text
                    style={[s.submitBtnText, !vehicleNo.trim() && s.submitBtnTextDisabled]}
                  >
                    Add Truck
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={s.addBtn}
              onPress={() => setShowForm(true)}
              activeOpacity={0.85}
            >
              <Text style={s.addBtnText}>+ Add Truck</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  loaderWrap: { paddingVertical: 40, alignItems: 'center' },
  empty: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingVertical: 24 },

  // Summary header
  summaryHeader: {
    backgroundColor: '#145228',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  summaryHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryTitle: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
  statsRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.13)' },
  statLabel: { fontSize: 9, color: 'rgba(255,255,255,0.5)', marginBottom: 2 },
  statValue: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },

  // Truck card
  truckCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 2,
  },
  truckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  truckIconBox: {
    width: 36,
    height: 36,
    backgroundColor: '#145228',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  truckIconText: { fontSize: 14 },
  truckInfo: { flex: 1 },
  truckTitle: { fontSize: 13, fontWeight: '800', color: '#111827' },
  truckSubtitle: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  truckRightWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusBadgeText: { fontSize: 10, fontWeight: '700' },
  chevron: { fontSize: 13, color: '#9CA3AF' },

  // Expanded panel
  panel: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    padding: 12,
    paddingHorizontal: 14,
  },

  // Stats bar
  statsBar: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 9,
    paddingHorizontal: 12,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  statsBarDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E5E7EB',
  },
  statsBarLabel: { fontSize: 9, color: '#9CA3AF', marginBottom: 2 },
  statsBarVal: { fontSize: 12, fontWeight: '700', color: '#1F2937' },

  // Doc sections
  docSection: { marginBottom: 12 },
  docSectionTop: { marginBottom: 12, marginTop: 14 },
  sectionHead: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 8,
    letterSpacing: 0.3,
  },

  // Doc chip row
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 7,
  },

  // Gray chip (not uploaded)
  chipGray: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 9,
    padding: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fileIconBox: {
    width: 12,
    height: 14,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  chipGrayLabel: { fontSize: 12, fontWeight: '600', color: '#4B5563' },

  // Green chip (uploaded + verified)
  chipGreen: {
    flex: 1,
    backgroundColor: '#F2FBF5',
    borderWidth: 1.5,
    borderColor: '#7FD4A0',
    borderRadius: 9,
    padding: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipCheck: { fontSize: 13, color: '#217A3C', fontWeight: '700' },
  chipGreenLabel: { fontSize: 12, fontWeight: '600', color: '#1A6B34' },
  chipFileName: {
    marginLeft: 'auto',
    fontSize: 9,
    color: '#217A3C',
    fontFamily: 'monospace',
    flexShrink: 1,
  },

  // Amber chip (uploaded + pending review)
  chipAmber: {
    flex: 1,
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    borderRadius: 9,
    padding: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipPendingDot: { fontSize: 8, color: '#D97706' },
  chipAmberLabel: { fontSize: 12, fontWeight: '600', color: '#92400E' },
  chipPendingText: {
    marginLeft: 'auto',
    fontSize: 10,
    color: '#B45309',
    fontStyle: 'italic',
  },

  // Upload button
  uploadBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 9,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
  },
  uploadBtnText: { fontSize: 11, fontWeight: '700' },

  // Buyer inputs (side-by-side)
  inputsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  inputHalf: { flex: 1 },
  inputLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#45B86A',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 12,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  saveBtn: {
    backgroundColor: '#F3CD03',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontSize: 13, fontWeight: '700', color: '#111827' },

  // Add truck form
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#7FD4A0',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    marginTop: 4,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  formTitle: { fontSize: 13, fontWeight: '800', color: '#111827' },
  cancelChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  cancelChipText: { fontSize: 11, color: '#6B7280' },
  formField: { marginBottom: 10 },
  formFieldLabel: { fontSize: 11, fontWeight: '600', color: '#4B5563', marginBottom: 4 },
  formInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 9,
    paddingVertical: 9,
    paddingHorizontal: 11,
    fontSize: 12,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  submitBtn: {
    backgroundColor: '#217A3C',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnDisabled: { backgroundColor: '#E5E7EB' },
  submitBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  submitBtnTextDisabled: { color: '#9CA3AF' },
  addBtn: {
    borderWidth: 1.5,
    borderColor: '#45B86A',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
  },
  addBtnText: { fontSize: 13, fontWeight: '700', color: '#1A6B34' },
});

export default TrucksTab;
