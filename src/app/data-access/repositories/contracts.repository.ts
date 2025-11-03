import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export type Contract = {
  id: string;
  customer_id: string;
  name: string;
  start_at: string;
  end_at: string;
  status: 'active' | 'expired' | 'draft';
};

@Injectable({ providedIn: 'root' })
export class ContractsRepository {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/contracts`;

  listByCustomer(customerId: string): Observable<Contract[]> {
    const params = new HttpParams().set('customer_id', customerId);
    return this.http.get<Contract[]>(this.base, { params });
  }
}
