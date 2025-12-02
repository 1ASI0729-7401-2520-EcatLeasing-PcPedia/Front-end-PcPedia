import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../../../../../core/config/api.config';
import { ApiResponse } from '../../../../../shared/models/api-response.model';
import { MyEquipment } from '../models/equipment.model';

@Injectable({
  providedIn: 'root'
})
export class MyEquipmentService {
  private http = inject(HttpClient);
  private baseUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.myEquipment}`;

  getMyEquipment(): Observable<MyEquipment[]> {
    return this.http.get<ApiResponse<MyEquipment[]>>(this.baseUrl)
      .pipe(map(response => response.data));
  }

  getEquipment(id: number): Observable<MyEquipment> {
    return this.http.get<ApiResponse<MyEquipment>>(`${this.baseUrl}/${id}`)
      .pipe(map(response => response.data));
  }
}
