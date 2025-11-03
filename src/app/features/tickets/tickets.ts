import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TicketRepository } from '../../data-access/repositories/ticket.repository';
import { Ticket } from '../../domain/models/ticket';
import { PageHeaderComponent } from '../../shared/ui/page-header.component/page-header.component';
import { StatusChipComponent } from '../../shared/ui/status-chip/status-chip';

@Component({
  standalone: true,
  selector: 'pc-tickets',
  imports: [CommonModule, RouterLink, PageHeaderComponent, StatusChipComponent],
  template: `
    <app-page-header title="Tickets de soporte"
                     [breadcrumbs]="[{label:'Inicio', url:'/dashboard'},{label:'Tickets'}]"
                     [showBack]="false" />

    <div class="actions">
      <a routerLink="new" class="btn">+ Nuevo ticket</a>
    </div>

    <div class="list" *ngIf="tickets() as rows; else loading">
      <article *ngFor="let t of rows; trackBy: trackById" class="item">
        <div class="left">
          <h3><a [routerLink]="['/tickets', t.id]">{{ t.subject }}</a></h3>
          <small>Creado: {{ t.createdAt | date:'medium' }}</small>
          <div class="chips">
            <pc-status-chip [label]="t.status" [variant]="statusVariant(t.status)"></pc-status-chip>
            <pc-status-chip [label]="t.priority" [variant]="priorityVariant(t.priority)"></pc-status-chip>
            <pc-status-chip *ngIf="t.deviceId" [label]="t.deviceId" [variant]="'scheduled'"></pc-status-chip>
          </div>
        </div>
        <div class="right">
          <a [routerLink]="['/tickets', t.id]" class="lnk">Ver detalle →</a>
        </div>
      </article>
      <p *ngIf="rows.length === 0" class="empty">No tienes tickets aún.</p>
    </div>

    <ng-template #loading>
      <p>Cargando tickets...</p>
    </ng-template>
  `,
  styles: [`
    .actions { margin: 8px 0; }
    .btn { padding:8px 12px; background:#1976d2; color:#fff; border-radius:6px; text-decoration:none;}
    .list { display:flex; flex-direction:column; gap:12px; }
    .item { display:flex; justify-content:space-between; padding:12px; border:1px solid #eee; border-radius:8px; }
    .chips { display:flex; gap:6px; margin-top:6px; flex-wrap:wrap; }
    .empty { opacity:.7; }
  `]
})
export class TicketsPage {
  private repo = inject(TicketRepository);

  readonly tickets = signal<Ticket[] | null>(null);

  ngOnInit() {
    // TODO: reemplazar 'cus_demo' por el customer actual cuando tengas auth real
    this.repo.listByCustomer('cus_demo').subscribe(rows => this.tickets.set(rows));
  }

  trackById = (_: number, it: Ticket) => it.id;

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
}
