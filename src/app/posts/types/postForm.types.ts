export type PostFormMode = 'buyer' | 'seller';
export type PaymentMode = 'FIXED' | 'WEEKLY';
export type FieldValue = string | string[] | null;

export type FieldOption = {
  id?: string | number;
  value?: string | number;
  name?: string;
  label?: string;
  city?: string;
  province?: string;
  mill_id?: string;
  type?: string;
};

export type FormField = {
  id: string;
  field_type_id: string;
  label: string;
  field_type: string;
  icon?: string;
  is_required?: boolean;
  sort_order?: number;
  options?: FieldOption[];
};

export type CategoryForm = {
  id: string;
  category_id: string;
  form_type: string;
  fields: FormField[];
};

export type MillEntry = {
  id: string;
  name: string;
  city: string;
  price: string;
};

export type FormSnapshot = {
  values: Record<string, FieldValue>;
  selectedMills: MillEntry[];
  deliveryDays: string;
  isCustomDelivery: boolean;
  customDeliveryInput: string;
  paymentMode: PaymentMode;
  paymentValue: string;
};

export type QueuedPost = {
  payload: Record<string, unknown>;
  preview: string;
  formSnapshot: FormSnapshot;
};
