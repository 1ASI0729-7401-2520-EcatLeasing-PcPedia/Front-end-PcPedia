import { BaseEntity, ContractStatus } from '../../../../../shared/models/base.model';

export interface ContractItem {
  id: number;
  equipmentId: number;
  equipmentName: string;
  equipmentBrand?: string;
  equipmentModel?: string;
  serialNumber?: string;
  quantity: number;
  monthlyPrice: number;
  subtotal: number;
}

export interface Contract extends BaseEntity {
  quoteId: number;
  userId: number;
  userName?: string;
  userCompany?: string;
  userEmail?: string;
  contractNumber: string;
  items: ContractItem[];
  totalMonthly: number;
  durationMonths: number;
  totalAmount: number;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  signedAt?: string;
  terminatedAt?: string;
  terminationReason?: string;
}

export interface CreateContractRequest {
  quoteId: number;
  startDate: string;
  terms?: string;
}

export interface TerminateContractRequest {
  reason: string;
}
