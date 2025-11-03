import { MaintenanceDTO } from '../dto/maintenance.dto';
import { MaintenanceRequest} from '../../domain/models';

export const maintenanceFromDTO = (d: MaintenanceDTO): MaintenanceRequest => ({
  id: d.id,
  customerId: d.customer_id,
  deviceId: d.device_id,
  orderId: d.order_id ?? null,
  kind: d.kind,
  priority: d.priority,
  status: d.status,
  description: d.description,
  requestedBy: d.requested_by,
  assignedTo: d.assigned_to ?? null,
  requestedAt: d.requested_at,
  closedAt: d.closed_at ?? null,
  slaHours: d.sla_hours ?? null,
  etaAt: d.eta_at ?? null,
  updates: d.updates ?? [],
  attachments: d.attachments ?? [],
  rating: d.rating ?? null,
});

export const maintenanceToDTO = (m: MaintenanceRequest): MaintenanceDTO => ({
  id: m.id,
  customer_id: m.customerId,
  device_id: m.deviceId,
  order_id: m.orderId ?? null,
  kind: m.kind,
  priority: m.priority,
  status: m.status,
  description: m.description,
  requested_by: m.requestedBy,
  assigned_to: m.assignedTo ?? null,
  requested_at: m.requestedAt,
  closed_at: m.closedAt ?? null,
  sla_hours: m.slaHours ?? null,
  eta_at: m.etaAt ?? null,
  updates: m.updates,
  attachments: m.attachments,
  rating: m.rating ?? null,
});
