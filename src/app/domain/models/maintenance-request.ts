export type MaintenanceStatus = 'open' | 'in_progress' | 'done' | 'closed';
export type MaintenanceKind = 'incident' | 'preventive';
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface MaintenanceUpdate {
  at: string;          // ISO
  by: 'customer' | 'system' | 'tech' | string;
  status?: MaintenanceStatus;
  message?: string;
}

export interface MaintenanceAttachment {
  id: string;
  url: string;
  caption?: string;
}

export interface MaintenanceRating {
  score: 1 | 2 | 3 | 4 | 5;
  comment?: string;
}

export interface MaintenanceRequest {
  id: string;
  customerId: string;
  deviceId: string;
  orderId?: string | null;

  kind: MaintenanceKind;
  priority: MaintenancePriority;

  status: MaintenanceStatus;
  description: string;

  requestedBy: string;
  assignedTo?: string | null;

  requestedAt: string;           // ISO
  closedAt?: string | null;

  slaHours?: number | null;
  etaAt?: string | null;

  updates: MaintenanceUpdate[];
  attachments: MaintenanceAttachment[];

  rating?: MaintenanceRating | null;
}
