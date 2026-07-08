import { getSocket } from './index';

// ─── Payload types ────────────────────────────────────────────────────────────

export type PostApprovedPayload = {
  id: string;
  code: string;
};

export type PostRejectedPayload = {
  id: string;
  code: string;
  reason: string;
};

export type PostNeedsRevisionPayload = {
  id: string;
  code: string;
  notes: string;
};

// ─── Listeners — each returns its own unsubscribe fn ─────────────────────────

export const onPostApproved = (callback: (data: PostApprovedPayload) => void): (() => void) => {
  getSocket()?.on('post:approved', callback);
  return () => getSocket()?.off('post:approved', callback);
};

export const onPostRejected = (callback: (data: PostRejectedPayload) => void): (() => void) => {
  getSocket()?.on('post:rejected', callback);
  return () => getSocket()?.off('post:rejected', callback);
};

export const onPostNeedsRevision = (callback: (data: PostNeedsRevisionPayload) => void): (() => void) => {
  getSocket()?.on('post:needs_revision', callback);
  return () => getSocket()?.off('post:needs_revision', callback);
};
