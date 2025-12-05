import { BaseEntity, ContractStatus } from '../../../../../shared/models/base.model';

export interface ContractItem {
  id: number;
  equipmentId: number;
  equipment?: {
    id: number;
    name: string;
    brand?: string;
    model?: string;
    serialNumber?: string;
    category: string;
  };
  monthlyPrice: number;
}

export interface Contract extends BaseEntity {
  quoteId: number;
  userId: number;
  contractNumber: string;
  startDate: string;
  endDate: string;
  monthlyAmount: number;
  status: ContractStatus;
  terms?: string;
  items: ContractItem[];
}
