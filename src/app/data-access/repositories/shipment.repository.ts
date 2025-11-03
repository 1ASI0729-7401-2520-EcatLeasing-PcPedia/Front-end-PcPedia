import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Shipment } from '../../domain/models';
import { ShipmentsHttp} from '../http';
import { ShipmentAdapter } from '../adapters/shipment.adapter';

@Injectable({ providedIn: 'root' })
export class ShipmentsRepository {
  private http = inject(ShipmentsHttp);

  listByOrder(orderId: string): Observable<Shipment[]> {
    return this.http.listByOrder(orderId).pipe(
      map(dtos => dtos.map(ShipmentAdapter.toDomain))
    );
  }
}
