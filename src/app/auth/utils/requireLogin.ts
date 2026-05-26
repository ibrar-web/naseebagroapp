import { Alert } from 'react-native';

const getRootNavigation = (navigation: any) =>
  navigation?.getParent?.() ?? navigation;

export const navigateToLogin = (navigation: any) => {
  getRootNavigation(navigation)?.navigate?.('Login');
};

export const promptLogin = (navigation: any) => {
  Alert.alert('Login Required', 'Please log in to continue.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Log In', onPress: () => navigateToLogin(navigation) },
  ]);
};
