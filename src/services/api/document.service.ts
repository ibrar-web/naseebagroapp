import { apiClient } from '../../utils/axiosConfig';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints';

export const documentService = {
  upload: (formData: FormData) =>
    apiClient.post(API_ENDPOINTS.documents.upload, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
