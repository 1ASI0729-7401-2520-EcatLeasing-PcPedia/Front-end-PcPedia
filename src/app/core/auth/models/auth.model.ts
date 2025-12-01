import { User } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponseData {
  token: string;
  tokenType: string;
  user: User;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: AuthResponseData;
  timestamp: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
