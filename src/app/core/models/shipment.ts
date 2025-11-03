export interface Address {
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

export type ShipmentStatus =
  | 'label_created' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';

export interface Shipment {
  id: string;
  orderId: string;
  carrier: string;
  trackingNumber: string;
  status: ShipmentStatus;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  address: Address;
}
