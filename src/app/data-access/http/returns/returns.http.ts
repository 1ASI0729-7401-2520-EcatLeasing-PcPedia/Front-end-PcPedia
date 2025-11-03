// src/app/data-access/http/returns/returns.http.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../api.client';
import { Endpoints } from '../endpoints';
import { ReturnRequestDto } from '../../dto/return.dto';

@Injectable({ providedIn: 'root' })
export class ReturnsHttp {
  private readonly base = Endpoints.returns.list();

  constructor(private api: ApiClient) {}

  /** Lista solicitudes de devolución por cliente (ordenadas desc por fecha). */
  listByCustomer(customerId: string | number): Observable<ReturnRequestDto[]> {
    return this.api.list<ReturnRequestDto[]>(this.base, {
      customer_id: customerId,  // cambia a customerId si tu backend usa camelCase
      _sort: 'requested_at',    // o 'requestedAt' según tu modelo/datos
      _order: 'desc',
    });
  }

  /** Detalle por id. */
  get(id: string | number): Observable<ReturnRequestDto> {
    return this.api.get<ReturnRequestDto>(Endpoints.returns.byId(id));
  }

  /** Crear solicitud de devolución. */
  create(dto: Partial<ReturnRequestDto>): Observable<ReturnRequestDto> {
    return this.api.create<ReturnRequestDto>(this.base, dto);
  }

  /** Actualizar solicitud de devolución. */
  update(id: string | number, dto: Partial<ReturnRequestDto>): Observable<ReturnRequestDto> {
    return this.api.update<ReturnRequestDto>(Endpoints.returns.byId(id), dto);
  }

  /** Eliminar solicitud de devolución. */
  remove(id: string | number): Observable<void> {
    return this.api.delete<void>(Endpoints.returns.byId(id));
  }
}
