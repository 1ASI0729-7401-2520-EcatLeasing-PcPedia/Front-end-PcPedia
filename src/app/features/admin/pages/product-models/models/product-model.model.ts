import { BaseEntity, EquipmentCategory } from '../../../../../shared/models/base.model';

export interface ProductModel extends BaseEntity {
  name: string;
  brand?: string;
  model?: string;
  category?: string;
  specifications?: string;
  basePrice?: number;
  imageUrl?: string;
  isActive: boolean;
  totalEquipments: number;
  availableEquipments: number;
  leasedEquipments: number;
  maintenanceEquipments: number;
}

export interface CreateProductModelRequest {
  name: string;
  brand?: string;
  model?: string;
  category?: string;
  specifications?: string;
  basePrice?: number;
  imageUrl?: string;
}

export interface CreateEquipmentBatchRequest {
  productModelId: number;
  serialNumbers: string[];
  purchaseDate?: string;
}
