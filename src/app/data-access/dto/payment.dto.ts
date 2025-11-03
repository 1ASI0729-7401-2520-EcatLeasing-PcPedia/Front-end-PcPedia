// src/app/data-access/dto/payment.dto.ts
export type PaymentDTO = {
  id: string;
  order_id: string;
  customer_id: string;
  amount: number;
  currency: 'PEN'|'USD';
  status: 'pending'|'paid'|'failed';
  method: 'invoice'|'card';
  invoice_number?: string;
  created_at: string;
  paid_at?: string;
  card_brand?: string;
  card_last4?: string;
};
