// src/app/data-access/adapters/notification.adapter.ts
import { Notification } from '../../core/models';
import { NotificationDto } from '../dto/notification.dto'; // <-- use the DTO from /dto

// dto -> domain
export function notificationFromDto(dto: NotificationDto): Notification {
  return {
    id: dto.id,
    userId: dto.user_id,                       // snake_case -> camelCase
    type: dto.type,
    title: dto.title,
    message: dto.message,
    read: dto.read,
    createdAt: new Date(dto.created_at),
  };
}

// domain -> dto (for PATCH/POST if needed later)
export function notificationToDto(m: Notification): NotificationDto {
  return {
    id: m.id,
    user_id: m.userId,
    type: m.type,
    title: m.title,
    message: m.message,
    read: m.read,
    created_at: m.createdAt.toISOString(),
  };
}
