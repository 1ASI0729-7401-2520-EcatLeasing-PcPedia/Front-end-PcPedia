// src/app/features/notifications/notifications.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsRepository } from '../../data-access/repositories';
import { AuthService } from '../../core/services/auth.service';

type NotificationVM = {
  id: string;
  type: 'system'|'maintenance'|'order'|'payment';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

@Component({
  standalone: true,
  selector: 'pc-notifications',
  imports: [CommonModule],
  template: `
    <h2>Notificaciones</h2>
    <div class="list">
      <div class="card" *ngFor="let n of items()">
        <div class="head"><strong>{{ n.title }}</strong></div>
        <div class="muted">{{ n.body }}</div>
        <div class="muted">{{ n.createdAt | date:'short' }}</div>
        <button *ngIf="!n.read" (click)="markAsRead(n.id)">Marcar como leída</button>
      </div>
    </div>
  `,
})
export class NotificationsPage {
  private repo = inject(NotificationsRepository);
  private auth = inject(AuthService);

  items = signal<NotificationVM[]>([]);

  ngOnInit() {
    const cid = this.auth.currentUser()?.customerId ?? 'cus_demo';
    this.repo.listForUser(cid).subscribe(rows => this.items.set(rows as NotificationVM[]));
  }

  markAsRead(id: string) {
    this.repo.markRead(id).subscribe(() => {
      this.items.update(arr => arr.map(n => n.id === id ? { ...n, read: true } : n));
      // opcional: podrías re-calcular el contador global aquí si lo expones en un store
    });
  }
}
