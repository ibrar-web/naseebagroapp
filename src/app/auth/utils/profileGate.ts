import { Alert } from 'react-native';

type MinUser = { is_verified?: boolean; profile_completion?: number } | null | undefined;

export const requireCompleteProfile = (user: MinUser, navigation: any): boolean => {
  if (user?.is_verified) return true;

  const completion = user?.profile_completion ?? 0;
  if (completion < 100) {
    Alert.alert(
      'Profile Incomplete',
      'Please complete your profile verification before creating posts or sending offers.',
      [
        { text: 'Complete Profile', onPress: () => navigation.navigate('VerificationStatus') },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  } else {
    Alert.alert(
      'Profile Under Review',
      'Your profile has been submitted and is under admin review. You can post once it is approved.',
      [{ text: 'OK' }],
    );
  }
  return false;
};
