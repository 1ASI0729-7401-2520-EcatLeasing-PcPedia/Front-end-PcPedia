// dto (tal como lo guarda json-server)
export interface OrderItemDTO {
  device_id: string;
  quantity: number;
  price_per_month: number;
}

export interface OrderDTO {
  id: string;
  customer_id: string;
  status: 'created' | 'approved' | 'in_transit' | 'delivered' | 'cancelled';
  created_at: string;
  currency: 'PEN' | 'USD';
  items: OrderItemDTO[];
  notes?: string;
  contact?: { name: string; email: string };
  billing?: { ruc: string; address: string };
}
