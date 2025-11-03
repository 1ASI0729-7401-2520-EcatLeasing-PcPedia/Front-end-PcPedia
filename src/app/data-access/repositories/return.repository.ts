import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ReturnRequest } from '../../core/models';
import { ReturnRequestDto } from '../dto/return.dto';
import { ReturnsHttp } from '../http/returns/returns.http';

import { returnFromDto, returnToDto } from '../adapters/return.adapter';
import { mapMany, mapOne } from './base.repository';

@Injectable({ providedIn: 'root' })
export class ReturnRepository {
  constructor(private http: ReturnsHttp) {}

  listByCustomer(customerId: string): Observable<ReturnRequest[]> {
    // lee -> DTO[] → Model[]
    return this.http.listByCustomer(customerId).pipe(
      mapMany<ReturnRequestDto, ReturnRequest>(returnFromDto)
    );
  }

  get(id: string): Observable<ReturnRequest> {
    // lee -> DTO → Model
    return this.http.get(id).pipe(
      mapOne<ReturnRequestDto, ReturnRequest>(returnFromDto)
    );
  }

  create(model: ReturnRequest): Observable<ReturnRequest> {
    // escribe -> Model → DTO → (res) DTO → Model
    return this.http.create(returnToDto(model)).pipe(
      mapOne<ReturnRequestDto, ReturnRequest>(returnFromDto)
    );
  }

  update(id: string, model: ReturnRequest): Observable<ReturnRequest> {
    // escribe -> Model → DTO → (res) DTO → Model
    return this.http.update(id, returnToDto(model)).pipe(
      mapOne<ReturnRequestDto, ReturnRequest>(returnFromDto)
    );
  }
}
