import { getSocket } from './index';

export type NewOfferPayload = {
  offerId: string;
  offerCode: string;
  price: number;
  priceDisplay: string;
  quantityLabel: string;
  commodityName: string;
};

export type CounterOfferPayload = {
  offerId: string;
  offerCode: string;
  price: number;
  priceDisplay: string;
  round: number;
};

export type OfferStatusPayload = {
  offerId: string;
  offerCode: string;
  status: string;
};

// ─── Listeners ────────────────────────────────────────────────────────────────

export const onNewOffer = (callback: (data: NewOfferPayload) => void) => {
  const socket = getSocket();
  socket?.on('offer:new', callback);
};

export const onCounterOffer = (callback: (data: CounterOfferPayload) => void) => {
  const socket = getSocket();
  socket?.on('offer:counter', callback);
};

export const onOfferAccepted = (callback: (data: OfferStatusPayload) => void) => {
  const socket = getSocket();
  socket?.on('offer:accepted', callback);
};

export const onOfferRejected = (callback: (data: OfferStatusPayload) => void) => {
  const socket = getSocket();
  socket?.on('offer:rejected', callback);
};

// ─── Emitters ─────────────────────────────────────────────────────────────────

export const emitCounterOffer = (data: {
  offerId: string;
  price: number;
  note?: string;
}) => {
  const socket = getSocket();
  socket?.emit('offer:counter', data);
};

export const emitAcceptOffer = (offerId: string) => {
  const socket = getSocket();
  socket?.emit('offer:accept', { offerId });
};

export const emitRejectOffer = (offerId: string) => {
  const socket = getSocket();
  socket?.emit('offer:reject', { offerId });
};

// ─── Cleanup ──────────────────────────────────────────────────────────────────

export const offNegotiationEvents = () => {
  const socket = getSocket();
  socket?.off('offer:new');
  socket?.off('offer:counter');
  socket?.off('offer:accepted');
  socket?.off('offer:rejected');
};
