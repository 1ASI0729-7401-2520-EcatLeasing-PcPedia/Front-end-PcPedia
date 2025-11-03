export interface DeviceDto {
  id: string;
  sku: string;
  brand: string;
  model: string;
  category: string;
  price_per_month: number;         // 👈 así viene del db.json
  stock: number;
  condition: 'new' | 'refurbished';
  image_url: string;
  specs?: Record<string, string>;
}
