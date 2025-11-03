export type ShipmentStatus = 'label_created' | 'in_transit' | 'delivered' | 'returned';

export interface ShipmentAddress {
  line1: string;
  line2?: string | null;
  city: string;
  region: string;
  postal_code: string;
  country: string;
}

export interface Shipment {
  id: string;
  order_id: string;
  carrier: string;
  tracking_number: string;
  status: ShipmentStatus;
  shipped_at?: string | null;
  delivered_at?: string | null;
  address: ShipmentAddress;
}
