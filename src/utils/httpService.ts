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

    this.service.interceptors.request.use(
      (config: any) => {
        const fullUrl = `${config.baseURL ?? ''}/${config.url ?? ''}`.replace(/([^:]\/)\/+/g, '$1');
        console.log('[HTTP REQUEST]', config.method?.toUpperCase(), fullUrl);
        console.log('[HTTP REQUEST] headers:', JSON.stringify(config.headers));
        if (config.data) {
          console.log('[HTTP REQUEST] body:', typeof config.data === 'string' ? config.data : JSON.stringify(config.data));
        }
        return config;
      },
      (error: any) => {
        console.error('[HTTP REQUEST ERROR]', error?.message);
        return Promise.reject(error);
      },
    );

    this.service.interceptors.response.use(
      this.handleSuccess,
      this.handleError,
    );
  }

  handleSuccess(response: any) {
    console.log('[HTTP RESPONSE]', response?.status, response?.config?.url);
    return response;
  }

  handleError(error: any) {
    const status = error?.response?.status;
    const url = error?.config?.url ?? 'unknown';
    const baseURL = error?.config?.baseURL ?? ENV.API_BASE_URL;
    const fullUrl = `${baseURL}/${url}`.replace(/([^:]\/)\/+/g, '$1');
    const responseData = error?.response?.data;
    const errorCode = error?.code;

    console.error('[HTTP ERROR] URL:', fullUrl);
    console.error('[HTTP ERROR] status:', status);
    console.error('[HTTP ERROR] code:', errorCode);
    console.error('[HTTP ERROR] message:', error?.message);
    console.error('[HTTP ERROR] response data:', JSON.stringify(responseData));

    try {
      if (axios.isCancel(error)) {
        return Promise.reject(error);
      }

      if (status === 401) {
        store.dispatch(resetAllReduxStates());
        EncryptedStorage.removeItem('session').catch(() => undefined);
        showAuthRequiredSheet();
      }

      return Promise.reject(error);
    } catch (catchError) {
      console.error('[HTTP ERROR] handleError catch:', catchError);
      return Promise.reject(error);
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

    console.warn('[HTTP] No auth token — request blocked before sending');

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
