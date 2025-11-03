import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment} from '../../../../environments/environment';
import { ShipmentDTO} from '../../dto';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ShipmentsHttp {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/shipments`;

  listByOrder(orderId: string): Observable<ShipmentDTO[]> {
    return this.http.get<ShipmentDTO[]>(`${this.base}?order_id=${encodeURIComponent(orderId)}`);
  }
}
