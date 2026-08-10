import { getSocket } from './index';

// ─── Payload types ────────────────────────────────────────────────────────────

export type DealCreatedPayload = {
  deal_id: string;
  code: string;
  mode?: 'buyer' | 'seller';
};

export type TruckDocPayload = {
  deal_id: string;
  truck_id: string;
  doc_id: string;
  doc_type: string;
  approved_by?: string;
};

export type BuyerDocPayload = {
  deal_id: string;
  truck_id: string;
  doc_id: string;
  doc_type: string;
};

export type PaymentApprovedPayload = {
  deal_id: string;
  payment_id: string;
  amount: number;
  approved_by: string;
};

// ─── Listeners — each returns its own unsubscribe fn ─────────────────────────

// ── Deal ──────────────────────────────────────────────────────────────────────

export const onDealCreated = (callback: (data: DealCreatedPayload) => void): (() => void) => {
  getSocket()?.on('deal.created', callback);
  return () => getSocket()?.off('deal.created', callback);
};

// ── Truck documents (seller) ──────────────────────────────────────────────────

export const onTruckDocApproved = (callback: (data: TruckDocPayload) => void): (() => void) => {
  getSocket()?.on('deal.truck_doc_approved', callback);
  return () => getSocket()?.off('deal.truck_doc_approved', callback);
};

export const onTruckDocRejected = (callback: (data: TruckDocPayload) => void): (() => void) => {
  getSocket()?.on('deal.truck_doc_rejected', callback);
  return () => getSocket()?.off('deal.truck_doc_rejected', callback);
};

// ── Pohnch / bilty documents (buyer) ─────────────────────────────────────────

export const onBuyerDocApproved = (callback: (data: BuyerDocPayload) => void): (() => void) => {
  getSocket()?.on('deal.buyer_doc_approved', callback);
  return () => getSocket()?.off('deal.buyer_doc_approved', callback);
};

export const onBuyerDocRejected = (callback: (data: BuyerDocPayload) => void): (() => void) => {
  getSocket()?.on('deal.buyer_doc_rejected', callback);
  return () => getSocket()?.off('deal.buyer_doc_rejected', callback);
};

// ── Payment ───────────────────────────────────────────────────────────────────

export const onPaymentApproved = (callback: (data: PaymentApprovedPayload) => void): (() => void) => {
  getSocket()?.on('deal.payment_approved', callback);
  return () => getSocket()?.off('deal.payment_approved', callback);
};

export type PaymentEventPayload = {
  deal_id: string;
  payment_id: string;
  direction?: string;
  reason?: string;
};

export const onPaymentVerified = (callback: (data: PaymentEventPayload) => void): (() => void) => {
  getSocket()?.on('deal.payment_verified', callback);
  return () => getSocket()?.off('deal.payment_verified', callback);
};

export const onPaymentRejected = (callback: (data: PaymentEventPayload) => void): (() => void) => {
  getSocket()?.on('deal.payment_rejected', callback);
  return () => getSocket()?.off('deal.payment_rejected', callback);
};

export const onPaymentSent = (callback: (data: PaymentEventPayload) => void): (() => void) => {
  getSocket()?.on('deal.payment_sent', callback);
  return () => getSocket()?.off('deal.payment_sent', callback);
};

// ── Deal completed ────────────────────────────────────────────────────────────

export type DealCompletedPayload = {
  deal_id: string;
  code: string;
};

export const onDealCompleted = (callback: (data: DealCompletedPayload) => void): (() => void) => {
  getSocket()?.on('deal.completed', callback);
  return () => getSocket()?.off('deal.completed', callback);
};
