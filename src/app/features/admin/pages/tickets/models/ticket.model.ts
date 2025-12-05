import { BaseEntity, TicketStatus, TicketPriority } from '../../../../../shared/models/base.model';

export interface TicketComment {
  id: number;
  userId: number;
  userName: string;
  userRole: string;
  content: string;
  isInternal?: boolean;
  createdAt: string;
}

export interface Ticket extends BaseEntity {
  userId: number;
  userName?: string;
  companyName?: string;
  equipmentId?: number;
  equipmentName?: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  comments?: TicketComment[];
  resolvedAt?: string;
}

export interface AddCommentRequest {
  content: string;
  isInternal?: boolean;
}

export interface UpdateStatusRequest {
  status: TicketStatus;
}
