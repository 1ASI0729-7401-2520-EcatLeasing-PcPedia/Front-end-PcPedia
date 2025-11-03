export interface Role { name: string; }

export interface User {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  avatarUrl?: string;
  tenant?: string;
}

// API response you expect from login/profile endpoints
export interface LoginResponse {
  token: string;
  user: User;
}
