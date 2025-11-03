export type MaintenancePriority = 'low' | 'medium' | 'high';
export type MaintenanceStatus =
  | 'open' | 'assigned' | 'in_progress' | 'done' | 'cancelled';

export interface MaintenanceRequest {
  id: string;
  deviceId: string;
  requestedBy: string;      // user id or email
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  assignedTo: string | null; // technician id
  openedAt: Date;
  closedAt: Date | null;
}
