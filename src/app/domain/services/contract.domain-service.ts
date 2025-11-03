// src/app/domain/services/contract.domain-service.ts
import { Contract, ContractStatus } from '../models/contract';

export class ContractDomainService {
  canTransition(from: ContractStatus, to: ContractStatus): boolean {
    const g: Record<ContractStatus, ContractStatus[]> = {
      draft: ['active', 'terminated'],
      active: ['suspended', 'terminated', 'expired'],
      suspended: ['active', 'terminated'],
      terminated: [],
      expired: [],
    };
    return g[from].includes(to);
  }

  setStatus(contract: Contract, to: ContractStatus): Contract {
    if (!this.canTransition(contract.status, to)) return contract;
    return { ...contract, status: to, updatedAt: new Date() };
  }

  isActiveOn(contract: Contract, date: Date = new Date()): boolean {
    return contract.status === 'active' && date >= contract.startDate && date <= contract.endDate;
  }
}
