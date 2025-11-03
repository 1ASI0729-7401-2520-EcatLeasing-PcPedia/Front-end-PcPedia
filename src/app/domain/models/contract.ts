export type ContractStatus = 'draft' | 'active' | 'suspended' | 'terminated' | 'expired';

export interface Contract {
  id: string;
  customerId: string;        // empresa/cliente
  startDate: Date;
  endDate: Date;
  monthlyAmount: number;
  deviceIds: string[];       // equipos incluidos en el contrato
  status: ContractStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
