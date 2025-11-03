// src/app/data-access/repositories/device.repository.ts
import { inject, Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import type { Device } from '../../domain/models';
import type { DeviceDto } from '../dto';
import { DeviceAdapter } from '../adapters/device.adapter';
import { DevicesHttp} from '../http/devices/devices.http';

@Injectable({ providedIn: 'root' })
export class DevicesRepository {
  private http = inject(DevicesHttp);

  /** Lista de dispositivos con filtros opcionales */
  list(params?: { search?: string; category?: string }): Observable<Device[]> {
    // json-server: q = full-text search
    const query: Record<string, string> = {};
    if (params?.search) query['q'] = params.search;
    if (params?.category) query['category'] = params.category;

    return this.http.list(query).pipe(
      map((dtos: DeviceDto[]) => dtos.map(DeviceAdapter.toDomain))
    );
  }

  /** Uno por id */
  getById(id: string): Observable<Device> {
    return this.http.byId(id).pipe(map(DeviceAdapter.toDomain));
  }

  /** Varios por ids (json-server soporta ?id=a&id=b...) */
  getManyByIds(ids: string[]): Observable<Device[]> {
    if (!ids?.length) return of([]);
    return this.http.byIds(ids).pipe(
      map((dtos: DeviceDto[]) => dtos.map(DeviceAdapter.toDomain))
    );
  }
}
