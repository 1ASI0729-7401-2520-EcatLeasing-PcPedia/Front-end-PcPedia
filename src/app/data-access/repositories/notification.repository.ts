// src/app/data-access/repositories/notification.repository.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map, Observable } from 'rxjs';

export type Notification = {
  id: string;
  customerId?: string;               // opcional para filtrar por cliente
  type: 'system'|'maintenance'|'order'|'payment';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

@Injectable({ providedIn: 'root' })
export class NotificationsRepository {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/notifications`;

  /** Lista para un usuario/cliente (si no se usa multiusuario, pasa 'cus_demo') */
  listForUser(customerId: string): Observable<Notification[]> {
    // En json-server filtramos por customer_id si existiera, y ordenamos por fecha desc
    let params = new HttpParams()
      .set('_sort', 'created_at')
      .set('_order', 'desc');
    if (customerId) params = params.set('customer_id', customerId);

    return this.http.get<any[]>(this.base, { params }).pipe(
      map(list => list.map(n => this.toModel(n)))
    );
  }

  markRead(id: string): Observable<Notification> {
    return this.http.patch<any>(`${this.base}/${id}`, { read: true }).pipe(
      map(n => this.toModel(n))
    );
  }

  /** Crear notificación. Si no envías createdAt, se setea ahora. */
  create(input: Omit<Notification, 'id'|'createdAt'> & { createdAt?: string }): Observable<Notification> {
    const dto = {
      customer_id: input.customerId ?? 'cus_demo',
      type: input.type,
      title: input.title,
      body: input.body,
      read: input.read ?? false,
      created_at: input.createdAt ?? new Date().toISOString(),
    };
    return this.http.post<any>(this.base, dto).pipe(map(n => this.toModel(n)));
  }

  /** Conteo de no leídas para el badge del header */
  countUnread(customerId: string): Observable<number> {
    return this.listForUser(customerId).pipe(
      map(list => list.filter(n => !n.read).length)
    );
  }

  // ------------ mapping helpers ------------
  private toModel(n: any): Notification {
    return {
      id: n.id,
      customerId: n.customer_id ?? undefined,
      type: n.type,
      title: n.title,
      body: n.body,
      read: !!n.read,
      createdAt: n.created_at,
    };
  }
}
