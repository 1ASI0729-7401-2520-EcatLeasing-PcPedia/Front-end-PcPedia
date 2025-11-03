export type ReturnStatusDto =
  | 'requested' | 'approved' | 'rejected' | 'in_transit' | 'received' | 'closed';

export interface ReturnRequestDto {
  id: string;
  device_id: string;
  customer_id: string;
  reason: string;
  status: ReturnStatusDto;
  requested_at: string;     // ISO
  closed_at: string | null; // ISO
}
