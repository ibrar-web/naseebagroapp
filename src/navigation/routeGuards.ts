import { Role } from '../common/constants/roles';

export const canAccessBuyerRoute = (role?: Role | null) => role === 'buyer';
export const canAccessSellerRoute = (role?: Role | null) => role === 'seller';
