// src/app/data-access/http/company/company.http.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../api.client';
import { Endpoints } from '../endpoints';
import { CompanyDto } from '../../dto/company.dto';

@Injectable({ providedIn: 'root' })
export class CompanyHttp {
  /** 'companies' (path relativo) */
  private readonly base = Endpoints.companies.list();

  constructor(private api: ApiClient) {}

  list(): Observable<CompanyDto[]> {
    return this.api.list<CompanyDto[]>(this.base, { _sort: 'name', _order: 'asc' });
  }

  get(id: string): Observable<CompanyDto> {
    return this.api.get<CompanyDto>(Endpoints.companies.byId(id));
  }

  create(dto: CompanyDto): Observable<CompanyDto> {
    return this.api.create<CompanyDto>(this.base, dto);
  }

  update(id: string, dto: CompanyDto): Observable<CompanyDto> {
    return this.api.put<CompanyDto>(Endpoints.companies.byId(id), dto);
  }

  remove(id: string): Observable<void> {
    return this.api.delete<void>(Endpoints.companies.byId(id));
  }
}
