export type TicketStatus = 'open' | 'pending' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';

export interface Ticket {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  deviceId?: string | null;
  createdAt: Date;
  // opcional para timeline de interacciones
  updates?: Array<{
    at: Date;
    message: string;
    by?: string;
    status?: TicketStatus;
  }>;
}
