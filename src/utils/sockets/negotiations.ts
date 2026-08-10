import { getSocket } from './index';

export type NewOfferPayload = {
  offer_id: string;
  code: string;
  sent_by?: string;
};

export type CounterOfferPayload = {
  offer_id: string;
  party: string;
  offered_price: number;
  round: number;
  status: string;
  sent_by?: string;
};

export type OfferStatusPayload = {
  offer_id: string;
  accepted_by?: string;
  rejected_by?: string;
  accepted_price?: number;
  deal_id?: string;
  mode?: 'buyer' | 'seller';
};

// ─── Room helpers ─────────────────────────────────────────────────────────────

export const joinOfferRoom = (offerId: string) => {
  getSocket()?.emit('join_offer', { offerId });
};

// ─── Listeners — each returns its own unsubscribe fn ─────────────────────────
// Using the callback-specific overload of socket.off() so that removing one
// listener never accidentally strips listeners added by other components.

export const onNewOffer = (callback: (data: NewOfferPayload) => void): (() => void) => {
  getSocket()?.on('offer.created', callback);
  return () => getSocket()?.off('offer.created', callback);
};

export const onCounterOffer = (callback: (data: CounterOfferPayload) => void): (() => void) => {
  getSocket()?.on('offer.countered', callback);
  return () => getSocket()?.off('offer.countered', callback);
};

export const onOfferAccepted = (callback: (data: OfferStatusPayload) => void): (() => void) => {
  getSocket()?.on('offer.accepted', callback);
  return () => getSocket()?.off('offer.accepted', callback);
};

export const onOfferRejected = (callback: (data: OfferStatusPayload) => void): (() => void) => {
  getSocket()?.on('offer.rejected', callback);
  return () => getSocket()?.off('offer.rejected', callback);
};

export const onOfferCancelled = (callback: (data: OfferStatusPayload) => void): (() => void) => {
  getSocket()?.on('offer.cancelled', callback);
  return () => getSocket()?.off('offer.cancelled', callback);
};

export type AdminReviewPayload = {
  offer_id: string;
  code: string;
  title: string;
  body: string;
};

export const onAdminReview = (callback: (data: AdminReviewPayload) => void): (() => void) => {
  getSocket()?.on('offer.admin_review', callback);
  return () => getSocket()?.off('offer.admin_review', callback);
};

export const onOfferAdminFinalized = (callback: (data: OfferStatusPayload) => void): (() => void) => {
  getSocket()?.on('offer.admin_finalized', callback);
  return () => getSocket()?.off('offer.admin_finalized', callback);
};
