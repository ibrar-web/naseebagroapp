import { Role } from '../constants/roles';

export interface UserProfile {
  id: string;
  fullName: string;
  phone?: string;
  role: Role;
}

export interface ApiError {
  status?: number;
  message: string;
  code?: string;
}
