import { Company} from '../../core/models';

export interface CompanyDto {
  id: string;
  name: string;
  taxId?: string;
  slug?: string;
  address?: string;
  logoUrl?: string;
  createdAt?: string; // ISO from API
  updatedAt?: string;
}

export const companyFromDto = (dto: CompanyDto): Company => ({
  id: dto.id,
  name: dto.name,
  taxId: dto.taxId ?? '',
  slug: dto.slug ?? '',
  address: dto.address ?? '',
  logoUrl: dto.logoUrl ?? '',
  createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
  updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined,
});

export const companyToDto = (m: Company): CompanyDto => ({
  id: m.id,
  name: m.name,
  taxId: m.taxId,
  slug: m.slug,
  address: m.address,
  logoUrl: m.logoUrl,
  createdAt: m.createdAt?.toISOString(),
  updatedAt: m.updatedAt?.toISOString(),
});
