import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TicketRepository } from '../../data-access/repositories/ticket.repository';
import { PageHeaderComponent } from '../../shared/ui/page-header.component/page-header.component';

@Component({
  standalone: true,
  selector: 'pc-ticket-form',
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  template: `
    <app-page-header title="Nuevo ticket" [showBack]="true" />

    <form (ngSubmit)="submit()" #f="ngForm" class="form">
      <label>Título/Asunto</label>
      <input name="subject" [(ngModel)]="model.subject" required>

      <label>Prioridad</label>
      <select name="priority" [(ngModel)]="model.priority" required>
        <option value="low">Baja</option>
        <option value="medium">Media</option>
        <option value="high">Alta</option>
      </select>

      <label>Equipo (opcional)</label>
      <input name="deviceId" [(ngModel)]="model.deviceId" placeholder="dev_001">

      <button [disabled]="f.invalid" type="submit">Crear ticket</button>
    </form>
  `,
  styles: [`
    .form { display:grid; gap:8px; max-width:520px; }
    input, select, button { padding:8px; }
    button { background:#1976d2; color:#fff; border:none; border-radius:6px; }
  `]
})
export class TicketFormPage {
  private repo = inject(TicketRepository);
  private router = inject(Router);

  model = {
    subject: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    deviceId: '' as string | undefined
  };

  submit() {
    const payload = {
      subject: this.model.subject.trim(),
      status: 'open' as const,
      priority: this.model.priority,
      deviceId: this.model.deviceId?.trim() || undefined,
      updates: [
        { at: new Date(), message: 'Ticket creado por el cliente.', status: 'open' as const }
      ]
    };
    this.repo.create(payload).subscribe(t => {
      this.router.navigate(['/tickets', t.id]);
    });
  }
}
