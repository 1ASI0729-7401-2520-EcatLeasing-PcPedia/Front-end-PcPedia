// src/app/data-access/repositories/order.repository.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Order, OrderItem } from '../../domain/models/order';

type OrderItemDTO = {
  device_id: string;
  quantity: number;
  price_per_month?: number | null;
};

type OrderDTO = {
  id: string;
  customer_id: string;
  status: Order['status'];
  created_at: string;
  currency: Order['currency'];
  items: OrderItemDTO[];
  notes?: string;
  contact?: { name: string; email: string };
  billing?: { ruc: string; address: string };
};

@Injectable({ providedIn: 'root' })
export class OrdersRepository {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiBase}/orders`;

  private toDomain = (dto: OrderDTO): Order => ({
    id: dto.id,
    customerId: dto.customer_id,
    status: dto.status,
    createdAt: dto.created_at,
    currency: dto.currency,
    items: dto.items.map(i => ({
      deviceId: i.device_id,
      quantity: i.quantity,
      pricePerMonth: (i.price_per_month ?? 0), // ← asegura number
    })),
    notes: dto.notes,
    contact: dto.contact,
    billing: dto.billing,
  });

  private toDTO = (o: Omit<Order, 'id'|'createdAt'>): Omit<OrderDTO,'id'|'created_at'> => ({
    customer_id: o.customerId,
    status: o.status,
    currency: o.currency,
    items: o.items.map(i => ({
      device_id: i.deviceId,
      quantity: i.quantity,
      price_per_month: i.pricePerMonth ?? 0, // ← asegura number
    })),
    notes: o.notes,
    contact: o.contact,
    billing: o.billing,
  });

  listByCustomer(customerId: string): Observable<Order[]> {
    const url = `${this.base}?customer_id=${encodeURIComponent(customerId)}&_sort=created_at&_order=desc`;
    return this.http.get<OrderDTO[]>(url).pipe(map(list => list.map(this.toDomain)));
  }

  getById(id: string): Observable<Order> {
    return this.http.get<OrderDTO>(`${this.base}/${id}`).pipe(map(this.toDomain));
  }

  create(order: Omit<Order,'id'|'createdAt'>): Observable<Order> {
    const dto = this.toDTO(order);
    return this.http.post<OrderDTO>(this.base, {
      ...dto,
      created_at: new Date().toISOString(),
    }).pipe(map(this.toDomain));
  }

  patch(id: string, partial: Partial<Order>): Observable<Order> {
    const dtoPatch: Partial<OrderDTO> = {};
    if (partial.status) dtoPatch.status = partial.status;
    if (partial.notes) dtoPatch.notes = partial.notes;
    if (partial.items) {
      dtoPatch.items = partial.items.map(i => ({
        device_id: i.deviceId,
        quantity: i.quantity,
        price_per_month: i.pricePerMonth ?? 0,
      }));
    }
    return this.http.patch<OrderDTO>(`${this.base}/${id}`, dtoPatch).pipe(map(this.toDomain));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
