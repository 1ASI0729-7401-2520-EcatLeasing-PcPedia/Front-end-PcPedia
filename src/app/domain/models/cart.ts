export interface CartItem {
  deviceId: string;
  sku?: string;                  // 👈 añade sku (opcional si quieres)
  name: string;                  // ej. "HP EliteBook 840 G10"
  unitPrice: number;             // precio por mes
  quantity: number;
  imageUrl?: string;
}


export interface Cart {
  items: CartItem[];
  subtotalPerMonth?: number;
  discountsPerMonth?: number;
  totalPerMonth?: number;
  updatedAt?: Date;
}
