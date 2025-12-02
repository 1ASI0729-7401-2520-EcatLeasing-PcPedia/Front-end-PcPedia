import { BaseEntity, InvoiceStatus } from '../../../../../shared/models/base.model';

export interface Invoice extends BaseEntity {
  contractId: number;
  contractNumber?: string;
  userId: number;
  userName?: string;
  userCompany?: string;
  userEmail?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  paidAmount?: number;
  pendingAmount?: number;
  status: InvoiceStatus;
  paidAt?: string;
  paymentReference?: string;
  description?: string;
}

export interface CreateInvoiceRequest {
  contractId: number;
  issueDate: string;
  dueDate: string;
  amount: number;
}

export interface MarkPaidRequest {
  paymentReference?: string;
}
