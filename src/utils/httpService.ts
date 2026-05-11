import axios from 'axios';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store';
import { ENV } from '../environment';
import { resetAllReduxStates } from '../store/slices/authSlice';

class HttpService {
  service: any;

  constructor() {
    this.service = axios.create({
      baseURL: ENV.API_BASE_URL,
      timeout: ENV.TIMEOUT,
      headers: {
        Authorization: `Bearer ${store.getState().auth.token}`,
      },
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
          Alert.alert('Session Expired', 'Please log in again.');
          store.dispatch(resetAllReduxStates());
          AsyncStorage.clear();
          break;
        case 403:
          Alert.alert('Forbidden', 'You do not have permission to perform this action.');
          break;
        case 422:
          Alert.alert('Validation Error', errorMessage || 'Please check your inputs.');
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
      console.log('Error in handleError:', catchError);
    }
  }

  get(...args: any) {
    return this.service.get(...args);
  }

  post(...args: any) {
    const [path, data] = args;
    if (data instanceof FormData) {
      this.service.defaults.headers['Content-Type'] = 'multipart/form-data';
    }
    return this.service.post(path, data);
  }

  put(...args: any) {
    const [path, data] = args;
    if (data instanceof FormData) {
      this.service.defaults.headers['Content-Type'] = 'multipart/form-data';
    }
    return this.service.put(path, data);
  }

  patch(...args: any) {
    return this.service.patch(...args);
  }

  delete(...args: any) {
    return this.service.delete(...args);
  }
}

export default HttpService;
