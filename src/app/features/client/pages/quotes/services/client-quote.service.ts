import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../../../../../core/config/api.config';
import { Page, PageParams } from '../../../../../shared/models/pagination.model';
import { ApiResponse } from '../../../../../shared/models/api-response.model';
import { Quote, RejectQuoteRequest } from '../models/quote.model';

@Injectable({
  providedIn: 'root'
})
export class ClientQuoteService {
  private http = inject(HttpClient);
  private baseUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.quotes}`;

  getMyQuotes(params: PageParams = {}): Observable<Page<Quote>> {
    let httpParams = new HttpParams();

    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.status) httpParams = httpParams.set('status', params.status);

    return this.http.get<ApiResponse<Page<Quote>>>(this.baseUrl, { params: httpParams })
      .pipe(map(response => response.data));
  }

  getQuote(id: number): Observable<Quote> {
    return this.http.get<ApiResponse<Quote>>(`${this.baseUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  acceptQuote(id: number): Observable<Quote> {
    return this.http.patch<ApiResponse<Quote>>(`${this.baseUrl}/${id}/accept`, null)
      .pipe(map(response => response.data));
  }

  rejectQuote(id: number, request: RejectQuoteRequest): Observable<Quote> {
    return this.http.patch<ApiResponse<Quote>>(`${this.baseUrl}/${id}/reject`, request)
      .pipe(map(response => response.data));
  }
}
