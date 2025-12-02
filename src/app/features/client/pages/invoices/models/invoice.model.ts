import { BaseEntity, InvoiceStatus } from '../../../../../shared/models/base.model';

export interface Invoice extends BaseEntity {
  contractId: number;
  contractNumber?: string;
  userId: number;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
}
