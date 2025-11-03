import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { OrdersRepository } from '../../data-access/repositories/order.repository';
import { PaymentsRepository } from '../../data-access/repositories/payment.repository';

// Modelos de dominio
import type { Order, OrderItem } from '../models/order';
import type { Payment } from '../models/payment';

@Injectable({ providedIn: 'root' })
export class OrderDomainService {
  private orders = inject(OrdersRepository);
  private payments = inject(PaymentsRepository);

  /**
   * Crea una orden desde checkout y a la vez genera un pago "pending".
   * El pago tendrá el MISMO id que la orden (para que no se confundan).
   */
  async createFromCheckout(draft: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    // 1) Crear orden
    const created = await firstValueFrom(this.orders.create(draft)); // => Order con id/createdAt

    // 2) Crear pago "pending" con el MISMO ID de la orden
    const amountMonthly = (created.items ?? []).reduce((acc, it) => acc + (it.pricePerMonth ?? 0) * it.quantity, 0);

    // El repositorio de pagos mapea camelCase -> snake_case y permite id opcional
    await firstValueFrom(this.payments.create({
      id: created.id,                 // MISMO id que la orden
      orderId: created.id,
      customerId: created.customerId,
      amount: amountMonthly,
      currency: created.currency,
      status: 'pending',
      method: 'invoice',
      // NO enviamos dueAt para evitar errores — si te interesa, puedes calcularlo en repo
    } as Omit<Payment, 'createdAt'> & { id: string }));

    return created;
  }

  /**
   * Elimina la orden y todos sus pagos asociados (por orderId).
   */
  async deleteOrderAndPayments(orderId: string): Promise<void> {
    // borrar pagos del orderId
    await firstValueFrom(this.payments.deleteByOrderId(orderId));
    // borrar orden
    await firstValueFrom(this.orders.delete(orderId));
  }
}
