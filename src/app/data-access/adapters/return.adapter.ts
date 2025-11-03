// Mapea entre DTO (API) y Modelo (Dominio)
import { ReturnRequest } from '../../core/models';
import { ReturnRequestDto } from '../dto/return.dto';

export const returnFromDto = (dto: ReturnRequestDto): ReturnRequest => ({
  id: dto.id,
  deviceId: dto.device_id,
  customerId: dto.customer_id,
  reason: dto.reason,
  status: dto.status,                         // mismo literal union
  requestedAt: new Date(dto.requested_at),   // ISO → Date
  closedAt: dto.closed_at ? new Date(dto.closed_at) : null,
});

export const returnToDto = (m: ReturnRequest): ReturnRequestDto => ({
  id: m.id,
  device_id: m.deviceId,
  customer_id: m.customerId,
  reason: m.reason,
  status: m.status,
  requested_at: m.requestedAt.toISOString(),
  closed_at: m.closedAt ? m.closedAt.toISOString() : null,
});
