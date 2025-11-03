// Raw payload as it comes from the API
export interface CompanyDto {
  id: string;
  name: string;
  tax_id?: string;
  slug?: string;
  address?: string;
  logo_url?: string;
  created_at?: string; // ISO date
  updated_at?: string; // ISO date
}
