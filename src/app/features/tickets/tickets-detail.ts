import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TicketRepository } from '../../data-access/repositories/ticket.repository';
import { Ticket } from '../../domain/models/ticket';
import { PageHeaderComponent } from '../../shared/ui/page-header.component/page-header.component';
import { StatusChipComponent } from '../../shared/ui/status-chip/status-chip';
import { TimelineComponent, TimelineItem } from '../../shared/ui/timeline/timeline';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'pc-ticket-detail',
  imports: [CommonModule, PageHeaderComponent, StatusChipComponent, TimelineComponent, MatButtonModule],
  template: `
    <app-page-header title="Detalle del ticket" [showBack]="true" />

    <ng-container *ngIf="t() as t">
      <div class="head">
        <pc-status-chip [label]="t.status" [variant]="statusVariant(t.status)"></pc-status-chip>
        <pc-status-chip [label]="t.priority" [variant]="priorityVariant(t.priority)"></pc-status-chip>
        <span class="spacer"></span>

        <button mat-raised-button color="primary" (click)="markResolved()" *ngIf="t.status!=='resolved' && t.status!=='closed'">
          Marcar como resuelto
        </button>
      </div>

      <p><strong>Asunto:</strong> {{ t.subject }}</p>
      <p *ngIf="t.deviceId"><strong>Equipo:</strong> {{ t.deviceId }}</p>
      <p><small>Creado: {{ t.createdAt | date:'medium' }}</small></p>

      <pc-timeline [items]="timelineItems()"></pc-timeline>
    </ng-container>
  `,
  styles: [`
    .head { display:flex; gap:8px; align-items:center; margin-bottom:8px; }
    .spacer { flex: 1 1 auto; }
  `],
})
export class TicketDetailPage {
  private route = inject(ActivatedRoute);
  private repo = inject(TicketRepository);

  readonly t = signal<Ticket | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.repo.getById(id).subscribe(ticket => this.t.set(ticket));
  }

  timelineItems = computed<TimelineItem[]>(() => {
    const ticket = this.t();
    if (!ticket?.updates?.length) return [];
    return ticket.updates.map(u => ({
      date: u.at,
      title: u.status ? this.pretty(u.status) : 'Actualización',
      description: u.message,
      tone: u.status === 'resolved' || u.status === 'closed' ? 'ok'
        : u.status === 'in_progress' ? 'info'
          : u.status === 'pending' ? 'warning'
            : 'neutral'
    }));
  });

  private pretty(s: Ticket['status']) {
    switch (s) {
      case 'open': return 'Creado';
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En progreso';
      case 'resolved': return 'Resuelto';
      case 'closed': return 'Cerrado';
      default: return s;
    }
  }

  statusVariant(s: Ticket['status']) {
    switch (s) {
      case 'open': return 'open';
      case 'in_progress': return 'in_progress';
      case 'pending': return 'scheduled';
      case 'resolved': return 'done';
      case 'closed': return 'closed';
      default: return 'open';
    }
  }
  priorityVariant(p: Ticket['priority']) {
    switch (p) {
      case 'low': return 'low';
      case 'medium': return 'medium';
      case 'high': return 'high';
      default: return 'medium';
    }
  }

  markResolved() {
    const cur = this.t();
    if (!cur) return;
    const updates = [
      ...(cur.updates ?? []),
      { at: new Date(), message: 'Marcado como resuelto por el cliente.', status: 'resolved' as const }
    ];
    this.repo.patch(cur.id, { status: 'resolved', updates })
      .subscribe(next => this.t.set(next));
  }
}
