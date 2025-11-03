// src/app/domain/services/availability.domain-service.ts
import { Device } from '../models/device';

/**
 * Reglas de disponibilidad basadas en stock.
 * No persiste nada: devuelve nuevas copias inmutables del Device.
 */
export class AvailabilityDomainService {

  /** Un dispositivo está disponible si hay unidades en stock */
  isAvailable(device: Device): boolean {
    return (device.stock ?? 0) > 0;
  }

  /** “Alquilar” 1 unidad: decrementa stock si hay disponibilidad */
  allocate(device: Device): Device {
    if (!this.isAvailable(device)) return device;
    return { ...device, stock: device.stock - 1 };
  }

  /** “Liberar” 1 unidad: incrementa stock (p.ej., devolución/cancelación) */
  release(device: Device): Device {
    return { ...device, stock: (device.stock ?? 0) + 1 };
  }

  /**
   * (Opcional, para compatibilidad si lo llamabas en algún sitio)
   * Qué estado lógico quedaría después de rentar 1 unidad.
   */
  nextStatusOnRent(device: Device): 'available' | 'out_of_stock' {
    const remaining = (device.stock ?? 0) - 1;
    return remaining > 0 ? 'available' : 'out_of_stock';
  }
}
