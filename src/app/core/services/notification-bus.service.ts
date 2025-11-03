// src/app/core/services/notification-bus.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationBusService {
  readonly refresh$ = new Subject<void>();
}
