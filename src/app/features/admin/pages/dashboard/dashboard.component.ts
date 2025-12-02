import { Component, inject, signal, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { StatsCardsComponent } from './components/stats-cards/stats-cards.component';
import { EquipmentChartComponent } from './components/equipment-chart/equipment-chart.component';
import { TicketsChartComponent } from './components/revenue-chart/revenue-chart.component';
import { AdminDashboardService, AdminDashboard } from './services/admin-dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    RouterLink,
    TranslateModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    StatsCardsComponent,
    EquipmentChartComponent,
    TicketsChartComponent
  ],
  template: `
    <app-page-header
      title="dashboard.title"
      subtitle="dashboard.adminSubtitle">
      <button mat-raised-button color="primary" routerLink="/admin/users/new">
        <mat-icon>person_add</mat-icon>
        {{ 'users.newUser' | translate }}
      </button>
    </app-page-header>

    @if (isLoading()) {
      <app-loading-spinner message="Cargando dashboard..."></app-loading-spinner>
    } @else {
      <app-admin-stats-cards [data]="dashboardData()"></app-admin-stats-cards>

      <div class="charts-grid">
        <app-equipment-chart [data]="dashboardData()?.equipmentByStatus || null"></app-equipment-chart>
        <app-tickets-chart [data]="dashboardData()?.ticketsByPriority || null"></app-tickets-chart>
      </div>

      <div class="quick-actions">
        <h3>{{ 'dashboard.quickActions' | translate }}</h3>
        <div class="actions-grid">
          <button mat-stroked-button color="primary" routerLink="/admin/requests">
            <mat-icon>assignment</mat-icon>
            {{ 'dashboard.viewPendingRequests' | translate }}
          </button>
          <button mat-stroked-button color="primary" routerLink="/admin/tickets">
            <mat-icon>support_agent</mat-icon>
            {{ 'dashboard.viewOpenTickets' | translate }}
          </button>
          <button mat-stroked-button color="primary" routerLink="/admin/inventory/new">
            <mat-icon>add_box</mat-icon>
            {{ 'dashboard.addEquipment' | translate }}
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }

    .quick-actions {
      margin-top: 24px;
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

    @media (max-width: 900px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private dashboardService = inject(AdminDashboardService);

  isLoading = signal(true);
  dashboardData = signal<AdminDashboard | null>(null);

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
        // Set mock data for demo purposes
        this.dashboardData.set({
          totalClients: 50,
          activeContracts: 35,
          pendingRequests: 8,
          pendingQuotes: 5,
          openTickets: 12,
          monthlyRevenue: 45000.00,
          pendingPayments: 12500.00,
          equipmentByStatus: {
            AVAILABLE: 100,
            LEASED: 80,
            MAINTENANCE: 5,
            RETIRED: 10
          },
          ticketsByPriority: {
            LOW: 3,
            MEDIUM: 5,
            HIGH: 3,
            URGENT: 1
          }
        });
      }
    });
  }
}
