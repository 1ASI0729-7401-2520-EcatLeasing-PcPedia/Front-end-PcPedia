import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { PageHeaderComponent } from '../../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../../../shared/components/ui/status-badge/status-badge.component';
import { CurrencyFormatPipe } from '../../../../../shared/pipes/currency-format.pipe';
import { NotificationService } from '../../../../../core/services/notification.service';
import { QuoteService } from '../services/quote.service';
import { Quote } from '../models/quote.model';

@Component({
  selector: 'app-admin-quote-detail',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTableModule,
    TranslateModule,
    DatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
    CurrencyFormatPipe
  ],
  template: `
    <app-page-header
      title="quotes.quoteDetail"
      [subtitle]="getQuoteNumber()"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/admin/dashboard' },
        { label: 'menu.quotes', route: '/admin/quotes' },
        { label: 'quotes.detail' }
      ]">
      <button mat-button routerLink="/admin/quotes">
        <mat-icon>arrow_back</mat-icon>
        {{ 'common.back' | translate }}
      </button>
      @if (quote()?.status === 'DRAFT') {
        <button mat-stroked-button [routerLink]="['/admin/quotes', quote()!.id, 'edit']">
          <mat-icon>edit</mat-icon>
          {{ 'common.edit' | translate }}
        </button>
        <button mat-raised-button color="primary" (click)="sendQuote()">
          <mat-icon>send</mat-icon>
          {{ 'quotes.send' | translate }}
        </button>
      }
    </app-page-header>

    @if (isLoading()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (quote()) {
      <div class="detail-container">
        <div class="main-content">
          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ 'quotes.information' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">{{ 'quotes.quoteNumber' | translate }}</span>
                  <span class="value">{{ getQuoteNumber() }}</span>
                </div>
                <div class="info-item">
                  <span class="label">{{ 'common.status' | translate }}</span>
                  <app-status-badge [status]="quote()!.status"></app-status-badge>
                </div>
                <div class="info-item">
                  <span class="label">{{ 'quotes.duration' | translate }}</span>
                  <span class="value">{{ quote()!.durationMonths }} meses</span>
                </div>
                <div class="info-item">
                  <span class="label">{{ 'quotes.validUntil' | translate }}</span>
                  <span class="value" [class.expired]="isExpired()">
                    {{ quote()!.validUntil | date:'dd/MM/yyyy' }}
                  </span>
                </div>
                <div class="info-item">
                  <span class="label">{{ 'common.createdAt' | translate }}</span>
                  <span class="value">{{ quote()!.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ 'quotes.client' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">{{ 'users.name' | translate }}</span>
                  <span class="value">{{ quote()!.userName }}</span>
                </div>
                @if (quote()!.companyName) {
                  <div class="info-item">
                    <span class="label">{{ 'users.company' | translate }}</span>
                    <span class="value">{{ quote()!.companyName }}</span>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ 'quotes.items' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table mat-table [dataSource]="quote()!.items" class="full-width">
                <ng-container matColumnDef="equipment">
                  <th mat-header-cell *matHeaderCellDef>{{ 'quotes.equipment' | translate }}</th>
                  <td mat-cell *matCellDef="let item">
                    <div class="equipment-info">
                      <span class="equipment-name">{{ item.equipmentName }}</span>
                      @if (item.equipmentBrand || item.equipmentModel) {
                        <span class="equipment-detail">{{ item.equipmentBrand }} {{ item.equipmentModel }}</span>
                      }
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="quantity">
                  <th mat-header-cell *matHeaderCellDef>{{ 'quotes.quantity' | translate }}</th>
                  <td mat-cell *matCellDef="let item">{{ item.quantity }}</td>
                </ng-container>

                <ng-container matColumnDef="unitPrice">
                  <th mat-header-cell *matHeaderCellDef>{{ 'quotes.monthlyPrice' | translate }}</th>
                  <td mat-cell *matCellDef="let item">{{ item.unitPrice | currencyFormat }}</td>
                </ng-container>

                <ng-container matColumnDef="subtotal">
                  <th mat-header-cell *matHeaderCellDef>{{ 'quotes.subtotal' | translate }}</th>
                  <td mat-cell *matCellDef="let item" class="amount">{{ item.subtotal | currencyFormat }}</td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="itemColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: itemColumns;"></tr>
              </table>
            </mat-card-content>
          </mat-card>

          @if (quote()!.terms) {
            <mat-card>
              <mat-card-header>
                <mat-card-title>{{ 'quotes.notes' | translate }}</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <p class="notes-text">{{ quote()!.terms }}</p>
              </mat-card-content>
            </mat-card>
          }
        </div>

        <div class="sidebar">
          <mat-card class="totals-card">
            <mat-card-header>
              <mat-card-title>{{ 'quotes.summary' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="totals">
                <div class="total-row">
                  <span>{{ 'quotes.monthlyTotal' | translate }}</span>
                  <span class="amount">{{ quote()!.totalMonthly | currencyFormat }}</span>
                </div>
                <div class="total-row">
                  <span>{{ 'quotes.duration' | translate }}</span>
                  <span>{{ quote()!.durationMonths }} meses</span>
                </div>
                <mat-divider></mat-divider>
                <div class="total-row grand-total">
                  <span>{{ 'quotes.totalAmount' | translate }}</span>
                  <span class="amount">{{ getTotalAmount() | currencyFormat }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          @if (quote()!.status === 'ACCEPTED') {
            <mat-card class="accepted-card">
              <mat-card-content>
                <mat-icon>check_circle</mat-icon>
                <h3>{{ 'quotes.accepted' | translate }}</h3>
                <p>{{ 'quotes.acceptedMessage' | translate }}</p>
                <button mat-raised-button color="primary"
                        [routerLink]="['/admin/contracts/new']"
                        [queryParams]="{ quoteId: quote()!.id }">
                  <mat-icon>description</mat-icon>
                  {{ 'quotes.createContract' | translate }}
                </button>
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

    .expired {
      color: #f44336;
    }

    .full-width {
      width: 100%;
    }

    .equipment-info {
      display: flex;
      flex-direction: column;
    }

    .equipment-name {
      font-weight: 500;
    }

    .equipment-detail {
      font-size: 12px;
      color: rgba(0,0,0,0.6);
    }

    .amount {
      font-weight: 500;
      color: #1a3458;
    }

    .totals {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px 0;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .grand-total {
      font-size: 18px;
      font-weight: 600;
      padding-top: 12px;
    }

    .notes-text {
      white-space: pre-wrap;
      margin: 16px 0;
    }

    .accepted-card {
      background: #e8f5e9;
      text-align: center;
    }

    .accepted-card mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #4caf50;
    }

    .accepted-card h3 {
      margin: 8px 0;
      color: #2e7d32;
    }

    .accepted-card button {
      margin-top: 16px;
    }

    @media (max-width: 1024px) {
      .detail-container {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminQuoteDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private quoteService = inject(QuoteService);
  private notification = inject(NotificationService);

  quote = signal<Quote | null>(null);
  isLoading = signal(false);
  quoteId = 0;

  itemColumns = ['equipment', 'quantity', 'unitPrice', 'subtotal'];

  ngOnInit(): void {
    this.quoteId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadQuote();
  }

  loadQuote(): void {
    this.isLoading.set(true);

    this.quoteService.getQuote(this.quoteId).subscribe({
      next: (quote) => {
        this.quote.set(quote);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.error('Error al cargar la cotización');
        this.router.navigate(['/admin/quotes']);
      }
    });
  }

  isExpired(): boolean {
    const quote = this.quote();
    if (!quote) return false;
    return new Date(quote.validUntil) < new Date();
  }

  getQuoteNumber(): string {
    const quote = this.quote();
    if (!quote) return '';
    return `COT-${quote.id.toString().padStart(4, '0')}`;
  }

  getTotalAmount(): number {
    const quote = this.quote();
    if (!quote) return 0;
    return quote.totalMonthly * quote.durationMonths;
  }

  async sendQuote(): Promise<void> {
    const quote = this.quote();
    if (!quote) return;

    const confirmed = await this.notification.confirm(
      `¿Enviar la cotización ${this.getQuoteNumber()} al cliente?`
    );

    if (confirmed) {
      this.quoteService.sendQuote(quote.id).subscribe({
        next: () => {
          this.loadQuote();
          this.notification.success('Cotización enviada exitosamente');
        },
        error: () => {
          this.notification.error('Error al enviar la cotización');
        }
      });
    }
  }
}
