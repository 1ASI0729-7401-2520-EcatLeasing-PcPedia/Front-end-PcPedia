import { BaseEntity, TicketStatus, TicketPriority } from '../../../../../shared/models/base.model';

export interface TicketComment {
  id: number;
  userId: number;
  userName?: string;
  userRole?: string;
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
  resolvedAt?: string;
  comments: TicketComment[];
}

export interface CreateTicketRequest {
  equipmentId?: number;
  title: string;
  description: string;
  priority: TicketPriority;
}

export interface AddCommentRequest {
  content: string;
}
