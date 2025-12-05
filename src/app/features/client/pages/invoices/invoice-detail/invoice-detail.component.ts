import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { PageHeaderComponent } from '../../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../../../shared/components/ui/status-badge/status-badge.component';
import { CurrencyFormatPipe } from '../../../../../shared/pipes/currency-format.pipe';
import { NotificationService } from '../../../../../core/services/notification.service';
import { ClientInvoiceService } from '../services/client-invoice.service';
import { Invoice } from '../models/invoice.model';

@Component({
  selector: 'app-client-invoice-detail',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    TranslateModule,
    DatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
    CurrencyFormatPipe
  ],
  template: `
    <app-page-header
      title="invoices.invoiceDetail"
      [subtitle]="invoice()?.invoiceNumber || ''"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/client/dashboard' },
        { label: 'menu.invoices', route: '/client/invoices' },
        { label: 'invoices.detail' }
      ]">
      <button mat-button routerLink="/client/invoices">
        <mat-icon>arrow_back</mat-icon>
        {{ 'common.back' | translate }}
      </button>
    </app-page-header>

    @if (isLoading()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (invoice()) {
      <div class="detail-container">
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ 'invoices.information' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">{{ 'invoices.invoiceNumber' | translate }}</span>
                <span class="value">{{ invoice()!.invoiceNumber }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ 'common.status' | translate }}</span>
                <app-status-badge [status]="invoice()!.status"></app-status-badge>
              </div>
              <div class="info-item">
                <span class="label">{{ 'common.amount' | translate }}</span>
                <span class="value price">{{ invoice()!.amount | currencyFormat }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ 'invoices.issueDate' | translate }}</span>
                <span class="value">{{ invoice()!.issueDate | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ 'invoices.dueDate' | translate }}</span>
                <span class="value" [class.overdue]="isOverdue()">{{ invoice()!.dueDate | date:'dd/MM/yyyy' }}</span>
              </div>
              @if (invoice()!.contractNumber) {
                <div class="info-item">
                  <span class="label">{{ 'invoices.contract' | translate }}</span>
                  <span class="value">{{ invoice()!.contractNumber }}</span>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>

        @if (invoice()!.status === 'PENDING' || invoice()!.status === 'OVERDUE') {
          <mat-card class="payment-info-card">
            <mat-card-header>
              <mat-card-title>{{ 'invoices.paymentInfo' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="payment-instructions">
                <h4>{{ 'invoices.bankDetails' | translate }}</h4>
                <p><strong>{{ 'invoices.bank' | translate }}:</strong> Banco de Crédito del Perú</p>
                <p><strong>{{ 'invoices.accountNumber' | translate }}:</strong> 191-12345678-0-12</p>
                <p><strong>{{ 'invoices.cci' | translate }}:</strong> 002-191-012345678012-12</p>
                <p><strong>{{ 'invoices.holder' | translate }}:</strong> PcPedia SAC</p>
                <p><strong>{{ 'invoices.reference' | translate }}:</strong> {{ invoice()!.invoiceNumber }}</p>
              </div>
              <mat-divider></mat-divider>
              <p class="payment-note">
                <mat-icon>info</mat-icon>
                {{ 'invoices.paymentNote' | translate }}
              </p>
            </mat-card-content>
          </mat-card>
        }

        @if (invoice()!.status === 'PAID') {
          <mat-card class="paid-card">
            <mat-card-content>
              <mat-icon>check_circle</mat-icon>
              <h3>{{ 'invoices.paid' | translate }}</h3>
              <p>{{ 'invoices.paidMessage' | translate }}</p>
            </mat-card-content>
          </mat-card>
        }
      </div>
    }
  `,
  styles: [`
    .detail-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 700px;
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

    .value.price {
      color: #1a3458;
      font-size: 24px;
    }

    .value.overdue {
      color: #f44336;
    }

    .payment-info-card {
      background: #e3f2fd;
    }

    .payment-instructions {
      padding: 16px 0;
    }

    .payment-instructions h4 {
      margin: 0 0 12px 0;
    }

    .payment-instructions p {
      margin: 4px 0;
    }

    .payment-note {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 16px 0 0 0;
      color: #1565c0;
    }

    .paid-card {
      background: #e8f5e9;
      text-align: center;
    }

    .paid-card mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #4caf50;
    }

    .paid-card h3 {
      margin: 8px 0;
      color: #2e7d32;
    }
  `]
})
export class ClientInvoiceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private invoiceService = inject(ClientInvoiceService);
  private notification = inject(NotificationService);

  invoice = signal<Invoice | null>(null);
  isLoading = signal(false);
  invoiceId = 0;

  ngOnInit(): void {
    this.invoiceId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadInvoice();
  }

  loadInvoice(): void {
    this.isLoading.set(true);

    this.invoiceService.getInvoice(this.invoiceId).subscribe({
      next: (invoice) => {
        this.invoice.set(invoice);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.error('Error al cargar la factura');
        this.router.navigate(['/client/invoices']);
      }
    });
  }

  isOverdue(): boolean {
    const invoice = this.invoice();
    if (!invoice) return false;
    return invoice.status === 'PENDING' && new Date(invoice.dueDate) < new Date();
  }
}
