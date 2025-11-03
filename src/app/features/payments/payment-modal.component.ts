// src/app/features/payments/payment-modal.component.ts
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentsRepository } from '../../data-access/repositories/payment.repository';
import { NotificationsRepository } from '../../data-access/repositories/notification.repository';
import type { Payment } from '../../domain/models/payment';

export type PaymentForModal = {
  id: string;
  orderId: string;
  invoiceNumber?: string;
  amount: number;
  currency: 'PEN'|'USD';
  status: 'pending'|'paid'|'failed';
  method: 'invoice'|'card'|'transfer';
  paidAt?: string;
};

@Component({
  standalone: true,
  selector: 'pc-payment-modal',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop"></div>
    <div class="modal">
      <h3>Pagar ahora</h3>
      <div class="muted">Recibo #{{ payment?.invoiceNumber || payment?.id }} • {{ payment?.amount | number:'1.0-2' }} {{ payment?.currency }}</div>

      <form (ngSubmit)="submit()" #f="ngForm" style="margin-top:12px">
        <label>
          Número de tarjeta
          <input [(ngModel)]="card.number" name="number" required maxlength="19" placeholder="4111 1111 1111 1111"/>
        </label>

        <div style="display:flex; gap:8px; margin-top:8px">
          <label class="grow">
            Expira (MM/AA)
            <input [(ngModel)]="card.exp" name="exp" required maxlength="5" placeholder="12/28"/>
          </label>
          <label class="grow">
            CVV
            <input [(ngModel)]="card.cvv" name="cvv" required maxlength="4" placeholder="123"/>
          </label>
        </div>

        <div style="margin-top:12px; display:flex; gap:8px; justify-content:flex-end">
          <button type="button" (click)="close(false)">Cancelar</button>
          <button type="submit" [disabled]="f.invalid || loading">
            {{ loading ? 'Procesando…' : 'Pagar' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .modal-backdrop{ position:fixed; inset:0; background:rgba(0,0,0,.3); }
    .modal{
      position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
      background:#fff; padding:16px; width:420px; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,.2);
    }
    label{ display:block; font-size:14px; color:#555; }
    input{ width:100%; padding:8px; margin-top:4px; border:1px solid #ddd; border-radius:8px; }
    .grow{ flex: 1 1 auto; }
  `]
})
export class PaymentModalComponent {
  private payments = inject(PaymentsRepository);
  private notifications = inject(NotificationsRepository);

  @Input() payment!: PaymentForModal | null;
  @Output() closed = new EventEmitter<boolean>();

  loading = false;
  card = { number: '', exp: '', cvv: '' };

  close(refresh = false) { this.closed.emit(refresh); }

  async submit() {
    if (!this.payment) return;

    // validación demo
    const digits = this.card.number.replace(/\s+/g, '');
    if (digits.length < 13 || this.card.exp.length < 4 || this.card.cvv.length < 3) {
      alert('Datos de tarjeta inválidos (demo).');
      return;
    }

    try {
      this.loading = true;

      // 1) marcar pagado
      const now = new Date().toISOString();
      await this.payments.patch(this.payment.id, { status: 'paid', paidAt: now }).toPromise();

      // 2) notificación (incluye read:false)
      await this.notifications.create({
        type: 'payment',
        title: 'Pago aplicado',
        body: `Se registró el pago ${this.payment.invoiceNumber ?? this.payment.id} por ${this.payment.amount} ${this.payment.currency}.`,
        read: false,
        // customerId si lo manejas -> customerId: 'cus_demo'
      }).toPromise();

      this.close(true);
    } catch (e) {
      console.error(e);
      alert('No se pudo procesar el pago (demo).');
    } finally {
      this.loading = false;
    }
  }
}
