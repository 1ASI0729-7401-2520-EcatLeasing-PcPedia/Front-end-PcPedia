import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../../../../../core/config/api.config';
import { Page, PageParams } from '../../../../../shared/models/pagination.model';
import { ApiResponse } from '../../../../../shared/models/api-response.model';
import { Contract } from '../models/contract.model';

@Injectable({
  providedIn: 'root'
})
export class ClientContractService {
  private http = inject(HttpClient);
  private baseUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.contracts}`;

  getMyContracts(params: PageParams = {}): Observable<Page<Contract>> {
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

  downloadPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/pdf`, { responseType: 'blob' });
  }
}
