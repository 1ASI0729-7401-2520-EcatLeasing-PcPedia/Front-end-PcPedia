import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import type { Customer } from '../../domain/models/customer';

@Injectable({ providedIn: 'root' })
export class CustomersRepository {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiBase}/customers`;

  getById(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.base}/${encodeURIComponent(id)}`);
  }
}
