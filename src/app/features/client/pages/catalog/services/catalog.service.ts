import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../../../../../core/config/api.config';
import { Page, PageParams } from '../../../../../shared/models/pagination.model';
import { ApiResponse } from '../../../../../shared/models/api-response.model';
import { CatalogEquipment, CatalogProductModel } from '../models/catalog.model';
import { EquipmentCategory } from '../../../../../shared/models/base.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private http = inject(HttpClient);
  private baseUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.catalog}`;

  getCatalog(params: PageParams & { category?: string } = {}): Observable<Page<CatalogEquipment>> {
    let httpParams = new HttpParams();

    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.category) httpParams = httpParams.set('category', params.category);

    return this.http.get<ApiResponse<Page<CatalogEquipment>>>(this.baseUrl, { params: httpParams })
      .pipe(map(response => response.data));
  }

  getEquipment(id: number): Observable<CatalogEquipment> {
    return this.http.get<ApiResponse<CatalogEquipment>>(`${this.baseUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  getCategories(): Observable<EquipmentCategory[]> {
    return this.http.get<ApiResponse<EquipmentCategory[]>>(`${this.baseUrl}/categories`)
      .pipe(map(response => response.data));
  }

  // Product Models endpoints
  getProductModels(params: PageParams & { category?: string } = {}): Observable<Page<CatalogProductModel>> {
    let httpParams = new HttpParams();

    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.category) httpParams = httpParams.set('category', params.category);

    return this.http.get<ApiResponse<Page<CatalogProductModel>>>(`${this.baseUrl}/models`, { params: httpParams })
      .pipe(map(response => response.data));
  }

  getProductModel(id: number): Observable<CatalogProductModel> {
    return this.http.get<ApiResponse<CatalogProductModel>>(`${this.baseUrl}/models/${id}`)
      .pipe(map(response => response.data));
  }
}
