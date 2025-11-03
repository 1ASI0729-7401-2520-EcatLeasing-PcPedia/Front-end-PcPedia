export interface Company {
  id: string;
  name: string;
  taxId: string;
  slug?: string;
  address?: string;
  logoUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
