import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { PageHeaderComponent } from '../../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../../shared/components/ui/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../../../../shared/components/ui/status-badge/status-badge.component';
import { CurrencyFormatPipe } from '../../../../../shared/pipes/currency-format.pipe';
import { NotificationService } from '../../../../../core/services/notification.service';
import { InvoiceService } from '../services/invoice.service';
import { Invoice } from '../models/invoice.model';
import { InvoiceStatus } from '../../../../../shared/models/base.model';

@Component({
  selector: 'app-admin-invoice-list',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatPaginatorModule,
    MatMenuModule,
    FormsModule,
    TranslateModule,
    DatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
    CurrencyFormatPipe
  ],
  template: `
    <app-page-header
      title="invoices.management"
      subtitle="invoices.managementSubtitle"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/admin/dashboard' },
        { label: 'menu.invoices' }
      ]">
      <button mat-raised-button color="primary" routerLink="/admin/invoices/new">
        <mat-icon>add</mat-icon>
        {{ 'invoices.newInvoice' | translate }}
      </button>
    </app-page-header>

    <mat-card>
      <mat-card-content>
        <div class="filters">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'common.status' | translate }}</mat-label>
            <mat-select [(ngModel)]="statusFilter" (selectionChange)="search()">
              <mat-option value="">{{ 'common.all' | translate }}</mat-option>
              @for (status of statuses; track status) {
                <mat-option [value]="status">{{ 'status.' + status | translate }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        @if (isLoading()) {
          <app-loading-spinner></app-loading-spinner>
        } @else if (invoices().length === 0) {
          <app-empty-state
            icon="receipt_long"
            [title]="'invoices.noInvoices' | translate"
            [message]="'invoices.noInvoicesMessage' | translate">
          </app-empty-state>
        } @else {
          <table mat-table [dataSource]="invoices()" class="full-width">
            <ng-container matColumnDef="invoiceNumber">
              <th mat-header-cell *matHeaderCellDef>{{ 'invoices.invoiceNumber' | translate }}</th>
              <td mat-cell *matCellDef="let invoice">{{ invoice.invoiceNumber }}</td>
            </ng-container>

            <ng-container matColumnDef="client">
              <th mat-header-cell *matHeaderCellDef>{{ 'invoices.client' | translate }}</th>
              <td mat-cell *matCellDef="let invoice">
                <div class="client-info">
                  <span class="client-name">{{ invoice.userName }}</span>
                  @if (invoice.userCompany) {
                    <span class="client-company">{{ invoice.userCompany }}</span>
                  }
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="contract">
              <th mat-header-cell *matHeaderCellDef>{{ 'invoices.contract' | translate }}</th>
              <td mat-cell *matCellDef="let invoice">{{ invoice.contractNumber || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>{{ 'common.amount' | translate }}</th>
              <td mat-cell *matCellDef="let invoice" class="amount">{{ invoice.amount | currencyFormat }}</td>
            </ng-container>

            <ng-container matColumnDef="issueDate">
              <th mat-header-cell *matHeaderCellDef>{{ 'invoices.issueDate' | translate }}</th>
              <td mat-cell *matCellDef="let invoice">{{ invoice.issueDate | date:'dd/MM/yyyy' }}</td>
            </ng-container>

            <ng-container matColumnDef="dueDate">
              <th mat-header-cell *matHeaderCellDef>{{ 'invoices.dueDate' | translate }}</th>
              <td mat-cell *matCellDef="let invoice" [class.overdue]="isOverdue(invoice)">
                {{ invoice.dueDate | date:'dd/MM/yyyy' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>{{ 'common.status' | translate }}</th>
              <td mat-cell *matCellDef="let invoice">
                <app-status-badge [status]="invoice.status"></app-status-badge>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>{{ 'common.actions' | translate }}</th>
              <td mat-cell *matCellDef="let invoice">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item [routerLink]="['/admin/invoices', invoice.id]">
                    <mat-icon>visibility</mat-icon>
                    <span>{{ 'common.view' | translate }}</span>
                  </button>
                  @if (invoice.status === 'PENDING' || invoice.status === 'OVERDUE') {
                    <button mat-menu-item (click)="markAsPaid(invoice)">
                      <mat-icon>payments</mat-icon>
                      <span>{{ 'invoices.markPaid' | translate }}</span>
                    </button>
                  }
                  @if (invoice.status === 'PENDING') {
                    <button mat-menu-item (click)="markAsOverdue(invoice)">
                      <mat-icon color="warn">warning</mat-icon>
                      <span>{{ 'invoices.markOverdue' | translate }}</span>
                    </button>
                    <button mat-menu-item (click)="cancelInvoice(invoice)">
                      <mat-icon color="warn">cancel</mat-icon>
                      <span>{{ 'common.cancel' | translate }}</span>
                    </button>
                  }
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                [class.pending-row]="row.status === 'PENDING'"
                [class.overdue-row]="row.status === 'OVERDUE'"
                [class.paid-row]="row.status === 'PAID'"></tr>
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

    .overdue {
      color: #f44336;
    }

    .pending-row {
      background-color: #fff8e1;
    }

    .overdue-row {
      background-color: #ffebee;
    }

    .paid-row {
      background-color: #e8f5e9;
    }

    table {
      margin-bottom: 16px;
    }
  `]
})
export class AdminInvoiceListComponent implements OnInit {
  private invoiceService = inject(InvoiceService);
  private notification = inject(NotificationService);

