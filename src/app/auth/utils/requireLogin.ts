import { showConfirm } from '../../components/toastConfig';
import { showAuthRequiredSheet } from './authRequiredSheet';

const getRootNavigation = (navigation: any) =>
  navigation?.getParent?.() ?? navigation;

export const navigateToLogin = (navigation: any) => {
  getRootNavigation(navigation)?.navigate?.('Login');
};

export const promptLogin = (navigation: any) => {
  const shown = showAuthRequiredSheet();

  if (shown) {
    return;
  }

  showConfirm('info', 'Login Required', 'Please log in to continue.', () => navigateToLogin(navigation));
};
