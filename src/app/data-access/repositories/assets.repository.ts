import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export type Asset = {
  id: string;
  customer_id: string;
  contract_id: string;
  device_id: string;
  brand: string;
  model: string;
  part_number: string;
  serial_number: string;
  assigned_to_user_id: string;
  assigned_to_name: string;
  assigned_at: string;
  status: 'in_use' | 'returned' | 'lost';
};

@Injectable({ providedIn: 'root' })
export class AssetsRepository {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/assets`;

  listByCustomer(customerId: string): Observable<Asset[]> {
    const params = new HttpParams()
      .set('customer_id', customerId)
      .set('_sort', 'assigned_at')
      .set('_order', 'desc');
    return this.http.get<Asset[]>(this.base, { params });
  }
}
