import { Shipment } from '../../domain/models';
import { ShipmentDTO } from '../dto/shipment.dto';

export const ShipmentAdapter = {
  toDomain(dto: ShipmentDTO): Shipment { return { ...dto }; },
  toDTO(model: Omit<Shipment, 'id'>): Omit<ShipmentDTO, 'id'> { return { ...model }; }
};
