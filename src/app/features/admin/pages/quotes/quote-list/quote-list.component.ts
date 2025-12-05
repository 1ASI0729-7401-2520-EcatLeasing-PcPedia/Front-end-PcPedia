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
import { QuoteService } from '../services/quote.service';
import { Quote } from '../models/quote.model';
import { QuoteStatus } from '../../../../../shared/models/base.model';

@Component({
  selector: 'app-admin-quote-list',
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
      title="quotes.management"
      subtitle="quotes.managementSubtitle"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/admin/dashboard' },
        { label: 'menu.quotes' }
      ]">
      <button mat-raised-button color="primary" routerLink="/admin/quotes/new">
        <mat-icon>add</mat-icon>
        {{ 'quotes.newQuote' | translate }}
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
        } @else if (quotes().length === 0) {
          <app-empty-state
            icon="request_quote"
            [title]="'quotes.noQuotes' | translate"
            [message]="'quotes.noQuotesMessage' | translate">
          </app-empty-state>
        } @else {
          <table mat-table [dataSource]="quotes()" class="full-width">
            <ng-container matColumnDef="quoteNumber">
              <th mat-header-cell *matHeaderCellDef>{{ 'quotes.quoteNumber' | translate }}</th>
              <td mat-cell *matCellDef="let quote">COT-{{ quote.id.toString().padStart(4, '0') }}</td>
            </ng-container>

            <ng-container matColumnDef="client">
              <th mat-header-cell *matHeaderCellDef>{{ 'quotes.client' | translate }}</th>
              <td mat-cell *matCellDef="let quote">
                <div class="client-info">
                  <span class="client-name">{{ quote.userName }}</span>
                  @if (quote.companyName) {
                    <span class="client-company">{{ quote.companyName }}</span>
                  }
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="items">
              <th mat-header-cell *matHeaderCellDef>{{ 'quotes.items' | translate }}</th>
              <td mat-cell *matCellDef="let quote">{{ quote.items?.length || 0 }} equipos</td>
            </ng-container>

            <ng-container matColumnDef="totalMonthly">
              <th mat-header-cell *matHeaderCellDef>{{ 'quotes.monthlyTotal' | translate }}</th>
              <td mat-cell *matCellDef="let quote" class="amount">{{ quote.totalMonthly | currencyFormat }}</td>
            </ng-container>

            <ng-container matColumnDef="duration">
              <th mat-header-cell *matHeaderCellDef>{{ 'quotes.duration' | translate }}</th>
              <td mat-cell *matCellDef="let quote">{{ quote.durationMonths }} meses</td>
            </ng-container>

            <ng-container matColumnDef="validUntil">
              <th mat-header-cell *matHeaderCellDef>{{ 'quotes.validUntil' | translate }}</th>
              <td mat-cell *matCellDef="let quote" [class.expired]="isExpired(quote)">
                {{ quote.validUntil | date:'dd/MM/yyyy' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>{{ 'common.status' | translate }}</th>
              <td mat-cell *matCellDef="let quote">
                <app-status-badge [status]="quote.status"></app-status-badge>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>{{ 'common.actions' | translate }}</th>
              <td mat-cell *matCellDef="let quote">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item [routerLink]="['/admin/quotes', quote.id]">
                    <mat-icon>visibility</mat-icon>
                    <span>{{ 'common.view' | translate }}</span>
                  </button>
                  @if (quote.status === 'DRAFT') {
                    <button mat-menu-item (click)="sendQuote(quote)">
                      <mat-icon>send</mat-icon>
                      <span>{{ 'quotes.send' | translate }}</span>
                    </button>
                    <button mat-menu-item [routerLink]="['/admin/quotes', quote.id, 'edit']">
                      <mat-icon>edit</mat-icon>
                      <span>{{ 'common.edit' | translate }}</span>
                    </button>
                    <button mat-menu-item (click)="cancelQuote(quote)">
                      <mat-icon color="warn">cancel</mat-icon>
                      <span>{{ 'common.cancel' | translate }}</span>
                    </button>
                  }
                  @if (quote.status === 'SENT') {
                    <button mat-menu-item (click)="cancelQuote(quote)">
                      <mat-icon color="warn">cancel</mat-icon>
                      <span>{{ 'common.cancel' | translate }}</span>
                    </button>
                  }
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                [class.pending-row]="row.status === 'DRAFT'"
                [class.expired-row]="row.status === 'EXPIRED'"></tr>
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

    .expired {
      color: #f44336;
    }

    .pending-row {
      background-color: #fff8e1;
    }

    .expired-row {
      background-color: #ffebee;
    }

    table {
      margin-bottom: 16px;
    }
  `]
})
export class AdminQuoteListComponent implements OnInit {
  private quoteService = inject(QuoteService);
  private notification = inject(NotificationService);

  quotes = signal<Quote[]>([]);
  isLoading = signal(false);
  totalElements = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);

  statusFilter = '';
  statuses = Object.values(QuoteStatus);

  displayedColumns = ['quoteNumber', 'client', 'items', 'totalMonthly', 'duration', 'validUntil', 'status', 'actions'];

  ngOnInit(): void {
    this.loadQuotes();
  }

  loadQuotes(): void {
    this.isLoading.set(true);

    this.quoteService.getQuotes({
      page: this.pageIndex(),
      size: this.pageSize(),
      status: this.statusFilter || undefined
    }).subscribe({
      next: (page) => {
        this.quotes.set(page.content);
        this.totalElements.set(page.totalElements);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.error('Error al cargar las cotizaciones');
      }
    });
  }

  search(): void {
    this.pageIndex.set(0);
    this.loadQuotes();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadQuotes();
  }

  isExpired(quote: Quote): boolean {
    return new Date(quote.validUntil) < new Date();
  }

  getQuoteNumber(quote: Quote): string {
    return `COT-${quote.id.toString().padStart(4, '0')}`;
  }

  async sendQuote(quote: Quote): Promise<void> {
    const confirmed = await this.notification.confirm(
      `¿Enviar la cotización ${this.getQuoteNumber(quote)} al cliente?`
    );

    if (confirmed) {
      this.quoteService.sendQuote(quote.id).subscribe({
        next: () => {
          this.notification.success('Cotización enviada exitosamente');
          this.loadQuotes();
        },
        error: () => {
          this.notification.error('Error al enviar la cotización');
        }
      });
    }
  }

  async cancelQuote(quote: Quote): Promise<void> {
    const confirmed = await this.notification.confirm(
      `¿Está seguro de cancelar la cotización ${this.getQuoteNumber(quote)}?`
    );

    if (confirmed) {
      this.quoteService.cancelQuote(quote.id).subscribe({
        next: () => {
          this.notification.success('Cotización cancelada');
          this.loadQuotes();
        },
        error: () => {
          this.notification.error('Error al cancelar la cotización');
        }
      });
    }
  }
}
