import { BaseEntity, EquipmentStatus, EquipmentCategory } from '../../../../../shared/models/base.model';

export interface Equipment extends BaseEntity {
  name: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  category: EquipmentCategory;
  specifications?: string;
  status: EquipmentStatus;
  basePrice: number;
  monthlyPrice?: number;
  imageUrl?: string;
  purchaseDate?: string;
}

export interface CreateEquipmentRequest {
  productModelId: number;
  serialNumber: string;
  purchaseDate?: string;
}

export interface UpdateEquipmentRequest {
  name?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  category?: EquipmentCategory;
  specifications?: string;
  basePrice?: number;
  imageUrl?: string;
  purchaseDate?: string;
}

export interface ChangeStatusRequest {
  status: EquipmentStatus;
}
