import { showConfirm } from '../../components/toastConfig';

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
    showConfirm(
      'warning',
      'Profile Incomplete',
      'Please complete your profile verification before creating posts or sending offers.',
      () => navigation.navigate('VerificationStatus'),
    );
    return false;
  }
  return true;
};
