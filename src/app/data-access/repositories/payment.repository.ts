// src/app/data-access/repositories/payment.repository.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Payment } from '../../domain/models/payment';

// DTO que vive en json-server (snake_case)
type PaymentDTO = {
  id: string;                   // forzamos string
  order_id: string;
  customer_id: string;
  amount: number;
  currency: 'PEN'|'USD';
  status: 'pending'|'paid'|'failed';
  method: 'invoice'|'card'|'transfer';
  invoice_number?: string | null;
  paid_at?: string | null;
  card_brand?: string | null;
  card_last4?: string | null;
  created_at: string;
};

@Injectable({ providedIn: 'root' })
export class PaymentsRepository {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/payments`;

  // ---- mapeos
  private toDomain = (d: PaymentDTO): Payment => ({
    id: d.id,                                // ← string garantizado
    orderId: d.order_id,
    customerId: d.customer_id,
    amount: d.amount,
    currency: d.currency,
    status: d.status,
    method: d.method === 'transfer' ? 'invoice' : d.method, // si tu dominio no tiene 'transfer'
    invoiceNumber: d.invoice_number ?? undefined,
    paidAt: d.paid_at ?? undefined,
    cardBrand: d.card_brand ?? undefined,
    cardLast4: d.card_last4 ?? undefined,
    createdAt: d.created_at,
  });

  private toDTO = (p: Omit<Payment, 'id'|'createdAt'>): Omit<PaymentDTO,'id'|'created_at'> => ({
    order_id: p.orderId,
    customer_id: p.customerId,
    amount: p.amount,
    currency: p.currency,
    status: p.status,
    method: p.method, // ('transfer' no existe en dominio, si lo necesitas agrega acá)
    invoice_number: p.invoiceNumber ?? null,
    paid_at: p.paidAt ?? null,
    card_brand: p.cardBrand ?? null,
    card_last4: p.cardLast4 ?? null,
  });

  // ---- API
  listByCustomer(customerId: string): Observable<Payment[]> {
    let params = new HttpParams()
      .set('customer_id', customerId)
      .set('_sort', 'created_at')
      .set('_order', 'desc');
    return this.http.get<PaymentDTO[]>(this.base, { params }).pipe(
      map(rows => rows.map(this.toDomain))
    );
  }

  listByOrderId(orderId: string): Observable<Payment[]> {
    const params = new HttpParams().set('order_id', orderId);
    return this.http.get<PaymentDTO[]>(this.base, { params }).pipe(
      map(rows => rows.map(this.toDomain))
    );
  }

  /** crear pago (por ejemplo, “invoice pending” al crear una Order) */
  create(p: Omit<Payment, 'id'|'createdAt'>): Observable<Payment> {
    const dto = this.toDTO(p);
    return this.http.post<PaymentDTO>(this.base, {
      ...dto,
      created_at: new Date().toISOString(),
    }).pipe(map(this.toDomain));
  }

  patch(id: string, partial: Partial<Payment>): Observable<Payment> {
    const patch: Partial<PaymentDTO> = {};
    if (partial.status) patch.status = partial.status;
    if (partial.method) patch.method = partial.method;
    if (partial.invoiceNumber !== undefined) patch.invoice_number = partial.invoiceNumber ?? null;
    if (partial.paidAt !== undefined) patch.paid_at = partial.paidAt ?? null;
    if (partial.cardBrand !== undefined) patch.card_brand = partial.cardBrand ?? null;
    if (partial.cardLast4 !== undefined) patch.card_last4 = partial.cardLast4 ?? null;

    return this.http.patch<PaymentDTO>(`${this.base}/${id}`, patch).pipe(
      map(this.toDomain)
    );
  }

  /** Borra todos los pagos relacionados a una orden */
  deleteByOrderId(orderId: string): Observable<void> {
    // json-server no admite delete masivo; listamos y borramos 1x1
    return new Observable<void>(sub => {
      this.listByOrderId(orderId).subscribe({
        next: rows => {
          if (!rows.length) { sub.next(); sub.complete(); return; }
          let pending = rows.length;
          rows.forEach(r => {
            this.http.delete<void>(`${this.base}/${r.id}`).subscribe({
              next: () => { if (--pending === 0) { sub.next(); sub.complete(); } },
              error: err => sub.error(err),
            });
          });
        },
        error: err => sub.error(err),
      });
    });
  }
}
