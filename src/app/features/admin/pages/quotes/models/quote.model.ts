import { BaseEntity, QuoteStatus } from '../../../../../shared/models/base.model';

export interface QuoteItem {
  id: number;
  equipmentId: number;
  equipmentName: string;
  equipmentBrand?: string;
  equipmentModel?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Quote extends BaseEntity {
  requestId: number;
  userId: number;
  userName?: string;
  companyName?: string;
  items: QuoteItem[];
  totalMonthly: number;
  durationMonths: number;
  validUntil: string;
  terms?: string;
  status: QuoteStatus;
  sentAt?: string;
}

export interface CreateQuoteRequest {
  requestId: number;
  items: {
    equipmentId: number;
    quantity: number;
    unitPrice: number;
  }[];
  durationMonths: number;
  validUntil: string;
  notes?: string;
}
