export interface ShipmentDTO {
  id: string;
  order_id: string;
  carrier: string;
  tracking_number: string;
  status: 'label_created'|'in_transit'|'delivered'|'returned';
  shipped_at?: string | null;
  delivered_at?: string | null;
  address: {
    line1: string; line2?: string | null; city: string; region: string;
    postal_code: string; country: string;
  };
}
