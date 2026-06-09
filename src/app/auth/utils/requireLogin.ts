import { Alert } from 'react-native';
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

  Alert.alert('Login Required', 'Please log in to continue.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Log In', onPress: () => navigateToLogin(navigation) },
  ]);
};
