import { getSocket } from './index';

export type NewOfferPayload = {
  offer_id: string;
  code: string;
};

export type CounterOfferPayload = {
  offer_id: string;
  party: string;
  offered_price: number;
  round: number;
  status: string;
};

export type OfferStatusPayload = {
  offer_id: string;
  accepted_by?: string;
  rejected_by?: string;
  accepted_price?: number;
};

// ─── Room helpers ─────────────────────────────────────────────────────────────

export const joinUserRoom = (userId: string) => {
  getSocket()?.emit('join', { room: `user:${userId}` });
};

export const joinOfferRoom = (offerId: string) => {
  getSocket()?.emit('join_offer', { offer_id: offerId });
};

// ─── Listeners ────────────────────────────────────────────────────────────────

export const onNewOffer = (callback: (data: NewOfferPayload) => void) => {
  getSocket()?.on('offer.created', callback);
};

export const onCounterOffer = (callback: (data: CounterOfferPayload) => void) => {
  getSocket()?.on('offer.countered', callback);
};

export const onOfferAccepted = (callback: (data: OfferStatusPayload) => void) => {
  getSocket()?.on('offer.accepted', callback);
};

export const onOfferRejected = (callback: (data: OfferStatusPayload) => void) => {
  getSocket()?.on('offer.rejected', callback);
};

// ─── Cleanup ──────────────────────────────────────────────────────────────────

export const offNegotiationEvents = () => {
  const socket = getSocket();
  socket?.off('offer.created');
  socket?.off('offer.countered');
  socket?.off('offer.accepted');
  socket?.off('offer.rejected');
};
