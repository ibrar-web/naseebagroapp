import { CommonActions } from '@react-navigation/native';
import { showAlert } from '../../components/toastConfig';
import { secureStorage } from '../../../utils/secureStorage';
import { store } from '../../../store';
import { resetAllReduxStates } from '../../../store/slices/authSlice';
import { navigationRef } from '../../../navigation/AppNavigator';

// Server message when a token belongs to an account that no longer exists.
export const ACCOUNT_GONE_MESSAGE = 'Account no longer exists';

/**
 * Clears the session and returns to Login. Used when the account is deleted,
 * here or on another device where the user is still logged in.
 */
export const forceLogout = (title: string, body?: string) => {
  store.dispatch(resetAllReduxStates());
  secureStorage.removeItem('session').catch(() => undefined);

  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] }),
    );
  }
  showAlert('info', title, body);
};
