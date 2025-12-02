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
  status: QuoteStatus;
  totalMonthly: number;
  durationMonths: number;
  validUntil: string;
  terms?: string;
  items: QuoteItem[];
  sentAt?: string;
}

export interface RejectQuoteRequest {
  reason: string;
}
