import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Company } from '../../core/models';
import { CompanyDto } from '../dto/company.dto';
import { CompanyHttp } from '../http/company/company.http';
import { companyFromDto, companyToDto } from '../adapters/company.adapter';
import { mapMany, mapOne } from './base.repository';

@Injectable({ providedIn: 'root' })
export class CompanyRepository {
  constructor(private http: CompanyHttp) {}

  list(): Observable<Company[]> {
    return mapMany<CompanyDto, Company>(companyFromDto)(this.http.list());
  }

  get(id: string): Observable<Company> {
    return mapOne<CompanyDto, Company>(companyFromDto)(this.http.get(id));
  }

  create(model: Company): Observable<Company> {
    return mapOne<CompanyDto, Company>(companyFromDto)(
      this.http.create(companyToDto(model))
    );
  }

  update(id: string, model: Company): Observable<Company> {
    return mapOne<CompanyDto, Company>(companyFromDto)(
      this.http.update(id, companyToDto(model))
    );
  }

  remove(id: string): Observable<void> {
    return this.http.remove(id);
  }
}
