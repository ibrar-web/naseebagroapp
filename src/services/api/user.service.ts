import { apiClient } from '../../utils/axiosConfig';

export const userService = {
  getProfile: () => apiClient.get('/user/profile'),
  updateProfile: (payload: Record<string, unknown>) => apiClient.put('/user/profile', payload),
};
