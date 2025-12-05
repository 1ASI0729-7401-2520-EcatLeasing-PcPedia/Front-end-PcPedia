import { BaseEntity } from '../../../../../shared/models/base.model';
import { Role, User as BaseUser } from '../../../../../core/auth/models/user.model';

export { User } from '../../../../../core/auth/models/user.model';
export { Role } from '../../../../../core/auth/models/user.model';

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
