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
import { InvoiceService } from '../services/invoice.service';
import { Invoice } from '../models/invoice.model';

@Component({
  selector: 'app-admin-invoice-detail',
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
        { label: 'menu.dashboard', route: '/admin/dashboard' },
        { label: 'menu.invoices', route: '/admin/invoices' },
        { label: 'invoices.detail' }
      ]">
      <button mat-button routerLink="/admin/invoices">
        <mat-icon>arrow_back</mat-icon>
        {{ 'common.back' | translate }}
      </button>
      @if (invoice()?.status === 'PENDING' || invoice()?.status === 'OVERDUE') {
        <button mat-raised-button color="primary" [routerLink]="['/admin/payments/new']" [queryParams]="{invoiceId: invoice()?.id}">
          <mat-icon>payments</mat-icon>
          Registrar Pago
        </button>
      }
    </app-page-header>

    @if (isLoading()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (invoice()) {
      <div class="detail-container">
        <div class="main-content">
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
                  <span class="label">{{ 'invoices.contract' | translate }}</span>
                  <span class="value">{{ invoice()!.contractNumber || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">{{ 'invoices.issueDate' | translate }}</span>
                  <span class="value">{{ invoice()!.issueDate | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">{{ 'invoices.dueDate' | translate }}</span>
                  <span class="value" [class.overdue]="isOverdue()">
                    {{ invoice()!.dueDate | date:'dd/MM/yyyy' }}
                  </span>
                </div>
                @if (invoice()!.paidAt) {
                  <div class="info-item">
                    <span class="label">{{ 'invoices.paidAt' | translate }}</span>
                    <span class="value">{{ invoice()!.paidAt | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ 'invoices.client' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">{{ 'users.name' | translate }}</span>
                  <span class="value">{{ invoice()!.userName }}</span>
                </div>
                @if (invoice()!.userCompany) {
                  <div class="info-item">
                    <span class="label">{{ 'users.company' | translate }}</span>
                    <span class="value">{{ invoice()!.userCompany }}</span>
                  </div>
                }
                @if (invoice()!.userEmail) {
                  <div class="info-item">
                    <span class="label">{{ 'users.email' | translate }}</span>
                    <span class="value">{{ invoice()!.userEmail }}</span>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="sidebar">
          <mat-card class="amount-card">
            <mat-card-header>
              <mat-card-title>{{ 'invoices.totalAmount' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="total-amount">
                {{ invoice()!.amount | currencyFormat }}
              </div>
              <div class="due-info" [class.overdue]="isOverdue()">
                @if (invoice()!.status === 'PENDING') {
                  @if (isOverdue()) {
                    <mat-icon>warning</mat-icon>
                    <span>{{ 'invoices.overdueBy' | translate }} {{ getOverdueDays() }} días</span>
                  } @else {
                    <mat-icon>schedule</mat-icon>
                    <span>{{ 'invoices.dueIn' | translate }} {{ getDaysUntilDue() }} días</span>
                  }
                }
              </div>
            </mat-card-content>
          </mat-card>

          @if (invoice()!.status === 'PAID') {
            <mat-card class="paid-card">
              <mat-card-content>
                <mat-icon>check_circle</mat-icon>
                <h3>{{ 'invoices.paid' | translate }}</h3>
                <p>{{ invoice()!.paidAt | date:'dd/MM/yyyy HH:mm' }}</p>
                @if (invoice()!.paymentReference) {
                  <p class="reference">Ref: {{ invoice()!.paymentReference }}</p>
                }
              </mat-card-content>
            </mat-card>
          }

          @if (invoice()!.status === 'OVERDUE') {
            <mat-card class="overdue-card">
              <mat-card-content>
                <mat-icon>warning</mat-icon>
                <h3>{{ 'invoices.overdue' | translate }}</h3>
                <p>{{ 'invoices.overdueMessage' | translate }}</p>
              </mat-card-content>
            </mat-card>
          }

          @if (invoice()!.status === 'PENDING' || invoice()!.status === 'OVERDUE') {
            <mat-card class="actions-card">
              <mat-card-content>
                <button mat-raised-button color="primary" class="full-width"
                        [routerLink]="['/admin/payments/new']"
                        [queryParams]="{invoiceId: invoice()!.id}">
                  <mat-icon>payments</mat-icon>
                  Registrar Pago
                </button>
                @if (invoice()!.status === 'PENDING' && !isOverdue()) {
                  <button mat-stroked-button color="warn" class="full-width" (click)="markAsOverdue()">
                    <mat-icon>warning</mat-icon>
                    {{ 'invoices.markOverdue' | translate }}
                  </button>
                }
                @if (invoice()!.status === 'PENDING') {
                  <button mat-stroked-button color="warn" class="full-width" (click)="cancelInvoice()">
                    <mat-icon>cancel</mat-icon>
                    {{ 'invoices.cancel' | translate }}
                  </button>
                }
              </mat-card-content>
            </mat-card>
          }
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

    .overdue {
      color: #f44336;
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

    .due-info {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: rgba(0,0,0,0.6);
    }

    .due-info.overdue {
      color: #f44336;
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

    .paid-card .reference {
      font-size: 12px;
      color: rgba(0,0,0,0.6);
    }

    .overdue-card {
      background: #ffebee;
      text-align: center;
    }

    .overdue-card mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #f44336;
    }

    .overdue-card h3 {
      margin: 8px 0;
      color: #c62828;
    }

    .actions-card mat-card-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .full-width {
      width: 100%;
    }

    @media (max-width: 1024px) {
      .detail-container {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminInvoiceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private invoiceService = inject(InvoiceService);
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
        this.router.navigate(['/admin/invoices']);
      }
    });
  }

  isOverdue(): boolean {
    const invoice = this.invoice();
    if (!invoice || invoice.status !== 'PENDING') return false;
    return new Date(invoice.dueDate) < new Date();
  }

  getDaysUntilDue(): number {
    const invoice = this.invoice();
    if (!invoice) return 0;
    const dueDate = new Date(invoice.dueDate);
    const today = new Date();
    return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  getOverdueDays(): number {
    const invoice = this.invoice();
    if (!invoice) return 0;
    const dueDate = new Date(invoice.dueDate);
    const today = new Date();
    return Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  async markAsOverdue(): Promise<void> {
    const invoice = this.invoice();
    if (!invoice) return;

    const confirmed = await this.notification.confirm(
      `¿Marcar la factura ${invoice.invoiceNumber} como vencida?`
    );

    if (confirmed) {
      this.invoiceService.markAsOverdue(invoice.id).subscribe({
        next: (updated) => {
          this.invoice.set(updated);
          this.notification.success('Factura marcada como vencida');
        },
        error: () => {
          this.notification.error('Error al actualizar la factura');
        }
      });
    }
  }

  async cancelInvoice(): Promise<void> {
    const invoice = this.invoice();
    if (!invoice) return;

    const confirmed = await this.notification.confirm(
      `¿Está seguro de cancelar la factura ${invoice.invoiceNumber}?`
    );

    if (confirmed) {
      this.invoiceService.cancelInvoice(invoice.id).subscribe({
        next: () => {
          this.notification.success('Factura cancelada');
          this.router.navigate(['/admin/invoices']);
        },
        error: () => {
          this.notification.error('Error al cancelar la factura');
        }
      });
    }
  }
}