  invoices = signal<Invoice[]>([]);
  isLoading = signal(false);
  totalElements = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);

  statusFilter = '';
  statuses = Object.values(InvoiceStatus);

  displayedColumns = ['invoiceNumber', 'client', 'contract', 'amount', 'issueDate', 'dueDate', 'status', 'actions'];

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.isLoading.set(true);

    this.invoiceService.getInvoices({
      page: this.pageIndex(),
      size: this.pageSize(),
      status: this.statusFilter || undefined
    }).subscribe({
      next: (page) => {
        this.invoices.set(page.content);
        this.totalElements.set(page.totalElements);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.error('Error al cargar las facturas');
      }
    });
  }

  search(): void {
    this.pageIndex.set(0);
    this.loadInvoices();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadInvoices();
  }

  isOverdue(invoice: Invoice): boolean {
    return invoice.status === 'PENDING' && new Date(invoice.dueDate) < new Date();
  }

  async markAsPaid(invoice: Invoice): Promise<void> {
    const confirmed = await this.notification.confirm(
      `¿Marcar la factura ${invoice.invoiceNumber} como pagada?`
    );

    if (confirmed) {
      this.invoiceService.markAsPaid(invoice.id).subscribe({
        next: () => {
          this.notification.success('Factura marcada como pagada');
          this.loadInvoices();
        },
        error: () => {
          this.notification.error('Error al actualizar la factura');
        }
      });
    }
  }

  async markAsOverdue(invoice: Invoice): Promise<void> {
    const confirmed = await this.notification.confirm(
      `¿Marcar la factura ${invoice.invoiceNumber} como vencida?`
    );

    if (confirmed) {
      this.invoiceService.markAsOverdue(invoice.id).subscribe({
        next: () => {
          this.notification.success('Factura marcada como vencida');
          this.loadInvoices();
        },
        error: () => {
          this.notification.error('Error al actualizar la factura');
        }
      });
    }
  }

  async cancelInvoice(invoice: Invoice): Promise<void> {
    const confirmed = await this.notification.confirm(
      `¿Está seguro de cancelar la factura ${invoice.invoiceNumber}?`
    );

    if (confirmed) {
      this.invoiceService.cancelInvoice(invoice.id).subscribe({
        next: () => {
          this.notification.success('Factura cancelada');
          this.loadInvoices();
        },
        error: () => {
          this.notification.error('Error al cancelar la factura');
        }
      });
    }
  }
}
