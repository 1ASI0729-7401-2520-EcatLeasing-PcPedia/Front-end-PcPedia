import { Component, inject, signal, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { CardStatComponent } from '../../../../shared/components/ui/card-stat/card-stat.component';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';
import { ClientDashboardService, ClientDashboard } from './services/client-dashboard.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    RouterLink,
    TranslateModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    CardStatComponent,
    CurrencyFormatPipe,
    DateFormatPipe
  ],
  template: `
    <app-page-header
      title="dashboard.title"
      subtitle="dashboard.clientSubtitle">
    </app-page-header>

    @if (isLoading()) {
      <app-loading-spinner message="Cargando dashboard..."></app-loading-spinner>
    } @else {
      <div class="stats-grid">
        <app-card-stat
          [label]="'dashboard.activeContracts' | translate"
          [value]="dashboardData()?.activeContracts || 0"
          icon="description"
          iconBg="#4caf50"
          link="/client/contracts">
        </app-card-stat>

        <app-card-stat
          [label]="'dashboard.myEquipment' | translate"
          [value]="dashboardData()?.totalEquipment || 0"
          icon="devices"
          iconBg="#2196f3"
          link="/client/equipment">
        </app-card-stat>

        <app-card-stat
          [label]="'dashboard.pendingRequests' | translate"
          [value]="dashboardData()?.pendingRequests || 0"
          icon="assignment"
          iconBg="#ff9800"
          link="/client/requests">
        </app-card-stat>

        <app-card-stat
          [label]="'dashboard.pendingQuotes' | translate"
          [value]="dashboardData()?.pendingQuotes || 0"
          icon="request_quote"
          iconBg="#9c27b0"
          link="/client/quotes">
        </app-card-stat>

        <app-card-stat
          [label]="'dashboard.openTickets' | translate"
          [value]="dashboardData()?.openTickets || 0"
          icon="support_agent"
          iconBg="#f44336"
          link="/client/tickets">
        </app-card-stat>

        <app-card-stat
          [label]="'dashboard.pendingInvoices' | translate"
          [value]="dashboardData()?.pendingInvoices || 0"
          icon="receipt"
          iconBg="#e91e63"
          link="/client/invoices">
        </app-card-stat>
      </div>

      @if (dashboardData()?.nextPaymentDate) {
        <mat-card class="payment-card">
          <mat-card-header>
            <mat-card-title>{{ 'dashboard.nextPayment' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="payment-info">
              <div class="payment-detail">
                <mat-icon>event</mat-icon>
                <span>{{ dashboardData()?.nextPaymentDate | dateFormat }}</span>
              </div>
              <div class="payment-amount">
                {{ dashboardData()?.nextPaymentAmount | currencyFormat }}
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      }

      <div class="quick-actions">
        <h3>{{ 'dashboard.quickActions' | translate }}</h3>
        <div class="actions-grid">
          <button mat-raised-button color="primary" routerLink="/client/catalog">
            <mat-icon>storefront</mat-icon>
            {{ 'dashboard.viewCatalog' | translate }}
          </button>
          <button mat-stroked-button color="primary" routerLink="/client/requests/new">
            <mat-icon>add</mat-icon>
            {{ 'dashboard.newRequest' | translate }}
          </button>
          <button mat-stroked-button color="primary" routerLink="/client/tickets/new">
            <mat-icon>support_agent</mat-icon>
            {{ 'dashboard.newTicket' | translate }}
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .payment-card {
      margin-bottom: 24px;
    }

    .payment-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .payment-detail {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
    }

    .payment-amount {
      font-size: 24px;
      font-weight: 600;
      color: #1A3458;
    }

    .quick-actions h3 {
      color: #1A3458;
      margin-bottom: 16px;
    }

    .actions-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .actions-grid button {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class ClientDashboardComponent implements OnInit {
  private dashboardService = inject(ClientDashboardService);

  isLoading = signal(true);
  dashboardData = signal<ClientDashboard | null>(null);

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        // Set mock data for demo
        this.dashboardData.set({
          activeContracts: 2,
          totalEquipment: 15,
          pendingRequests: 1,
          pendingQuotes: 1,
          openTickets: 3,
          pendingInvoices: 1,
          nextPaymentDate: '2025-02-01',
          nextPaymentAmount: 2500.00
        });
      }
    });
  }
}
