import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../../../../../core/config/api.config';
import { Page, PageParams } from '../../../../../shared/models/pagination.model';
import { ApiResponse } from '../../../../../shared/models/api-response.model';
import { Ticket, CreateTicketRequest, AddCommentRequest, TicketComment } from '../models/ticket.model';

@Injectable({
  providedIn: 'root'
})
export class ClientTicketService {
  private http = inject(HttpClient);
  private baseUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.tickets}`;

  getMyTickets(params: PageParams = {}): Observable<Page<Ticket>> {
    let httpParams = new HttpParams();

    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.status) httpParams = httpParams.set('status', params.status);

    return this.http.get<ApiResponse<Page<Ticket>>>(this.baseUrl, { params: httpParams })
      .pipe(map(response => response.data));
  }

  getTicket(id: number): Observable<Ticket> {
    return this.http.get<ApiResponse<Ticket>>(`${this.baseUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  createTicket(ticket: CreateTicketRequest): Observable<Ticket> {
    return this.http.post<ApiResponse<Ticket>>(this.baseUrl, ticket)
      .pipe(map(response => response.data));
  }

  addComment(ticketId: number, comment: AddCommentRequest): Observable<TicketComment> {
    return this.http.post<ApiResponse<TicketComment>>(`${this.baseUrl}/${ticketId}/comments`, comment)
      .pipe(map(response => response.data));
  }
}
