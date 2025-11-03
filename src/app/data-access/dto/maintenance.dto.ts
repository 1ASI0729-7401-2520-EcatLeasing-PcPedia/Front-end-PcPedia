export type MaintenanceStatusDTO = 'open' | 'in_progress' | 'done' | 'closed';
export type MaintenanceKindDTO = 'incident' | 'preventive';
export type MaintenancePriorityDTO = 'low' | 'medium' | 'high' | 'urgent';

export interface MaintenanceUpdateDTO {
  at: string;
  by: string;
  status?: MaintenanceStatusDTO;
  message?: string;
}

export interface MaintenanceAttachmentDTO {
  id: string;
  url: string;
  caption?: string;
}

export interface MaintenanceRatingDTO {
  score: 1 | 2 | 3 | 4 | 5;
  comment?: string;
}

export interface MaintenanceDTO {
  id: string;
  customer_id: string;
  device_id: string;
  order_id?: string | null;

  kind: MaintenanceKindDTO;
  priority: MaintenancePriorityDTO;

  status: MaintenanceStatusDTO;
  description: string;

  requested_by: string;
  assigned_to?: string | null;

  requested_at: string;
  closed_at?: string | null;

  sla_hours?: number | null;
  eta_at?: string | null;

  updates?: MaintenanceUpdateDTO[];
  attachments?: MaintenanceAttachmentDTO[];

  rating?: MaintenanceRatingDTO | null;
}
