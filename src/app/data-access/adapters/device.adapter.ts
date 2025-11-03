import { Device } from '../../domain/models';
import { DeviceDto } from '../dto/device.dto';

export const DeviceAdapter = {
  toDomain(dto: DeviceDto): Device {
    return {
      id: dto.id,
      sku: dto.sku,
      brand: dto.brand,
      model: dto.model,
      category: dto.category,
      pricePerMonth: dto.price_per_month, // ← mapeo correcto
      stock: dto.stock,
      condition: dto.condition,
      imageUrl: dto.image_url,
      specs: dto.specs,
    };
  },

  toDTO(domain: Device): DeviceDto {
    return {
      id: domain.id,
      sku: domain.sku,
      brand: domain.brand,
      model: domain.model,
      category: domain.category,
      price_per_month: domain.pricePerMonth, // ← inverso
      stock: domain.stock,
      condition: domain.condition,
      image_url: domain.imageUrl,
      specs: domain.specs,
    };
  },
};
