// src/app/domain/services/notification.domain-service.ts
import { Notification, NotificationType } from '../models/notification';

export class NotificationDomainService {
  create(
    params: { id: string; userId: string; type: NotificationType; title: string; message: string }
  ): Notification {
    return {
      ...params,
      read: false,
      createdAt: new Date(),
    };
  }

  markRead(n: Notification): Notification {
    return { ...n, read: true };
  }
}
