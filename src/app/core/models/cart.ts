// src/app/domain/models/cart.ts

/** Ítem del carrito (UI) */
export interface CartItem {
  deviceId: string;
  pricePerMonth: number;
  quantity: number;

  // opcionales útiles para mostrar
  title?: string;
  brand?: string;
  model?: string;
}

/** Estado agregado del carrito (si lo necesitas en algún punto) */
export interface Cart {
  items: CartItem[];
  subtotalPerMonth?: number;
  discountsPerMonth?: number;
  totalPerMonth?: number;
  updatedAt?: Date;
}
