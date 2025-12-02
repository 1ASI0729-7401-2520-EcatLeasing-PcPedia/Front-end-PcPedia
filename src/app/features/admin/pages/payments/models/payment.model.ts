import { BaseEntity, PaymentMethod } from '../../../../../shared/models/base.model';

export interface Payment extends BaseEntity {
  invoiceId: number;
  invoiceNumber?: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  paymentDate: string;
  notes?: string;
}

export interface RegisterPaymentRequest {
  invoiceId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  reference?: string;
  paymentDate: string;
  notes?: string;
}
