import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../../../../../core/config/api.config';
import { Page, PageParams } from '../../../../../shared/models/pagination.model';
import { ApiResponse } from '../../../../../shared/models/api-response.model';
import { Contract, CreateContractRequest } from '../models/contract.model';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private http = inject(HttpClient);
  private baseUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.contracts}`;

  getContracts(params: PageParams = {}): Observable<Page<Contract>> {
    let httpParams = new HttpParams();

    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.status) httpParams = httpParams.set('status', params.status);

    return this.http.get<ApiResponse<Page<Contract>>>(this.baseUrl, { params: httpParams })
      .pipe(map(response => response.data));
  }

  getContract(id: number): Observable<Contract> {
    return this.http.get<ApiResponse<Contract>>(`${this.baseUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  createContract(request: CreateContractRequest): Observable<number> {
    return this.http.post<ApiResponse<number>>(this.baseUrl, request)
      .pipe(map(response => response.data));
  }

  cancelContract(id: number): Observable<Contract> {
    return this.http.patch<ApiResponse<Contract>>(`${this.baseUrl}/${id}/cancel`, null)
      .pipe(map(response => response.data));
  }

  renewContract(id: number, durationMonths: number): Observable<Contract> {
    return this.http.post<ApiResponse<Contract>>(`${this.baseUrl}/${id}/renew`, { durationMonths })
      .pipe(map(response => response.data));
  }
}
