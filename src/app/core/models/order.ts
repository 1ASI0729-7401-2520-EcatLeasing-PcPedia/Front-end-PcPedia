export interface OrderItem {
  deviceId: string;
  quantity: number;
  pricePerMonth: number;
}

export type OrderStatus =
  | 'draft' | 'pending' | 'approved' | 'rejected' | 'fulfilled' | 'cancelled';

export interface Order {
  id: string;
  customerId: string;
  status: OrderStatus;
  items: OrderItem[];
  totalPerMonth: number;
  createdAt: Date;
  updatedAt?: Date;
}
