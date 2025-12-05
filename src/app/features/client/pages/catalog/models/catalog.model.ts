import { BaseEntity, EquipmentCategory } from '../../../../../shared/models/base.model';

// Catalog model does NOT include price - important distinction from Equipment
export interface CatalogEquipment extends BaseEntity {
  name: string;
  brand?: string;
  model?: string;
  category: EquipmentCategory;
  specifications?: string;
  imageUrl?: string;
  // Note: NO basePrice field - clients don't see prices in catalog
}

// Product Model for catalog - shows models with available stock
export interface CatalogProductModel extends BaseEntity {
  name: string;
  brand?: string;
  model?: string;
  category?: string;
  specifications?: string;
  imageUrl?: string;
  availableStock: number;  // Number of available equipment units
}

// Selection item for request - model with quantity
export interface CatalogSelection {
  productModel: CatalogProductModel;
  quantity: number;
}
