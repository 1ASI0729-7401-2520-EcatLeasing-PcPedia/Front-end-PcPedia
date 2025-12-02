import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../../../../../core/config/api.config';
import { Page, PageParams } from '../../../../../shared/models/pagination.model';
import { ApiResponse } from '../../../../../shared/models/api-response.model';
import { Quote, CreateQuoteRequest } from '../models/quote.model';

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  private http = inject(HttpClient);
  private baseUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.quotes}`;

  getQuotes(params: PageParams = {}): Observable<Page<Quote>> {
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

  createQuote(request: CreateQuoteRequest): Observable<number> {
    return this.http.post<ApiResponse<number>>(this.baseUrl, request)
      .pipe(map(response => response.data));
  }

  updateQuote(id: number, request: CreateQuoteRequest): Observable<void> {
    return this.http.put<ApiResponse<void>>(`${this.baseUrl}/${id}`, request)
      .pipe(map(response => response.data));
  }

  sendQuote(id: number): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/${id}/send`, null)
      .pipe(map(response => response.data));
  }

  cancelQuote(id: number): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/${id}/cancel`, null)
      .pipe(map(response => response.data));
  }
}
