export interface BaseEntity {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}

export enum EquipmentStatus {
  AVAILABLE = 'AVAILABLE',
  LEASED = 'LEASED',
  MAINTENANCE = 'MAINTENANCE',
  RETIRED = 'RETIRED'
}

export enum RequestStatus {
  PENDING = 'PENDING',
  QUOTED = 'QUOTED',
  REJECTED = 'REJECTED'
}

export enum QuoteStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

export enum ContractStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED',
  CANCELLED = 'CANCELLED',
  RENEWED = 'RENEWED'
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum InvoiceStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  TRANSFER = 'TRANSFER',
  CASH = 'CASH',
  CHECK = 'CHECK'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED'
}

export enum EquipmentCategory {
  LAPTOP = 'LAPTOP',
  DESKTOP = 'DESKTOP',
  SERVER = 'SERVER',
  MONITOR = 'MONITOR',
  PRINTER = 'PRINTER',
  PERIPHERAL = 'PERIPHERAL',
  NETWORK = 'NETWORK',
  OTHER = 'OTHER'
}
