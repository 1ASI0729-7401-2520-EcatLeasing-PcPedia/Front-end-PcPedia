import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { PageHeaderComponent } from '../../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../../shared/components/ui/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../../../../shared/components/ui/status-badge/status-badge.component';
import { CurrencyFormatPipe } from '../../../../../shared/pipes/currency-format.pipe';
import { NotificationService } from '../../../../../core/services/notification.service';
import { ClientQuoteService } from '../services/client-quote.service';
import { Quote } from '../models/quote.model';
import { QuoteStatus } from '../../../../../shared/models/base.model';

@Component({
  selector: 'app-client-quote-list',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatPaginatorModule,
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
      title="quotes.myQuotes"
      subtitle="quotes.myQuotesSubtitle"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/client/dashboard' },
        { label: 'menu.quotes' }
      ]">
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
          <div class="quote-cards">
            @for (quote of quotes(); track quote.id) {
              <mat-card class="quote-card" [routerLink]="['/client/quotes', quote.id]"
                        [class.pending-action]="quote.status === 'SENT'">
                <mat-card-header>
                  <mat-card-title>Cotización #{{ quote.id }}</mat-card-title>
                  <mat-card-subtitle>{{ quote.createdAt | date:'dd/MM/yyyy' }}</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="quote-info">
                    <div class="info-item">
                      <span class="label">{{ 'quotes.monthlyTotal' | translate }}:</span>
                      <span class="value price">{{ quote.totalMonthly | currencyFormat }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">{{ 'quotes.duration' | translate }}:</span>
                      <span class="value">{{ quote.durationMonths }} {{ 'common.months' | translate }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">{{ 'quotes.validUntil' | translate }}:</span>
                      <span class="value" [class.expired]="isExpired(quote.validUntil)">
                        {{ quote.validUntil | date:'dd/MM/yyyy' }}
                      </span>
                    </div>
                    <div class="info-item">
                      <span class="label">{{ 'common.status' | translate }}:</span>
                      <app-status-badge [status]="quote.status"></app-status-badge>
                    </div>
                  </div>
                  @if (quote.status === 'SENT') {
                    <div class="action-required">
                      <mat-icon>info</mat-icon>
                      {{ 'quotes.actionRequired' | translate }}
                    </div>
                  }
                </mat-card-content>
              </mat-card>
            }
          </div>

          <mat-paginator
            [length]="totalElements()"
            [pageSize]="pageSize()"
            [pageIndex]="pageIndex()"
            [pageSizeOptions]="[5, 10, 25]"
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

    .quote-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .quote-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .quote-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .quote-card.pending-action {
      border-left: 4px solid #ff9800;
    }

    .quote-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .label {
      color: rgba(0,0,0,0.6);
      font-size: 14px;
    }

    .value {
      font-weight: 500;
    }

    .value.price {
      color: #1a3458;
      font-size: 18px;
    }

    .value.expired {
      color: #f44336;
    }

    .action-required {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      padding: 8px;
      background: #fff3e0;
      border-radius: 4px;
      color: #e65100;
      font-size: 14px;
    }

    .action-required mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `]
})
export class ClientQuoteListComponent implements OnInit {
  private quoteService = inject(ClientQuoteService);
  private notification = inject(NotificationService);

  quotes = signal<Quote[]>([]);
  isLoading = signal(false);
  totalElements = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);

  statusFilter = '';
  statuses = Object.values(QuoteStatus);

  ngOnInit(): void {
    this.loadQuotes();
  }

  loadQuotes(): void {
    this.isLoading.set(true);

    this.quoteService.getMyQuotes({
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

  isExpired(date: string): boolean {
    return new Date(date) < new Date();
  }
}
