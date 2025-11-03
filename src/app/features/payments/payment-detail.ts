// src/app/features/payments/payment-detail.ts
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PaymentsRepository } from '../../data-access/repositories/payment.repository';
import type { Payment } from '../../domain/models/payment';
import { PageHeaderComponent } from '../../shared/ui/page-header.component/page-header.component';

@Component({
  standalone: true,
  selector: 'pc-payment-detail',
  imports: [CommonModule, RouterModule, PageHeaderComponent],
  template: `
    <app-page-header title="Detalle de pago"
                     [breadcrumbs]="[{label:'Pagos', url:'/payments'}, {label: (p()?.id || '...')}]">
    </app-page-header>

    <ng-container *ngIf="p() as pay">
      <div class="card">
        <div><strong>Método:</strong> {{ pay.method }}</div>
        <div><strong>Monto:</strong> {{ pay.amount | number:'1.2-2' }} {{ pay.currency }}</div>
        <div><strong>Estado:</strong> {{ pay.status }}</div>
        <div *ngIf="pay.invoiceNumber"><strong>Comprobante:</strong> {{ pay.invoiceNumber }}</div>
        <div *ngIf="pay.paidAt"><strong>Pagado:</strong> {{ pay.paidAt | date:'short' }}</div>
        <div *ngIf="pay.method === 'card'">
          <strong>Tarjeta:</strong> {{ pay.cardBrand ?? '' }} ·•••• {{ pay.cardLast4 ?? '' }}
        </div>
      </div>
    </ng-container>
  `,
})
export class PaymentDetailPage {
  private route = inject(ActivatedRoute);
  private repo = inject(PaymentsRepository);

  p = signal<Payment | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.repo.listByCustomer('cus_demo').subscribe(all => {
      this.p.set(all.find(x => x.id === id) ?? null);
    });
  }
}
