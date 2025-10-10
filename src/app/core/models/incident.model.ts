export type IncidentState = 'Abierto' | 'En Proceso' | 'Cerrado';

export interface Incident {
  id: number;
  empresaId: number;
  contratoId: number;
  code: string;        // "INC-101"
  serie: string;
  modelo: string;
  fecha: string;       // YYYY-MM-DD
  estado: IncidentState;
  descripcion: string;
  tecnico: string;
}
