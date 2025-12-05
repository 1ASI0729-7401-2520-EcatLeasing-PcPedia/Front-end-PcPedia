import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../../../../../core/config/api.config';
import { Page, PageParams } from '../../../../../shared/models/pagination.model';
import { ApiResponse } from '../../../../../shared/models/api-response.model';
import { Payment, RegisterPaymentRequest } from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private baseUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.payments}`;

  getPayments(params: PageParams = {}): Observable<Page<Payment>> {
    let httpParams = new HttpParams();

    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());

    return this.http.get<ApiResponse<Page<Payment>>>(this.baseUrl, { params: httpParams })
      .pipe(map(response => response.data));
  }

  getPayment(id: number): Observable<Payment> {
    return this.http.get<ApiResponse<Payment>>(`${this.baseUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  registerPayment(request: RegisterPaymentRequest): Observable<number> {
    return this.http.post<ApiResponse<number>>(this.baseUrl, request)
      .pipe(map(response => response.data));
  }
}
