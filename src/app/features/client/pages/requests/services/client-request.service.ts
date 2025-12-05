import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../../../../../core/config/api.config';
import { Page, PageParams } from '../../../../../shared/models/pagination.model';
import { ApiResponse } from '../../../../../shared/models/api-response.model';
import { Request, CreateRequestRequest } from '../models/request.model';

@Injectable({
  providedIn: 'root'
})
export class ClientRequestService {
  private http = inject(HttpClient);
  private baseUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.requests}`;

  getMyRequests(params: PageParams = {}): Observable<Page<Request>> {
    let httpParams = new HttpParams();

    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.status) httpParams = httpParams.set('status', params.status);

    return this.http.get<ApiResponse<Page<Request>>>(this.baseUrl, { params: httpParams })
      .pipe(map(response => response.data));
  }

  getRequest(id: number): Observable<Request> {
    return this.http.get<ApiResponse<Request>>(`${this.baseUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  createRequest(request: CreateRequestRequest): Observable<Request> {
    return this.http.post<ApiResponse<Request>>(this.baseUrl, request)
      .pipe(map(response => response.data));
  }
}
