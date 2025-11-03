// src/app/data-access/http/orders.http.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../../../environments/environment';

export type OrderDTO = {
  id: string;
  customer_id: string;
  status: 'created'|'approved'|'in_transit'|'delivered'|'cancelled';
  created_at: string;
  items: Array<{ device_id: string; quantity: number; price_per_month: number }>;
  currency: string;
  notes?: string;
};

@Injectable({ providedIn: 'root' })
export class OrdersHttp {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiBase}/orders`; // usa tu environment si prefieres

  listByCustomer(customerId: string) {
    return this.http.get<OrderDTO[]>(`${this.base}?customer_id=${encodeURIComponent(customerId)}&_sort=created_at&_order=desc`);
  }

  getById(id: string) {
    return this.http.get<OrderDTO>(`${this.base}/${id}`);
  }

  create(body: Omit<OrderDTO, 'id'>) {
    return this.http.post<OrderDTO>(this.base, body);      // 👈 NADA de /orders/checkout
  }
}
