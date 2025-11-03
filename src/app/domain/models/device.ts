export interface Device {
  id: string;
  sku: string;                   // 👈 nuevo
  brand: string;
  model: string;
  category: string;
  pricePerMonth: number;         // 👈 camelCase en domain
  stock: number;
  condition: 'new' | 'refurbished';
  imageUrl: string;
  specs?: Record<string, string>;
}
