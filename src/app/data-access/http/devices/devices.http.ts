// src/app/data-access/http/devices.http.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import type { DeviceDto } from '../../dto';

@Injectable({ providedIn: 'root' })
export class DevicesHttp {
  private http = inject(HttpClient);
  /** http://localhost:3000/devices en dev */
  private readonly base = `${environment.apiBase}/devices`;

  list(params?: Record<string, string | number | boolean>) {
    return this.http.get<DeviceDto[]>(this.base, { params: params as any });
  }

  byId(id: string) {
    return this.http.get<DeviceDto>(`${this.base}/${encodeURIComponent(id)}`);
  }

  byIds(ids: string[]) {
    // json-server soporta ?id=a&id=b...
    const qs = ids.map(id => `id=${encodeURIComponent(id)}`).join('&');
    return this.http.get<DeviceDto[]>(`${this.base}?${qs}`);
  }
}
