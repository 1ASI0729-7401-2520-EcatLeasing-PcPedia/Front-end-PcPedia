import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../../../../../core/config/api.config';
import { Page, PageParams } from '../../../../../shared/models/pagination.model';
import { ApiResponse } from '../../../../../shared/models/api-response.model';
import { ProductModel, CreateProductModelRequest, CreateEquipmentBatchRequest } from '../models/product-model.model';

@Injectable({
  providedIn: 'root'
})
export class ProductModelService {
  private http = inject(HttpClient);
  private baseUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.productModels}`;

  getProductModels(params: PageParams & { category?: string } = {}): Observable<Page<ProductModel>> {
    let httpParams = new HttpParams();

    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.category) httpParams = httpParams.set('category', params.category);

    return this.http.get<ApiResponse<Page<ProductModel>>>(this.baseUrl, { params: httpParams })
      .pipe(map(response => response.data));
  }

  getAllActiveModels(): Observable<ProductModel[]> {
    return this.http.get<ApiResponse<ProductModel[]>>(`${this.baseUrl}/all`)
      .pipe(map(response => response.data));
  }

  getProductModel(id: number): Observable<ProductModel> {
    return this.http.get<ApiResponse<ProductModel>>(`${this.baseUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  createProductModel(request: CreateProductModelRequest): Observable<number> {
    return this.http.post<ApiResponse<number>>(this.baseUrl, request)
      .pipe(map(response => response.data));
  }

  updateProductModel(id: number, request: CreateProductModelRequest): Observable<void> {
    return this.http.put<ApiResponse<void>>(`${this.baseUrl}/${id}`, request)
      .pipe(map(response => response.data));
  }

  deactivateProductModel(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  createEquipmentBatch(request: CreateEquipmentBatchRequest): Observable<number> {
    return this.http.post<ApiResponse<number>>(`${this.baseUrl}/batch-equipment`, request)
      .pipe(map(response => response.data));
  }
}
