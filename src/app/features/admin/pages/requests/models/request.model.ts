import { BaseEntity, RequestStatus } from '../../../../../shared/models/base.model';

export interface RequestItem {
  id: number;
  equipmentId: number;
  equipmentName: string;
  equipmentBrand?: string;
  equipmentModel?: string;
  quantity: number;
}

export interface Request extends BaseEntity {
  userId: number;
  userName: string;
  companyName?: string;
  status: RequestStatus;
  durationMonths: number;
  notes?: string;
  items: RequestItem[];
}

export interface RejectRequestRequest {
  reason: string;
}
