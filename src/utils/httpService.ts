import axios from 'axios';
import { Alert } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import { store } from '../store';
import { ENV } from '../environment';
import { resetAllReduxStates } from '../store/slices/authSlice';
import { showAuthRequiredSheet } from '../app/auth/utils/authRequiredSheet';

type HttpServiceOptions = {
  authRequired?: boolean;
};

class HttpService {
  service: any;
  private authRequired: boolean;

  constructor(options: HttpServiceOptions = {}) {
    this.authRequired = Boolean(options.authRequired);

    const token = store.getState().auth.token;
    const headers: Record<string, string> = {};
    if (token && this.authRequired) {
      headers.Authorization = `Bearer ${token}`;
    }

    this.service = axios.create({
      baseURL: ENV.API_BASE_URL,
      timeout: ENV.TIMEOUT,
      headers,
    });

    this.service.interceptors.response.use(
      this.handleSuccess,
      this.handleError,
    );
  }

  handleSuccess(response: any) {
    return response;
  }

  handleError(error: any) {
    try {
      if (axios.isCancel(error)) {
        return Promise.reject(error);
      }

      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        Alert.alert('Timeout', 'Request timed out. Please try again later.');
        return Promise.reject(error);
      }

      const status = error?.response?.status ?? error.message;
      const errorMessage =
        error?.response?.data?.message || 'Something went wrong.';

      switch (status) {
        case 'Network Error':
          Alert.alert('Network Error', `Cannot reach server.`);
          break;
        case 400:
          Alert.alert('Error', errorMessage);
          break;
        case 401:
          store.dispatch(resetAllReduxStates());
          EncryptedStorage.removeItem('session').catch(() => undefined);
          showAuthRequiredSheet();
          break;
        case 403:
          Alert.alert(
            'Forbidden',
            'You do not have permission to perform this action.',
          );
          break;
        case 422:
          Alert.alert(
            'Validation Error',
            errorMessage || 'Please check your inputs.',
          );
          break;
        case 500:
          Alert.alert(
            'Server Error',
            'A server error occurred. Please try again later.',
          );
          break;
        default:
          Alert.alert(
            'Error',
            'An unexpected error occurred. Please try again.',
          );
          break;
      }

      return Promise.reject(error);
    } catch (catchError) {
      console.log('Error in handleError:', catchError);
    }
  }

  ensureAuthorized() {
    if (!this.authRequired) {
      return null;
    }

    const token = store.getState().auth.token;

    if (token) {
      this.service.defaults.headers.Authorization = `Bearer ${token}`;
      return null;
    }

    const error = new Error('Login required') as Error & { code: string };
    error.code = 'AUTH_REQUIRED';
    showAuthRequiredSheet();
    return Promise.reject(error);
  }

  get(...args: any) {
    const authError = this.ensureAuthorized();
    if (authError) return authError;
    return this.service.get(...args);
  }

  post(...args: any) {
    const authError = this.ensureAuthorized();
    if (authError) return authError;
    const [path, data] = args;
    if (data instanceof FormData) {
      this.service.defaults.headers['Content-Type'] = 'multipart/form-data';
    }
    return this.service.post(path, data);
  }

  put(...args: any) {
    const authError = this.ensureAuthorized();
    if (authError) return authError;
    const [path, data] = args;
    if (data instanceof FormData) {
      this.service.defaults.headers['Content-Type'] = 'multipart/form-data';
    }
    return this.service.put(path, data);
  }

  patch(...args: any) {
    const authError = this.ensureAuthorized();
    if (authError) return authError;
    const [path, data] = args;
    if (data instanceof FormData) {
      this.service.defaults.headers['Content-Type'] = 'multipart/form-data';
    }
    return this.service.patch(path, data);
  }

  delete(...args: any) {
    const authError = this.ensureAuthorized();
    if (authError) return authError;
    return this.service.delete(...args);
  }
}

export default HttpService;
