import { Component, Input } from '@angular/core';
import { CardStatComponent } from '../../../../../../shared/components/ui/card-stat/card-stat.component';
import { TranslateModule } from '@ngx-translate/core';
import { AdminDashboard } from '../../services/admin-dashboard.service';

@Component({
  selector: 'app-admin-stats-cards',
  standalone: true,
  imports: [CardStatComponent, TranslateModule],
  template: `
    <div class="stats-grid">
      <app-card-stat
        [label]="'dashboard.totalClients' | translate"
        [value]="data?.totalClients || 0"
        icon="people"
        iconBg="#1A3458"
        link="/admin/users">
      </app-card-stat>

      <app-card-stat
        [label]="'dashboard.activeContracts' | translate"
        [value]="data?.activeContracts || 0"
        icon="description"
        iconBg="#4caf50"
        link="/admin/contracts">
      </app-card-stat>

      <app-card-stat
        [label]="'dashboard.pendingRequests' | translate"
        [value]="data?.pendingRequests || 0"
        icon="assignment"
        iconBg="#ff9800"
        link="/admin/requests">
      </app-card-stat>

      <app-card-stat
        [label]="'dashboard.pendingQuotes' | translate"
        [value]="data?.pendingQuotes || 0"
        icon="request_quote"
        iconBg="#2196f3"
        link="/admin/quotes">
      </app-card-stat>

      <app-card-stat
        [label]="'dashboard.openTickets' | translate"
        [value]="data?.openTickets || 0"
        icon="support_agent"
        iconBg="#f44336"
        link="/admin/tickets">
      </app-card-stat>

      <app-card-stat
        [label]="'dashboard.monthlyRevenue' | translate"
        [value]="data?.monthlyRevenue || 0"
        icon="trending_up"
        iconBg="#9c27b0"
        [isCurrency]="true">
      </app-card-stat>

      <app-card-stat
        [label]="'dashboard.pendingPayments' | translate"
        [value]="data?.pendingPayments || 0"
        icon="account_balance_wallet"
        iconBg="#e91e63"
        link="/admin/invoices"
        [isCurrency]="true">
      </app-card-stat>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
  `]
})
export class StatsCardsComponent {
  @Input() data: AdminDashboard | null = null;
}
