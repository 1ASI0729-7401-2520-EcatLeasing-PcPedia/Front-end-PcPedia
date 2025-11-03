export interface TicketDto {
  id: string;
  subject: string;
  status: 'open' | 'pending' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  device_id?: string | null;
  created_at: string;
  // si luego agregas historial:
  updates?: Array<{
    at: string;
    message: string;
    by?: string;
    status?: 'open' | 'pending' | 'in_progress' | 'resolved' | 'closed';
  }>;
}
