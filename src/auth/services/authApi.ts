import { apiClient } from '../../utils/axiosConfig';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints';
import { LoginPayload } from '../types/auth.types';

export const authApi = {
  login: (payload: LoginPayload) => apiClient.post(API_ENDPOINTS.auth.login, payload),
  register: (payload: Record<string, unknown>) => apiClient.post(API_ENDPOINTS.auth.register, payload),
  verifyOtp: (payload: { otp: string; requestId: string }) =>
    apiClient.post(API_ENDPOINTS.auth.otpVerify, payload),
};
