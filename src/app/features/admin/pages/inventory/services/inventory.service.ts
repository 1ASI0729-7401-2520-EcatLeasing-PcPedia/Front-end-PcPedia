import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../../../../../core/config/api.config';
import { Page, PageParams } from '../../../../../shared/models/pagination.model';
import { ApiResponse } from '../../../../../shared/models/api-response.model';
import { Equipment, CreateEquipmentRequest, UpdateEquipmentRequest, ChangeStatusRequest } from '../models/equipment.model';
import { EquipmentCategory } from '../../../../../shared/models/base.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private http = inject(HttpClient);
  private baseUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.inventory}`;

  getEquipments(params: PageParams & { category?: string } = {}): Observable<Page<Equipment>> {
    let httpParams = new HttpParams();

    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.category) httpParams = httpParams.set('category', params.category);

    return this.http.get<ApiResponse<Page<Equipment>>>(this.baseUrl, { params: httpParams })
      .pipe(map(response => response.data));
  }

  getEquipment(id: number): Observable<Equipment> {
    return this.http.get<ApiResponse<Equipment>>(`${this.baseUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  createEquipment(equipment: CreateEquipmentRequest): Observable<Equipment> {
    return this.http.post<ApiResponse<Equipment>>(this.baseUrl, equipment)
      .pipe(map(response => response.data));
  }

  updateEquipment(id: number, equipment: UpdateEquipmentRequest): Observable<Equipment> {
    return this.http.put<ApiResponse<Equipment>>(`${this.baseUrl}/${id}`, equipment)
      .pipe(map(response => response.data));
  }

  deleteEquipment(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  changeStatus(id: number, request: ChangeStatusRequest): Observable<Equipment> {
    return this.http.patch<ApiResponse<Equipment>>(`${this.baseUrl}/${id}/status`, request)
      .pipe(map(response => response.data));
  }

  getCategories(): Observable<EquipmentCategory[]> {
    return this.http.get<ApiResponse<EquipmentCategory[]>>(`${this.baseUrl}/categories`)
      .pipe(map(response => response.data));
  }
}
