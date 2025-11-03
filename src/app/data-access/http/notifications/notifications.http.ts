// src/app/data-access/http/notifications/notifications.http.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, Query } from '../api.client';
import { Endpoints } from '../endpoints';
import { NotificationDto } from '../../dto/notification.dto';

@Injectable({ providedIn: 'root' })
export class NotificationsHttp {
  constructor(private api: ApiClient) {}

  /** Lista notificaciones del usuario (ajusta claves a tu db.json: user_id/created_at) */
  listForUser(userId: string | number, extra?: Query): Observable<NotificationDto[]> {
    return this.api.list<NotificationDto[]>(
      Endpoints.notifications.list(),
      { _sort: 'createdAt', _order: 'desc' }
    );
  }

  /** Marca como leída */
  markRead(id: string | number): Observable<NotificationDto> {
    return this.api.patch<NotificationDto>(
      Endpoints.notifications.byId(id),
      { read: true }
    );
  }

  /** (Opcional) crear notificación */
  create(dto: NotificationDto): Observable<NotificationDto> {
    return this.api.create<NotificationDto>(Endpoints.notifications.list(), dto);
  }

  /** (Opcional) eliminar */
  remove(id: string | number): Observable<void> {
    return this.api.delete<void>(Endpoints.notifications.byId(id));
  }
}
