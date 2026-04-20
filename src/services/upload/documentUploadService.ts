import { documentService } from '../api/document.service';

export const documentUploadService = {
  uploadBilti: (formData: FormData) => documentService.upload(formData),
  uploadWaybill: (formData: FormData) => documentService.upload(formData),
  uploadPonch: (formData: FormData) => documentService.upload(formData),
};
