// src/app/core/models/device.model.ts (or wherever you placed it)
export interface Device {
  id: string;
  brand: string;
  model: string;
  serial: string;
  category: string;
  status: 'available' | 'rented' | 'maintenance';
  clientId: string | null;         // ⬅︎ expects null when absent (not undefined)
  pricePerMonth: number;
  createdAt?: Date;
  updatedAt?: Date;
}
