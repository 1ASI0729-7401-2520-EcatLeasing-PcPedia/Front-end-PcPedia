import { EquipmentCategory } from '../../../../../shared/models/base.model';

export interface MyEquipment {
  equipmentId: number;
  name: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  category: EquipmentCategory;
  specifications?: string;
  imageUrl?: string;
  contractNumber?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  contractStatus?: string;
}
