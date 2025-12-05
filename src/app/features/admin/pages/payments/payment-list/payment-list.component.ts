import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { PageHeaderComponent } from '../../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../../shared/components/ui/empty-state/empty-state.component';
import { CurrencyFormatPipe } from '../../../../../shared/pipes/currency-format.pipe';
import { NotificationService } from '../../../../../core/services/notification.service';
import { PaymentService } from '../services/payment.service';
import { Payment } from '../models/payment.model';

@Component({
  selector: 'app-admin-payment-list',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatMenuModule,
    TranslateModule,
    DatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    CurrencyFormatPipe
  ],
  template: `
    <app-page-header
      title="payments.management"
      subtitle="payments.managementSubtitle"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/admin/dashboard' },
        { label: 'menu.payments' }
      ]">
      <button mat-raised-button color="primary" routerLink="/admin/payments/new">
        <mat-icon>add</mat-icon>
        {{ 'payments.registerPayment' | translate }}
      </button>
    </app-page-header>

    <mat-card>
      <mat-card-content>
        @if (isLoading()) {
          <app-loading-spinner></app-loading-spinner>
        } @else if (payments().length === 0) {
          <app-empty-state
            icon="payments"
            [title]="'payments.noPayments' | translate"
            [message]="'payments.noPaymentsMessage' | translate">
          </app-empty-state>
        } @else {
          <table mat-table [dataSource]="payments()" class="full-width">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let payment">#{{ payment.id }}</td>
            </ng-container>

            <ng-container matColumnDef="invoice">
              <th mat-header-cell *matHeaderCellDef>{{ 'payments.invoice' | translate }}</th>
              <td mat-cell *matCellDef="let payment">{{ payment.invoiceNumber || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>{{ 'common.amount' | translate }}</th>
              <td mat-cell *matCellDef="let payment" class="amount">{{ payment.amount | currencyFormat }}</td>
            </ng-container>

            <ng-container matColumnDef="method">
              <th mat-header-cell *matHeaderCellDef>{{ 'payments.method' | translate }}</th>
              <td mat-cell *matCellDef="let payment">
                <span class="method-badge">{{ 'paymentMethod.' + payment.paymentMethod | translate }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="paymentDate">
              <th mat-header-cell *matHeaderCellDef>{{ 'payments.date' | translate }}</th>
              <td mat-cell *matCellDef="let payment">{{ payment.paymentDate | date:'dd/MM/yyyy' }}</td>
            </ng-container>

            <ng-container matColumnDef="reference">
              <th mat-header-cell *matHeaderCellDef>{{ 'payments.reference' | translate }}</th>
              <td mat-cell *matCellDef="let payment">{{ payment.reference || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>{{ 'common.actions' | translate }}</th>
              <td mat-cell *matCellDef="let payment">
                <button mat-icon-button [routerLink]="['/admin/payments', payment.id]">
                  <mat-icon>visibility</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <mat-paginator
            [length]="totalElements()"
            [pageSize]="pageSize()"
            [pageIndex]="pageIndex()"
            [pageSizeOptions]="[5, 10, 25, 50]"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .filters {
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    .client-info {
      display: flex;
      flex-direction: column;
    }

    .client-name {
      font-weight: 500;
    }

    .client-company {
      font-size: 12px;
      color: rgba(0,0,0,0.6);
    }

    .amount {
      font-weight: 500;
      color: #1a3458;
    }

    .method-badge {
      background: #e3f2fd;
      color: #1565c0;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
    }

    .pending-row {
      background-color: #fff8e1;
    }

    .confirmed-row {
      background-color: #e8f5e9;
    }

    table {
      margin-bottom: 16px;
    }
  `]
})
export class AdminPaymentListComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private notification = inject(NotificationService);

  payments = signal<Payment[]>([]);
  isLoading = signal(false);
  totalElements = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);

  displayedColumns = ['id', 'invoice', 'amount', 'method', 'paymentDate', 'reference', 'actions'];

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading.set(true);

    this.paymentService.getPayments({
      page: this.pageIndex(),
      size: this.pageSize()
    }).subscribe({
      next: (page) => {
        this.payments.set(page.content);
        this.totalElements.set(page.totalElements);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.error('Error al cargar los pagos');
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadPayments();
  }
}
