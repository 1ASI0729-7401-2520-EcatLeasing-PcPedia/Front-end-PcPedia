// src/app/features/maintenance/maintenance-detail.component.ts
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaintenanceRepository } from '../../data-access/repositories';
import { MaintenanceRequest, MaintenanceUpdate } from '../../domain/models';
import { TimelineComponent, TimelineItem } from '../../shared/ui/timeline/timeline';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../shared/ui/page-header.component/page-header.component';
import { StatusChipComponent } from '../../shared/ui/status-chip/status-chip';

// Aceptamos cualquier string y normalizamos (evita choques domain/core)
type PriorityInput = 'low' | 'medium' | 'high' | 'urgent' | string;

type StatusVariant =
  | 'open' | 'in_progress' | 'scheduled' | 'done' | 'closed'
  | 'low' | 'medium' | 'high';

@Component({
  standalone: true,
  selector: 'pc-maintenance-detail',
  imports: [
    CommonModule,
    PageHeaderComponent,
    StatusChipComponent,
    MatButtonModule,
    MatIconModule,
    TimelineComponent,
  ],
  template: `
    <app-page-header title="Detalle de mantenimiento" />

    <ng-container *ngIf="m() as m">
      <div class="head">
        <pc-status-chip
          [label]="m.status"
          [variant]="statusVariant(m.status)">
        </pc-status-chip>

        <!-- 👇 sin cast en el template -->
        <pc-status-chip
          [label]="m.priority"
          [variant]="priorityVariant(m.priority)">
        </pc-status-chip>

        <pc-status-chip
          [label]="m.kind"
          [variant]="'scheduled'">
        </pc-status-chip>

        <span class="spacer"></span>

        <button mat-raised-button color="primary"
                (click)="close()" *ngIf="m.status !== 'closed'">
          Cerrar y calificar
        </button>
      </div>

      <p><strong>Equipo:</strong> {{ m.deviceId }}</p>
      <p><strong>Descripción:</strong> {{ m.description }}</p>

      <pc-timeline [items]="timelineItems()"></pc-timeline>
    </ng-container>
  `,
  styles: [`
    .head { display:flex; gap:8px; align-items:center; margin-bottom:8px; }
    .spacer { flex: 1 1 auto; }
  `],
})
export class MaintenanceDetailPage {
  private route = inject(ActivatedRoute);
  private repo = inject(MaintenanceRepository);

  readonly m = signal<MaintenanceRequest | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.repo.getById(id).subscribe(data => this.m.set(data));
  }

  readonly timelineItems = computed<TimelineItem[]>(() => {
    const req = this.m();
    if (!req?.updates) return [];
    return req.updates.map((u: MaintenanceUpdate): TimelineItem => ({
      date: (u as any).at ?? (u as any).date ?? new Date(),
      title: this.prettyTitle(u),
      description: (u as any).message ?? (u as any).description ?? '',
      tone: this.toneFrom(u),
    }));
  });

  statusVariant(status: string): StatusVariant {
    switch (status) {
      case 'closed': return 'closed';
      case 'in_progress': return 'in_progress';
      case 'done': return 'done';
      case 'open': return 'open';
      case 'scheduled': return 'scheduled';
      default: return 'open';
    }
  }

  priorityVariant(p: PriorityInput): StatusVariant {
    const v = String(p).toLowerCase();
    if (v === 'urgent' || v === 'alta-urgencia') return 'high';
    if (v === 'high' || v === 'alta') return 'high';
    if (v === 'medium' || v === 'media') return 'medium';
    if (v === 'low' || v === 'baja') return 'low';
    return 'medium';
  }

  private prettyTitle(u: MaintenanceUpdate): string {
    const action = (u as any).action ?? (u as any).status ?? '';
    switch (action) {
      case 'assigned': return `Asignado a ${(u as any).assignee ?? 'técnico'}`;
      case 'in_progress': return 'En progreso';
      case 'closed': return 'Cerrado';
      case 'done': return 'Finalizado';
      case 'open': return 'Creado';
      default: return action ? action : 'Actualización';
    }
  }

  private toneFrom(u: MaintenanceUpdate): 'ok'|'warning'|'error'|'info'|'neutral' {
    const action = (u as any).action ?? (u as any).status ?? '';
    switch (action) {
      case 'closed':
      case 'done': return 'ok';
      case 'in_progress': return 'info';
      case 'open':
      case 'assigned': return 'neutral';
      case 'rejected':
      case 'failed': return 'error';
      default: return 'neutral';
    }
  }

  close() {
    const current = this.m();
    if (!current) return;
    const rating = { score: 5 as const, comment: 'Gracias por el soporte' };
    this.repo.closeAndRate(current.id, rating).subscribe(res => this.m.set(res));
  }
}
