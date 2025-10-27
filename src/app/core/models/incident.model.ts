export type IncidentState = 'Abierto' | 'En Proceso' | 'Cerrado';

export interface Incident {
  "id": number,
  "userId": number,
  "serial": string,
  "model": string,
  "date": string,
  "state": IncidentState,
  "description": string
}
