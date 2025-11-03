// src/app/data-access/adapters/payment.adapter.ts
import type { Payment } from '../../domain/models/payment';
import type { PaymentDTO } from '../dto/payment.dto';

export const PaymentAdapter = {
  toDomain(dto: PaymentDTO): Payment {
    return {
      id: dto.id,
      orderId: dto.order_id,
      customerId: dto.customer_id,
      amount: dto.amount,
      currency: dto.currency,
      status: dto.status,              // 'pending' | 'paid' | 'failed'
      method: dto.method,              // 'invoice' | 'card'
      invoiceNumber: dto.invoice_number ?? null,
      createdAt: dto.created_at,
      paidAt: dto.paid_at ?? null,
      cardBrand: dto.card_brand ?? null,
      cardLast4: dto.card_last4 ?? null,
    };
  },
  toDTO(m: Payment): PaymentDTO {
    return {
      id: m.id!,
      order_id: m.orderId,
      customer_id: m.customerId,
      amount: m.amount,
      currency: m.currency,
      status: m.status,
      method: m.method,
      invoice_number: m.invoiceNumber ?? undefined,
      created_at: m.createdAt,
      paid_at: m.paidAt ?? undefined,
      card_brand: m.cardBrand ?? undefined,
      card_last4: m.cardLast4 ?? undefined,
    };
  },
};
