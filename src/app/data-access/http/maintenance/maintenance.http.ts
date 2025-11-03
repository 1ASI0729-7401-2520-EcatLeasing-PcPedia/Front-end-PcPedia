// src/app/data-access/http/maintenance.http.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment} from '../../../../environments/environment';
import { MaintenanceDTO } from '../../dto/maintenance.dto';

@Injectable({ providedIn: 'root' })
export class MaintenanceHttp {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBase}/maintenance`;

  listByCustomer(customerId: string) {
    const params = new HttpParams()
      .set('customer_id', customerId)
      .set('_sort', 'requested_at')
      .set('_order', 'desc');

    return this.http.get<MaintenanceDTO[]>(this.base, { params });
  }

  getById(id: string) {
    return this.http.get<MaintenanceDTO>(`${this.base}/${encodeURIComponent(id)}`);
  }

  create(dto: Omit<MaintenanceDTO, 'id'>) {
    return this.http.post<MaintenanceDTO>(this.base, dto);
  }

  patch(id: string, partial: Partial<MaintenanceDTO>) {
    return this.http.patch<MaintenanceDTO>(`${this.base}/${encodeURIComponent(id)}`, partial);
  }
}
