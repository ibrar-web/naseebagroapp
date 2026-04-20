import { Role } from '../../common/constants/roles';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  name: string;
  role: Role;
}

export interface LoginPayload {
  phoneOrEmail: string;
  password: string;
}
