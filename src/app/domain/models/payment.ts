// src/app/domain/models/payment.ts
export type Payment = {
  id?: string;
  orderId: string;
  customerId: string;
  amount: number;
  currency: 'PEN'|'USD';
  status: 'pending'|'paid'|'failed';
  method: 'invoice'|'card';
  invoiceNumber?: string | null;
  createdAt: string;
  paidAt?: string | null;
  cardBrand?: string | null;
  cardLast4?: string | null;
};
