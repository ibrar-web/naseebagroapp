import axios from 'axios';
import { Alert } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import { store } from '../store';
import { ENV } from '../environment';
import { resetAllReduxStates } from '../store/slices/authSlice';
import { showAuthRequiredSheet } from '../app/auth/utils/authRequiredSheet';
import { navigationRef } from '../navigation/AppNavigator';

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
      const errorMessage: string = error?.response?.data?.message || 'Something went wrong.';
      console.log('[HTTP ERROR] status:', status, errorMessage);

      switch (status) {
        case 'Network Error':
          Alert.alert('Network Error', 'Cannot reach server. Please check your connection.');
          break;

        case 400:
          Alert.alert('Error', errorMessage);
          break;

        case 401: {
          const currentRoute = navigationRef.isReady() ? navigationRef.getCurrentRoute()?.name : null;
          if (currentRoute === 'Login') {
            // Let the login screen's catch block handle the error with its own Alert
            break;
          }
          store.dispatch(resetAllReduxStates());
          EncryptedStorage.removeItem('session').catch(() => undefined);
          showAuthRequiredSheet();
          break;
        }

        case 403: {
          const isProfileIncomplete = errorMessage.toLowerCase().includes('profile');
          Alert.alert(
            isProfileIncomplete ? 'Profile Incomplete' : 'Access Denied',
            errorMessage,
            isProfileIncomplete
              ? [
                  {
                    text: 'Complete Profile',
                    onPress: () => {
                      if (navigationRef.isReady()) {
                        navigationRef.navigate('VerificationStatus' as any);
                      }
                    },
                  },
                  { text: 'Cancel', style: 'cancel' },
                ]
              : [{ text: 'OK' }],
          );
          break;
        }

        case 409:
          Alert.alert('Alert', errorMessage);
          break;

        case 422:
          Alert.alert('Validation Error', errorMessage || 'Please check your inputs.');
          break;

        case 404:
          // Let the screen handle not-found — no global alert
          break;

        case 500:
          Alert.alert('Server Error', 'A server error occurred. Please try again later.');
          break;

        default:
          Alert.alert('Error', 'An unexpected error occurred. Please try again.');
          break;
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
