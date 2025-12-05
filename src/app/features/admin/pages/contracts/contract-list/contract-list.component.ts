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
import { ContractService } from '../services/contract.service';
import { Contract } from '../models/contract.model';
import { ContractStatus } from '../../../../../shared/models/base.model';

@Component({
  selector: 'app-admin-contract-list',
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
      title="contracts.management"
      subtitle="contracts.managementSubtitle"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/admin/dashboard' },
        { label: 'menu.contracts' }
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
        } @else if (contracts().length === 0) {
          <app-empty-state
            icon="description"
            [title]="'contracts.noContracts' | translate"
            [message]="'contracts.noContractsMessage' | translate">
          </app-empty-state>
        } @else {
          <table mat-table [dataSource]="contracts()" class="full-width">
            <ng-container matColumnDef="contractNumber">
              <th mat-header-cell *matHeaderCellDef>{{ 'contracts.contractNumber' | translate }}</th>
              <td mat-cell *matCellDef="let contract">{{ contract.contractNumber }}</td>
            </ng-container>

            <ng-container matColumnDef="client">
              <th mat-header-cell *matHeaderCellDef>{{ 'contracts.client' | translate }}</th>
              <td mat-cell *matCellDef="let contract">
                <div class="client-info">
                  <span class="client-name">{{ contract.userName }}</span>
                  @if (contract.userCompany) {
                    <span class="client-company">{{ contract.userCompany }}</span>
                  }
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="items">
              <th mat-header-cell *matHeaderCellDef>{{ 'contracts.items' | translate }}</th>
              <td mat-cell *matCellDef="let contract">{{ contract.items?.length || 0 }} equipos</td>
            </ng-container>

            <ng-container matColumnDef="totalMonthly">
              <th mat-header-cell *matHeaderCellDef>{{ 'contracts.monthlyTotal' | translate }}</th>
              <td mat-cell *matCellDef="let contract" class="amount">{{ contract.totalMonthly | currencyFormat }}</td>
            </ng-container>

            <ng-container matColumnDef="startDate">
              <th mat-header-cell *matHeaderCellDef>{{ 'contracts.startDate' | translate }}</th>
              <td mat-cell *matCellDef="let contract">{{ contract.startDate | date:'dd/MM/yyyy' }}</td>
            </ng-container>

            <ng-container matColumnDef="endDate">
              <th mat-header-cell *matHeaderCellDef>{{ 'contracts.endDate' | translate }}</th>
              <td mat-cell *matCellDef="let contract" [class.expiring]="isExpiringSoon(contract)">
                {{ contract.endDate | date:'dd/MM/yyyy' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>{{ 'common.status' | translate }}</th>
              <td mat-cell *matCellDef="let contract">
                <app-status-badge [status]="contract.status"></app-status-badge>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>{{ 'common.actions' | translate }}</th>
              <td mat-cell *matCellDef="let contract">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item [routerLink]="['/admin/contracts', contract.id]">
                    <mat-icon>visibility</mat-icon>
                    <span>{{ 'common.view' | translate }}</span>
                  </button>
                  @if (contract.status === 'ACTIVE') {
                    <button mat-menu-item (click)="cancelContract(contract)">
                      <mat-icon color="warn">cancel</mat-icon>
                      <span>{{ 'contracts.cancel' | translate }}</span>
                    </button>
                  }
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                [class.active-row]="row.status === 'ACTIVE'"
                [class.pending-row]="row.status === 'PENDING'"></tr>
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

    .expiring {
      color: #ff9800;
    }

    .active-row {
      background-color: #e8f5e9;
    }

    .pending-row {
      background-color: #fff8e1;
    }

    table {
      margin-bottom: 16px;
    }
  `]
})
export class AdminContractListComponent implements OnInit {
  private contractService = inject(ContractService);
  private notification = inject(NotificationService);

  contracts = signal<Contract[]>([]);
  isLoading = signal(false);
  totalElements = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);

  statusFilter = '';
  statuses = Object.values(ContractStatus);

  displayedColumns = ['contractNumber', 'client', 'items', 'totalMonthly', 'startDate', 'endDate', 'status', 'actions'];

  ngOnInit(): void {
    this.loadContracts();
  }

  loadContracts(): void {
    this.isLoading.set(true);

    this.contractService.getContracts({
      page: this.pageIndex(),
      size: this.pageSize(),
      status: this.statusFilter || undefined
    }).subscribe({
      next: (page) => {
        this.contracts.set(page.content);
        this.totalElements.set(page.totalElements);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.error('Error al cargar los contratos');
      }
    });
  }

  search(): void {
    this.pageIndex.set(0);
    this.loadContracts();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadContracts();
  }

  isExpiringSoon(contract: Contract): boolean {
    if (contract.status !== 'ACTIVE') return false;
    const endDate = new Date(contract.endDate);
    const today = new Date();
    const daysUntilEnd = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilEnd <= 30 && daysUntilEnd > 0;
  }

  async cancelContract(contract: Contract): Promise<void> {
    const confirmed = await this.notification.confirm(
      `¿Está seguro de cancelar el contrato ${contract.contractNumber}? Esta acción no se puede deshacer.`
    );

    if (confirmed) {
      this.contractService.cancelContract(contract.id).subscribe({
        next: () => {
          this.notification.success('Contrato cancelado');
          this.loadContracts();
        },
        error: () => {
          this.notification.error('Error al cancelar el contrato');
        }
      });
    }
  }
}
