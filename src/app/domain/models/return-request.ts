export type ReturnStatus =
  | 'requested' | 'approved' | 'rejected' | 'in_transit' | 'received' | 'closed';

export interface ReturnRequest {
  id: string;
  deviceId: string;
  customerId: string;
  reason: string;
  status: ReturnStatus;
  requestedAt: Date;
  closedAt: Date | null;
}
