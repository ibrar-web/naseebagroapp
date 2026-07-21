import { getSocket } from './index';

export type KycUpdatedPayload = {
  user_id: string;
  kyc_status: 'approved' | 'rejected';
  reason?: string | null;
};

export type BusinessUpdatedPayload = {
  user_id: string;
  status: 'approved' | 'rejected';
  reason?: string | null;
};

export type BankUpdatedPayload = {
  user_id: string;
  bank_id: string;
  status: 'approved' | 'rejected';
  reason?: string | null;
};

export const onKycUpdated = (callback: (data: KycUpdatedPayload) => void): (() => void) => {
  getSocket()?.on('profile.kyc_updated', callback);
  return () => getSocket()?.off('profile.kyc_updated', callback);
};

export const onBusinessUpdated = (callback: (data: BusinessUpdatedPayload) => void): (() => void) => {
  getSocket()?.on('profile.business_updated', callback);
  return () => getSocket()?.off('profile.business_updated', callback);
};

export const onBankUpdated = (callback: (data: BankUpdatedPayload) => void): (() => void) => {
  getSocket()?.on('profile.bank_updated', callback);
  return () => getSocket()?.off('profile.bank_updated', callback);
};

export type BasicUpdatedPayload = {
  user_id: string;
  status: 'approved' | 'rejected';
  reason?: string | null;
};

export const onBasicUpdated = (callback: (data: BasicUpdatedPayload) => void): (() => void) => {
  getSocket()?.on('profile.basic_updated', callback);
  return () => getSocket()?.off('profile.basic_updated', callback);
};
