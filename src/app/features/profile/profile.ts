import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomersRepository } from '../../data-access/repositories/customer.repository';
import { AuthRepository } from '../../data-access/repositories/auth.repository';
import {PageHeaderComponent} from '../../shared/ui/page-header.component/page-header.component';

@Component({
  standalone: true,
  selector: 'pc-profile',
  imports: [CommonModule, PageHeaderComponent],
  template: `
    <app-page-header title="Perfil"></app-page-header>
    <ng-container *ngIf="user() as c">
      <div class="card" style="display:flex;align-items:center;gap:16px;">
        <img *ngIf="c.avatar_url" [src]="c.avatar_url" style="width:90px;height:90px;border-radius:50%;object-fit:cover" />
        <div>
          <h3>{{ c.display_name }}</h3>
          <div class="muted">{{ c.email }}</div>
          <div *ngIf="c.phone" class="muted">Teléfono: {{ c.phone }}</div>
          <div *ngIf="c.address?.line1" class="muted">
            Dirección: {{ c.address.line1 }}, {{ c.address.city }}
          </div>
        </div>
      </div>
    </ng-container>
  `
})
export class ProfilePage {
  private customers = inject(CustomersRepository);
  private auth = inject(AuthRepository);

  user = signal<any | null>(null);

  ngOnInit() {
    const id = this.auth.customerId();
    if (!id) return;
    this.customers.getById(id).subscribe(u => this.user.set(u));
  }
}
