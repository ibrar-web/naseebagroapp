import { Alert } from 'react-native';

type MinUser =
  | { is_verified?: boolean; profile_completion?: number }
  | null
  | undefined;

export const requireCompleteProfile = (
  user: MinUser,
  navigation: any,
): boolean => {
  if (user?.is_verified) return true;
  console.log('user?.profile_completion: ', user?.profile_completion);
  const completion = user?.profile_completion ?? 0;
  if (completion < 100) {
    Alert.alert(
      'Profile Incomplete',
      'Please complete your profile verification before creating posts or sending offers.',
      [
        {
          text: 'Complete Profile',
          onPress: () => navigation.navigate('VerificationStatus'),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
    return false;
  }
  return true;
};
