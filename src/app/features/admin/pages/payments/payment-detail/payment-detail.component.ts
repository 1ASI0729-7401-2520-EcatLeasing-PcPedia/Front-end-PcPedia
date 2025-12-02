import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { PageHeaderComponent } from '../../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { CurrencyFormatPipe } from '../../../../../shared/pipes/currency-format.pipe';
import { NotificationService } from '../../../../../core/services/notification.service';
import { PaymentService } from '../services/payment.service';
import { Payment } from '../models/payment.model';

@Component({
  selector: 'app-admin-payment-detail',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    DatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    CurrencyFormatPipe
  ],
  template: `
    <app-page-header
      title="payments.paymentDetail"
      [subtitle]="'#' + paymentId"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/admin/dashboard' },
        { label: 'menu.payments', route: '/admin/payments' },
        { label: 'payments.detail' }
      ]">
      <button mat-button routerLink="/admin/payments">
        <mat-icon>arrow_back</mat-icon>
        {{ 'common.back' | translate }}
      </button>
    </app-page-header>

    @if (isLoading()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (payment()) {
      <div class="detail-container">
        <div class="main-content">
          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ 'payments.information' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">{{ 'payments.invoice' | translate }}</span>
                  <span class="value">{{ payment()!.invoiceNumber || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">{{ 'payments.method' | translate }}</span>
                  <span class="value">{{ 'paymentMethod.' + payment()!.paymentMethod | translate }}</span>
                </div>
                <div class="info-item">
                  <span class="label">{{ 'payments.date' | translate }}</span>
                  <span class="value">{{ payment()!.paymentDate | date:'dd/MM/yyyy' }}</span>
                </div>
                @if (payment()!.reference) {
                  <div class="info-item">
                    <span class="label">{{ 'payments.reference' | translate }}</span>
                    <span class="value">{{ payment()!.reference }}</span>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>

          @if (payment()!.notes) {
            <mat-card>
              <mat-card-header>
                <mat-card-title>{{ 'payments.notes' | translate }}</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <p class="notes-text">{{ payment()!.notes }}</p>
              </mat-card-content>
            </mat-card>
          }
        </div>

        <div class="sidebar">
          <mat-card class="amount-card">
            <mat-card-header>
              <mat-card-title>{{ 'payments.amount' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="total-amount">
                {{ payment()!.amount | currencyFormat }}
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="confirmed-card">
            <mat-card-content>
              <mat-icon>check_circle</mat-icon>
              <h3>Pago Registrado</h3>
              <p>{{ payment()!.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    }
  `,
  styles: [`
    .detail-container {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 16px;
    }

    .main-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .sidebar {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      padding: 16px 0;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .label {
      font-size: 12px;
      color: rgba(0,0,0,0.6);
      text-transform: uppercase;
    }

    .value {
      font-size: 16px;
      font-weight: 500;
    }

    .notes-text {
      white-space: pre-wrap;
      margin: 16px 0;
    }

    .amount-card {
      text-align: center;
    }

    .total-amount {
      font-size: 36px;
      font-weight: 600;
      color: #1a3458;
      margin: 16px 0;
    }

    .confirmed-card {
      background: #e8f5e9;
      text-align: center;
    }

    .confirmed-card mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #4caf50;
    }

    .confirmed-card h3 {
      margin: 8px 0;
      color: #2e7d32;
    }

    @media (max-width: 1024px) {
      .detail-container {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminPaymentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private paymentService = inject(PaymentService);
  private notification = inject(NotificationService);

  payment = signal<Payment | null>(null);
  isLoading = signal(false);
  paymentId = 0;

  ngOnInit(): void {
    this.paymentId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPayment();
  }

  loadPayment(): void {
    this.isLoading.set(true);

    this.paymentService.getPayment(this.paymentId).subscribe({
      next: (payment) => {
        this.payment.set(payment);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.error('Error al cargar el pago');
        this.router.navigate(['/admin/payments']);
      }
    });
  }
}
