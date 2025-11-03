// src/app/domain/services/payment.domain-service.ts
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PaymentsRepository } from '../../data-access/repositories/payment.repository';
import type { Payment } from '../models/payment';

@Injectable({ providedIn: 'root' })
export class PaymentDomainService {
  private payments = inject(PaymentsRepository);

  async createInvoiceForOrder(
    orderId: string,
    customerId: string,
    amount: number,
    currency: 'PEN'|'USD',
    explicitId?: string           // ← opcional para “heredar” el id del pedido
  ): Promise<Payment> {
    const draft: Omit<Payment, 'id'|'createdAt'> = {
      orderId,
      customerId,
      amount,
      currency,
      status: 'pending',
      method: 'invoice',
      invoiceNumber: undefined,
      paidAt: undefined,
      cardBrand: undefined,
      cardLast4: undefined,
    };

    // si quieres “igualar” ids (json-server permite setear id en POST)
    const created = await firstValueFrom(
      this.payments.create(explicitId ? ({ ...draft, id: explicitId } as any) : draft)
    );
    return created;
  }

  listByCustomer(customerId: string) {
    return this.payments.listByCustomer(customerId);
  }
  listByOrder(orderId: string) {
    return this.payments.listByOrderId(orderId);
  }

  async markPaid(id: string, invoiceNumber?: string): Promise<Payment> {
    return await firstValueFrom(
      this.payments.patch(id, {
        status: 'paid',
        paidAt: new Date().toISOString(),
        invoiceNumber,
      })
    );
  }

  async changeToCard(id: string, card: { brand: string; last4: string }) {
    return await firstValueFrom(
      this.payments.patch(id, {
        method: 'card',
        cardBrand: card.brand,
        cardLast4: card.last4,
      })
    );
  }

  /** usado al borrar una orden */
  async deleteByOrder(orderId: string): Promise<void> {
    return await firstValueFrom(this.payments.deleteByOrderId(orderId));
  }
}
