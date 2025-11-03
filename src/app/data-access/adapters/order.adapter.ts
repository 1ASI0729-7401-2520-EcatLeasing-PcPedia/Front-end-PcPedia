// src/app/data-access/adapters/order.adapter.ts
import type { Order } from '../../domain/models/order';
import type { OrderDTO } from '../dto/order.dto';

export const OrderAdapter = {
  // DTO (snake_case) -> Dominio (camelCase)
  toDomain(dto: OrderDTO): Order {
    return {
      id: dto.id,
      customerId: dto.customer_id,
      status: dto.status,
      createdAt: dto.created_at,
      items: dto.items.map(i => ({
        deviceId: i.device_id,
        quantity: i.quantity,
        pricePerMonth: i.price_per_month,
      })),
      currency: dto.currency,
      notes: dto.notes,
      contact: dto.contact,
      billing: dto.billing,
    };
  },

  // Dominio (camelCase) -> DTO (snake_case)
  // Si en otros sitios construyes el pedido SIN id, mantén Omit<Order, 'id'> aquí.
  toDTO(model: Omit<Order, 'id'>): Omit<OrderDTO, 'id'> {
    return {
      customer_id: model.customerId,
      status: model.status,
      created_at: model.createdAt,
      items: model.items.map(i => ({
        device_id: i.deviceId,
        quantity: i.quantity,
        price_per_month: i.pricePerMonth,
      })),
      currency: model.currency,
      notes: model.notes,
      contact: model.contact,
      billing: model.billing,
    };
  },
};
