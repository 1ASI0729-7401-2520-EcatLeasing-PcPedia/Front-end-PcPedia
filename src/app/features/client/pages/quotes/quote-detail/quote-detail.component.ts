import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { PageHeaderComponent } from '../../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../../../shared/components/ui/status-badge/status-badge.component';
import { CurrencyFormatPipe } from '../../../../../shared/pipes/currency-format.pipe';
import { NotificationService } from '../../../../../core/services/notification.service';
import { ClientQuoteService } from '../services/client-quote.service';
import { Quote } from '../models/quote.model';

@Component({
  selector: 'app-client-quote-detail',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDividerModule,
    MatDialogModule,
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
      [subtitle]="'Cotización #' + quoteId"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/client/dashboard' },
        { label: 'menu.quotes', route: '/client/quotes' },
        { label: 'quotes.detail' }
      ]">
      <button mat-button routerLink="/client/quotes">
        <mat-icon>arrow_back</mat-icon>
        {{ 'common.back' | translate }}
      </button>
    </app-page-header>

    @if (isLoading()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (quote()) {
      <div class="detail-container">
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ 'quotes.information' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">{{ 'common.status' | translate }}</span>
                <app-status-badge [status]="quote()!.status"></app-status-badge>
              </div>
              <div class="info-item">
                <span class="label">{{ 'quotes.monthlyTotal' | translate }}</span>
                <span class="value price">{{ quote()!.totalMonthly | currencyFormat }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ 'quotes.duration' | translate }}</span>
                <span class="value">{{ quote()!.durationMonths }} {{ 'common.months' | translate }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ 'quotes.validUntil' | translate }}</span>
                <span class="value" [class.expired]="isExpired()">{{ quote()!.validUntil | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ 'common.createdAt' | translate }}</span>
                <span class="value">{{ quote()!.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>

            @if (quote()!.terms) {
              <mat-divider></mat-divider>
              <div class="terms-section">
                <h4>{{ 'quotes.terms' | translate }}</h4>
                <p>{{ quote()!.terms }}</p>
              </div>
            }
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ 'quotes.quotedEquipment' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="quote()!.items" class="full-width">
              <ng-container matColumnDef="equipment">
                <th mat-header-cell *matHeaderCellDef>{{ 'common.equipment' | translate }}</th>
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
                <th mat-header-cell *matHeaderCellDef>{{ 'common.quantity' | translate }}</th>
                <td mat-cell *matCellDef="let item">{{ item.quantity }}</td>
              </ng-container>

              <ng-container matColumnDef="unitPrice">
                <th mat-header-cell *matHeaderCellDef>{{ 'quotes.unitPrice' | translate }}</th>
                <td mat-cell *matCellDef="let item">{{ item.unitPrice | currencyFormat }}</td>
              </ng-container>

              <ng-container matColumnDef="subtotal">
                <th mat-header-cell *matHeaderCellDef>{{ 'common.subtotal' | translate }}</th>
                <td mat-cell *matCellDef="let item">{{ item.subtotal | currencyFormat }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <div class="total-row">
              <span>{{ 'quotes.monthlyTotal' | translate }}:</span>
              <span class="total-value">{{ quote()!.totalMonthly | currencyFormat }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        @if (quote()!.status === 'SENT' && !isExpired()) {
          <mat-card class="actions-card">
            <mat-card-content>
              <h3>{{ 'quotes.respondToQuote' | translate }}</h3>
              <p>{{ 'quotes.respondMessage' | translate }}</p>
              <div class="action-buttons">
                <button mat-raised-button color="warn" (click)="rejectQuote()"
                        [disabled]="isProcessing()">
                  <mat-icon>close</mat-icon>
                  {{ 'quotes.reject' | translate }}
                </button>
                <button mat-raised-button color="primary" (click)="acceptQuote()"
                        [disabled]="isProcessing()">
                  <mat-icon>check</mat-icon>
                  {{ 'quotes.accept' | translate }}
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        }

        @if (quote()!.status === 'ACCEPTED') {
          <mat-card class="success-card">
            <mat-card-content>
              <mat-icon>check_circle</mat-icon>
              <h3>{{ 'quotes.accepted' | translate }}</h3>
              <p>{{ 'quotes.acceptedMessage' | translate }}</p>
            </mat-card-content>
          </mat-card>
        }

        @if (quote()!.status === 'REJECTED') {
          <mat-card class="rejected-card">
            <mat-card-content>
              <mat-icon>cancel</mat-icon>
              <h3>{{ 'quotes.rejected' | translate }}</h3>
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
      font-size: 20px;
    }

    .value.expired {
      color: #f44336;
    }

    .terms-section {
      padding: 16px 0;
    }

    .terms-section h4 {
      margin: 0 0 8px 0;
      color: rgba(0,0,0,0.6);
    }

    .terms-section p {
      margin: 0;
      padding: 12px;
      background: rgba(0,0,0,0.04);
      border-radius: 4px;
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

    .total-row {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: rgba(0,0,0,0.04);
      border-radius: 4px;
      margin-top: 16px;
      font-size: 18px;
    }

    .total-value {
      font-weight: 600;
      color: #1a3458;
      font-size: 24px;
    }

    .actions-card {
      background: #fff3e0;
    }

    .actions-card h3 {
      margin: 0 0 8px 0;
    }

    .actions-card p {
      margin: 0 0 16px 0;
      color: rgba(0,0,0,0.7);
    }

    .action-buttons {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
    }

    .success-card {
      background: #e8f5e9;
      text-align: center;
    }

    .success-card mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #4caf50;
    }

    .success-card h3 {
      margin: 8px 0;
      color: #2e7d32;
    }

    .rejected-card {
      background: #ffebee;
      text-align: center;
    }

    .rejected-card mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #f44336;
    }

    .rejected-card h3 {
      margin: 8px 0;
      color: #c62828;
    }
  `]
})
export class ClientQuoteDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private quoteService = inject(ClientQuoteService);
  private notification = inject(NotificationService);

  quote = signal<Quote | null>(null);
  isLoading = signal(false);
  isProcessing = signal(false);
  quoteId = 0;

  displayedColumns = ['equipment', 'quantity', 'unitPrice', 'subtotal'];

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
        this.router.navigate(['/client/quotes']);
      }
    });
  }

  isExpired(): boolean {
    const quote = this.quote();
    if (!quote) return false;
    return new Date(quote.validUntil) < new Date();
  }

  acceptQuote(): void {
    this.notification.confirm('¿Está seguro de aceptar esta cotización? Se generará un contrato.').then((confirmed) => {
      if (confirmed) {
        this.isProcessing.set(true);
        this.quoteService.acceptQuote(this.quoteId).subscribe({
          next: () => {
            this.notification.success('Cotización aceptada exitosamente');
            this.loadQuote();
            this.isProcessing.set(false);
          },
          error: () => {
            this.isProcessing.set(false);
            this.notification.error('Error al aceptar la cotización');
          }
        });
      }
    });
  }

  rejectQuote(): void {
    this.notification.confirm('¿Está seguro de rechazar esta cotización?').then((confirmed) => {
      if (confirmed) {
        this.isProcessing.set(true);
        this.quoteService.rejectQuote(this.quoteId, { reason: 'Rechazada por el cliente' }).subscribe({
          next: () => {
            this.notification.success('Cotización rechazada');
            this.loadQuote();
            this.isProcessing.set(false);
          },
          error: () => {
            this.isProcessing.set(false);
            this.notification.error('Error al rechazar la cotización');
          }
        });
      }
    });
  }
}
