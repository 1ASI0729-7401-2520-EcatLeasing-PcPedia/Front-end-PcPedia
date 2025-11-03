export type PaymentMethod = 'visa' | 'mastercard' | 'amex' | 'wire' | 'cash';
export type PaymentStatus = 'pending' | 'confirmed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt: Date | null;
  reference: string;
  invoiceUrl: string;
}
