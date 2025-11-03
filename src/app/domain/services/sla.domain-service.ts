// src/app/domain/services/sla.domain-service.ts
export interface SlaRule {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  hoursToResolve: number; // horas laborales
}

export class SlaDomainService {
  constructor(private readonly rules: SlaRule[]) {}

  /** fecha límite de resolución sumando horas laborales (lun-vie 9-18 por defecto) */
  resolveBy(openedAt: Date, priority: SlaRule['priority'], workday: { start: number, end: number } = { start: 9, end: 18 }): Date {
    const hours = this.rules.find(r => r.priority === priority)?.hoursToResolve ?? 24;
    let remaining = hours;
    const d = new Date(openedAt);

    while (remaining > 0) {
      // avanza al próximo día laboral si cae fin de semana
      while ([0,6].includes(d.getDay())) d.setDate(d.getDate() + 1);
      // setea inicio de jornada si estamos fuera
      const dayStart = new Date(d); dayStart.setHours(workday.start, 0, 0, 0);
      const dayEnd   = new Date(d); dayEnd.setHours(workday.end,   0, 0, 0);

      if (d < dayStart) d.setTime(dayStart.getTime());
      const slot = Math.max(0, (dayEnd.getTime() - d.getTime()) / 3600000);

      if (slot >= remaining) {
        d.setHours(d.getHours() + remaining);
        remaining = 0;
      } else {
        remaining -= slot;
        // pasa al siguiente día laboral
        d.setDate(d.getDate() + 1);
        d.setHours(workday.start, 0, 0, 0);
      }
    }
    return d;
  }
}
