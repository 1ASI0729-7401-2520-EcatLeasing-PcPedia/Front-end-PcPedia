import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { InputErrorComponent } from '../../../../../shared/components/forms/input-error/input-error.component';
import { CurrencyFormatPipe } from '../../../../../shared/pipes/currency-format.pipe';
import { NotificationService } from '../../../../../core/services/notification.service';
import { PaymentService } from '../services/payment.service';
import { InvoiceService } from '../../invoices/services/invoice.service';
import { Invoice } from '../../invoices/models/invoice.model';
import { PaymentMethod } from '../../../../../shared/models/base.model';

@Component({
  selector: 'app-admin-payment-form',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslateModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    InputErrorComponent,
    CurrencyFormatPipe
  ],
  template: `
    <app-page-header
      title="payments.registerPayment"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/admin/dashboard' },
        { label: 'menu.payments', route: '/admin/payments' },
        { label: 'payments.new' }
      ]">
    </app-page-header>

    @if (isLoading()) {
      <app-loading-spinner></app-loading-spinner>
    } @else {
      <div class="form-container">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Seleccionar Factura</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (pendingInvoices().length === 0) {
              <div class="no-invoices">
                <mat-icon>receipt_long</mat-icon>
                <p>No hay facturas pendientes de pago</p>
                <button mat-stroked-button routerLink="/admin/invoices">
                  Ver todas las facturas
                </button>
              </div>
            } @else {
              <div class="invoices-grid">
                @for (invoice of pendingInvoices(); track invoice.id) {
                  <div class="invoice-card"
                       [class.selected]="selectedInvoice()?.id === invoice.id"
                       (click)="selectInvoice(invoice)">
                    <div class="invoice-header">
                      <span class="invoice-number">{{ invoice.invoiceNumber }}</span>
                      <span class="invoice-status" [class.overdue]="invoice.status === 'OVERDUE'">
                        {{ invoice.status === 'OVERDUE' ? 'VENCIDA' : 'PENDIENTE' }}
                      </span>
                    </div>
                    <div class="invoice-body">
                      <div class="invoice-client">{{ invoice.userName }}</div>
                      <div class="invoice-company">{{ invoice.userCompany || '-' }}</div>
                    </div>
                    <div class="invoice-footer">
                      <span class="invoice-amount">{{ invoice.amount | currencyFormat }}</span>
                      <span class="invoice-due">Vence: {{ invoice.dueDate }}</span>
                    </div>
                  </div>
                }
              </div>
            }
          </mat-card-content>
        </mat-card>

        @if (selectedInvoice()) {
          <mat-card>
            <mat-card-header>
              <mat-card-title>Datos del Pago</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <form [formGroup]="paymentForm" (ngSubmit)="onSubmit()">
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>Monto</mat-label>
                    <input matInput type="number" formControlName="amount" min="0" step="0.01">
                    <span matTextPrefix>S/. &nbsp;</span>
                    <mat-error>
                      <app-input-error [control]="paymentForm.get('amount')"></app-input-error>
                    </mat-error>
                    <mat-hint>Monto pendiente: {{ selectedInvoice()!.pendingAmount | currencyFormat }}</mat-hint>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Método de Pago</mat-label>
                    <mat-select formControlName="paymentMethod">
                      @for (method of paymentMethods; track method) {
                        <mat-option [value]="method">{{ 'paymentMethod.' + method | translate }}</mat-option>
                      }
                    </mat-select>
                    <mat-error>
                      <app-input-error [control]="paymentForm.get('paymentMethod')"></app-input-error>
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Fecha de Pago</mat-label>
                    <input matInput [matDatepicker]="picker" formControlName="paymentDate">
                    <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                    <mat-datepicker #picker></mat-datepicker>
                    <mat-error>
                      <app-input-error [control]="paymentForm.get('paymentDate')"></app-input-error>
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Referencia / Número de Operación</mat-label>
                    <input matInput formControlName="reference" placeholder="Ej: OP-12345678">
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Notas</mat-label>
                    <textarea matInput formControlName="notes" rows="3"></textarea>
                  </mat-form-field>
                </div>

                <div class="form-actions">
                  <button mat-stroked-button type="button" routerLink="/admin/payments">
                    {{ 'common.cancel' | translate }}
                  </button>
                  <button mat-raised-button color="primary" type="submit" [disabled]="isSubmitting()">
                    @if (isSubmitting()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      <mat-icon>payments</mat-icon>
                      Registrar Pago
                    }
                  </button>
                </div>
              </form>
            </mat-card-content>
          </mat-card>
        }
      </div>
    }
  `,
  styles: [`
    .form-container {
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .no-invoices {
      text-align: center;
      padding: 40px;
      color: rgba(0,0,0,0.6);
    }

    .no-invoices mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: rgba(0,0,0,0.3);
    }

    .no-invoices p {
      margin: 16px 0;
    }

    .invoices-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
      padding: 16px 0;
    }

    .invoice-card {
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .invoice-card:hover {
      border-color: #1A3458;
      background: #f5f5f5;
    }

    .invoice-card.selected {
      border-color: #00D9FF;
      background: #e0f7fa;
    }

    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .invoice-number {
      font-weight: 600;
      color: #1A3458;
    }

    .invoice-status {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 12px;
      background: #fff3e0;
      color: #e65100;
    }

    .invoice-status.overdue {
      background: #ffebee;
      color: #c62828;
    }

    .invoice-body {
      margin-bottom: 12px;
    }

    .invoice-client {
      font-weight: 500;
    }

    .invoice-company {
      font-size: 13px;
      color: rgba(0,0,0,0.6);
    }

    .invoice-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #e0e0e0;
    }

    .invoice-amount {
      font-size: 18px;
      font-weight: 600;
      color: #1A3458;
    }

    .invoice-due {
      font-size: 12px;
      color: rgba(0,0,0,0.6);
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      padding: 16px 0;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
    }
  `]
})
export class AdminPaymentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private paymentService = inject(PaymentService);
  private invoiceService = inject(InvoiceService);
  private notification = inject(NotificationService);

  isLoading = signal(false);
  isSubmitting = signal(false);
  pendingInvoices = signal<Invoice[]>([]);
  selectedInvoice = signal<Invoice | null>(null);
  preselectedInvoiceId: number | null = null;

  paymentMethods = Object.values(PaymentMethod);

  paymentForm: FormGroup = this.fb.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    paymentMethod: ['', [Validators.required]],
    paymentDate: [new Date(), [Validators.required]],
    reference: [''],
    notes: ['']
  });

  ngOnInit(): void {
    const invoiceIdParam = this.route.snapshot.queryParamMap.get('invoiceId');
    if (invoiceIdParam) {
      this.preselectedInvoiceId = Number(invoiceIdParam);
    }
    this.loadPendingInvoices();
  }

  loadPendingInvoices(): void {
    this.isLoading.set(true);
    this.invoiceService.getPendingInvoices().subscribe({
      next: (invoices) => {
        this.pendingInvoices.set(invoices);

        // Auto-select invoice if preselectedInvoiceId is provided
        if (this.preselectedInvoiceId) {
          const invoice = invoices.find(i => i.id === this.preselectedInvoiceId);
          if (invoice) {
            this.selectInvoice(invoice);
          }
        }

        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.error('Error al cargar las facturas pendientes');
      }
    });
  }

  selectInvoice(invoice: Invoice): void {
    this.selectedInvoice.set(invoice);
    this.paymentForm.patchValue({
      amount: invoice.pendingAmount || invoice.amount
    });
  }

  onSubmit(): void {
    if (this.paymentForm.invalid || !this.selectedInvoice()) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.paymentForm.value;
    const request = {
      invoiceId: this.selectedInvoice()!.id,
      amount: formValue.amount,
      paymentMethod: formValue.paymentMethod,
      reference: formValue.reference || undefined,
      paymentDate: formValue.paymentDate.toISOString().split('T')[0],
      notes: formValue.notes || undefined
    };

    this.paymentService.registerPayment(request).subscribe({
      next: (paymentId) => {
        this.isSubmitting.set(false);
        this.notification.success('Pago registrado correctamente');
        this.router.navigate(['/admin/payments', paymentId]);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        const message = error.error?.message || 'Error al registrar el pago';
        this.notification.error(message);
      }
    });
  }
}
