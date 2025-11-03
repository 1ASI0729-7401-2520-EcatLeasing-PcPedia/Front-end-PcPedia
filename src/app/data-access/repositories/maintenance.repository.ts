import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { MaintenanceHttp } from '../http/maintenance/maintenance.http';
import { maintenanceFromDTO, maintenanceToDTO } from '../adapters/maintenance.adapter';
import { MaintenanceRequest, MaintenanceUpdate, MaintenanceRating} from '../../domain/models';

@Injectable({ providedIn: 'root' })
export class MaintenanceRepository {
  private api = inject(MaintenanceHttp);

  listByCustomer(customerId: string) {
    return this.api.listByCustomer(customerId).pipe(
      map((arr) => arr.map(maintenanceFromDTO))
    );
  }

  getById(id: string) {
    return this.api.getById(id).pipe(map(maintenanceFromDTO));
  }

  create(req: Omit<MaintenanceRequest, 'id' | 'updates' | 'attachments' | 'rating' | 'status' | 'requestedAt'>) {
    const now = new Date().toISOString();
    const dto = maintenanceToDTO({
      ...req,
      id: crypto.randomUUID(),
      status: 'open',
      requestedAt: now,
      updates: [{ at: now, by: 'customer', message: 'Ticket creado', status: 'open' }],
      attachments: [],
      rating: null,
      closedAt: null,
      orderId: req.orderId ?? null,
      assignedTo: null,
      slaHours: req.slaHours ?? null,
      etaAt: req.etaAt ?? null,
    });
    delete (dto as any).id; // json-server asigna si deseas; si no, comenta esto
    return this.api.create(dto).pipe(map(maintenanceFromDTO));
  }

  addUpdate(id: string, update: MaintenanceUpdate) {
    return this.api.getById(id).pipe(
      map((dto) => {
        const updates = [...(dto.updates ?? []), update];
        return { dto, updates };
      }),
      // luego patch
      // @ts-ignore: RxJS inline switchMap por brevedad
      switchMap(({ dto, updates }) => this.api.patch(id, { ...dto, updates }).pipe(map(maintenanceFromDTO)))
    );
  }

  closeAndRate(id: string, rating: MaintenanceRating) {
    const closed_at = new Date().toISOString();
    return this.api.patch(id, { status: 'closed', closed_at, rating }).pipe(map(maintenanceFromDTO));
  }
}
