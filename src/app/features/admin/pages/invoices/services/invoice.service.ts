import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../../../../../core/config/api.config';
import { Page, PageParams } from '../../../../../shared/models/pagination.model';
import { ApiResponse } from '../../../../../shared/models/api-response.model';
import { Invoice, CreateInvoiceRequest, MarkPaidRequest } from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private http = inject(HttpClient);
  private baseUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.invoices}`;

  getInvoices(params: PageParams = {}): Observable<Page<Invoice>> {
    let httpParams = new HttpParams();

    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.status) httpParams = httpParams.set('status', params.status);

    return this.http.get<ApiResponse<Page<Invoice>>>(this.baseUrl, { params: httpParams })
      .pipe(map(response => response.data));
  }

  getInvoice(id: number): Observable<Invoice> {
    return this.http.get<ApiResponse<Invoice>>(`${this.baseUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  createInvoice(request: CreateInvoiceRequest): Observable<number> {
    return this.http.post<ApiResponse<number>>(this.baseUrl, request)
      .pipe(map(response => response.data));
  }

  markAsPaid(id: number, request: MarkPaidRequest = {}): Observable<Invoice> {
    return this.http.put<ApiResponse<Invoice>>(`${this.baseUrl}/${id}/pay`, request)
      .pipe(map(response => response.data));
  }

  markAsOverdue(id: number): Observable<Invoice> {
    return this.http.put<ApiResponse<Invoice>>(`${this.baseUrl}/${id}/overdue`, {})
      .pipe(map(response => response.data));
  }

  cancelInvoice(id: number): Observable<void> {
    return this.http.put<ApiResponse<void>>(`${this.baseUrl}/${id}/cancel`, {})
      .pipe(map(response => response.data));
  }

  getPendingInvoices(): Observable<Invoice[]> {
    return this.http.get<ApiResponse<Invoice[]>>(`${this.baseUrl}/pending`)
      .pipe(map(response => response.data));
  }
}
