// src/app/features/payments/payments.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PaymentsRepository } from '../../data-access/repositories/payment.repository';
import { PageHeaderComponent } from '../../shared/ui/page-header.component/page-header.component';
import { PaymentModalComponent, PaymentForModal } from './payment-modal.component';
import type { Payment } from '../../domain/models/payment';

type PaymentCardVM = Payment; // de momento 1:1

@Component({
  standalone: true,
  selector: 'pc-payments-list',
  imports: [CommonModule, RouterModule, PageHeaderComponent, PaymentModalComponent],
  templateUrl: './payments.html',
})
export class PaymentsListPage {
  private repo = inject(PaymentsRepository);

  payments = signal<PaymentCardVM[]>([]);
  paying   = signal<PaymentForModal | null>(null);

  ngOnInit() {
    this.reload();
  }

  private reload() {
    this.repo.listByCustomer('cus_demo').subscribe(rows => this.payments.set(rows));
  }

  openPay(p: PaymentCardVM) {
    // el modal exige id:string
    this.paying.set({
      id: p.id!,                   // en repo ya debe venir seteado
      orderId: p.orderId,
      invoiceNumber: p.invoiceNumber ?? undefined,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      method: p.method,
      paidAt: p.paidAt ?? undefined,
    });
  }

  closeModal(refresh?: boolean) {
    this.paying.set(null);
    if (refresh) this.reload();
  }
}
