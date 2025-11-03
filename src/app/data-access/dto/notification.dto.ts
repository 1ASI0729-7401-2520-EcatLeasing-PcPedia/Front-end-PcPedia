export type NotificationTypeDto = 'info' | 'warning' | 'success' | 'error';

export interface NotificationDto {
  id: string;
  user_id: string;
  type: NotificationTypeDto;
  title: string;
  message: string;
  read: boolean;
  created_at: string; // ISO
}
