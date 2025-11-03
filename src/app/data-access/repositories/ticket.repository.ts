import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { TicketHttp} from '../http/ticket/ticket.http';
import { TicketDto } from '../dto/ticket.dto';
import { Ticket } from '../../domain/models/ticket';

@Injectable({ providedIn: 'root' })
export class TicketRepository {
  private api = inject(TicketHttp);

  listByCustomer(customerId: string): Observable<Ticket[]> {
    return this.api.listByCustomer(customerId).pipe(
      map(rows => (rows ?? []).map(this.toDomain))
    );
  }

  getById(id: string): Observable<Ticket> {
    return this.api.getById(id).pipe(map(this.toDomain));
  }

  create(t: Omit<Ticket, 'id' | 'createdAt'>): Observable<Ticket> {
    const dto: Omit<TicketDto, 'id' | 'created_at'> = {
      subject: t.subject,
      status: t.status,
      priority: t.priority,
      device_id: t.deviceId ?? null,
      updates: t.updates?.map(u => ({
        at: u.at.toISOString(),
        message: u.message,
        by: u.by,
        status: u.status
      }))
    };
    return this.api.create(dto).pipe(map(this.toDomain));
  }

  patch(id: string, partial: Partial<Ticket>): Observable<Ticket> {
    const dto: Partial<TicketDto> = {
      subject: partial.subject,
      status: partial.status as TicketDto['status'] | undefined,
      priority: partial.priority as TicketDto['priority'] | undefined,
      device_id: partial.deviceId,
      updates: partial.updates?.map(u => ({
        at: u.at.toISOString(),
        message: u.message,
        by: u.by,
        status: u.status
      }))
    };
    return this.api.patch(id, dto).pipe(map(this.toDomain));
  }

  // ---------- mapeos ----------
  private toDomain = (d: TicketDto): Ticket => ({
    id: d.id,
    subject: d.subject,
    status: d.status,
    priority: d.priority,
    deviceId: d.device_id ?? null,
    createdAt: new Date(d.created_at),
    updates: d.updates?.map(u => ({
      at: new Date(u.at),
      message: u.message,
      by: u.by,
      status: u.status
    })) ?? []
  });
}
