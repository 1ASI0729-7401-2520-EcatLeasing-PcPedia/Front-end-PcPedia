import { BaseEntity } from '../../../shared/models/base.model';

export enum Role {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT'
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  companyName?: string;
  ruc?: string;
  phone?: string;
  address?: string;
  role: Role;
  isActive: boolean;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  companyName?: string;
  ruc?: string;
  phone?: string;
  address?: string;
}

export interface UpdateUserRequest {
  name?: string;
  companyName?: string;
  ruc?: string;
  phone?: string;
  address?: string;
}
