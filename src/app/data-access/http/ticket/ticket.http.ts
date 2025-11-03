import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment} from '../../../../environments/environment';
import { TicketDto} from '../../dto/ticket.dto';

@Injectable({ providedIn: 'root' })
export class TicketHttp {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiBase}/tickets`;

  listByCustomer(customerId: string) {
    // si más adelante guardas customer_id en tickets, filtras aquí.
    // Por ahora, trae todos y filtra en repo si hace falta.
    return this.http.get<TicketDto[]>(
      `${this.base}?_sort=created_at&_order=desc`
    );
  }

  getById(id: string) {
    return this.http.get<TicketDto>(`${this.base}/${id}`);
  }

  create(dto: Omit<TicketDto, 'id' | 'created_at'>) {
    const payload: Omit<TicketDto, 'id'> = {
      ...dto,
      created_at: new Date().toISOString()
    };
    return this.http.post<TicketDto>(this.base, payload);
  }

  patch(id: string, partial: Partial<TicketDto>) {
    return this.http.patch<TicketDto>(`${this.base}/${id}`, partial);
  }
}
