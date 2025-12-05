import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../../../../../core/config/api.config';
import { Page, PageParams } from '../../../../../shared/models/pagination.model';
import { ApiResponse } from '../../../../../shared/models/api-response.model';
import { Ticket, AddCommentRequest } from '../models/ticket.model';
import { TicketStatus } from '../../../../../shared/models/base.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private http = inject(HttpClient);
  private baseUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.tickets}`;

  getTickets(params: PageParams = {}): Observable<Page<Ticket>> {
    let httpParams = new HttpParams();

    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params['priority']) httpParams = httpParams.set('priority', params['priority'] as string);

    return this.http.get<ApiResponse<Page<Ticket>>>(this.baseUrl, { params: httpParams })
      .pipe(map(response => response.data));
  }

  getTicket(id: number): Observable<Ticket> {
    return this.http.get<ApiResponse<Ticket>>(`${this.baseUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  addComment(id: number, request: AddCommentRequest): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/${id}/comments`, request)
      .pipe(map(response => response.data));
  }

  updateStatus(id: number, status: TicketStatus): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/${id}/status`, { status })
      .pipe(map(response => response.data));
  }

  resolveTicket(id: number): Observable<void> {
    return this.updateStatus(id, TicketStatus.RESOLVED);
  }

  closeTicket(id: number): Observable<void> {
    return this.updateStatus(id, TicketStatus.CLOSED);
  }

  reopenTicket(id: number): Observable<void> {
    return this.updateStatus(id, TicketStatus.OPEN);
  }
}
