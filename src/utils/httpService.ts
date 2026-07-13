import axios from 'axios';
import EncryptedStorage from 'react-native-encrypted-storage';
import { store } from '../store';
import { ENV } from '../environment';
import { resetAllReduxStates } from '../store/slices/authSlice';
import { showAuthRequiredSheet } from '../app/auth/utils/authRequiredSheet';

type HttpServiceOptions = {
  authRequired?: boolean;
  authOptional?: boolean;
};

class HttpService {
  service: any;
  private authRequired: boolean;
  private authOptional: boolean;

  constructor(options: HttpServiceOptions = {}) {
    this.authRequired = Boolean(options.authRequired);
    this.authOptional = Boolean(options.authOptional);

    const token = store.getState().auth.token;
    const headers: Record<string, string> = {};
    if (token && (this.authRequired || this.authOptional)) {
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

      const status = error?.response?.status ?? error.message;
      console.log('[HTTP]', status, error?.response?.data?.message ?? error.message);

      // 401 is handled globally — log out and show auth sheet
      if (status === 401) {
        store.dispatch(resetAllReduxStates());
        EncryptedStorage.removeItem('session').catch(() => undefined);
        showAuthRequiredSheet();
      }

      // All other errors are rejected and handled by the calling screen
      return Promise.reject(error);
    } catch (catchError) {
      console.log('Error in handleError:', catchError);
    }
  }

  ensureAuthorized() {
    if (this.authOptional) {
      const token = store.getState().auth.token;
      if (token) {
        this.service.defaults.headers.Authorization = `Bearer ${token}`;
      }
      return null;
    }

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
