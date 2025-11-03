// dominio
export interface OrderItem {
  deviceId: string;
  quantity: number;
  pricePerMonth: number;
}

export type OrderStatus = 'created' | 'approved' | 'in_transit' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customerId: string;
  status: OrderStatus;
  createdAt: string;        // ISO
  currency: 'PEN' | 'USD';
  items: OrderItem[];
  notes?: string;
  // opcionales si los usarás
  contact?: { name: string; email: string };
  billing?: { ruc: string; address: string };
}

// Para crear (sin id)
export type OrderCreate = Omit<Order, 'id'>;
