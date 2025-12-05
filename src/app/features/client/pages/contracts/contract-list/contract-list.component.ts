import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { PageHeaderComponent } from '../../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../../shared/components/ui/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../../../../shared/components/ui/status-badge/status-badge.component';
import { CurrencyFormatPipe } from '../../../../../shared/pipes/currency-format.pipe';
import { NotificationService } from '../../../../../core/services/notification.service';
import { ClientContractService } from '../services/client-contract.service';
import { Contract } from '../models/contract.model';
import { ContractStatus } from '../../../../../shared/models/base.model';

@Component({
  selector: 'app-client-contract-list',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
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
      title="contracts.myContracts"
      subtitle="contracts.myContractsSubtitle"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/client/dashboard' },
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
          <div class="contract-cards">
            @for (contract of contracts(); track contract.id) {
              <mat-card class="contract-card" [routerLink]="['/client/contracts', contract.id]">
                <mat-card-header>
                  <mat-card-title>{{ contract.contractNumber }}</mat-card-title>
                  <mat-card-subtitle>
                    {{ contract.startDate | date:'dd/MM/yyyy' }} - {{ contract.endDate | date:'dd/MM/yyyy' }}
                  </mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="contract-info">
                    <div class="info-item">
                      <span class="label">{{ 'contracts.monthlyAmount' | translate }}:</span>
                      <span class="value price">{{ contract.monthlyAmount | currencyFormat }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">{{ 'contracts.equipments' | translate }}:</span>
                      <span class="value">{{ contract.items.length || 0 }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">{{ 'common.status' | translate }}:</span>
                      <app-status-badge [status]="contract.status"></app-status-badge>
                    </div>
                  </div>
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

    .contract-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .contract-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .contract-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .contract-info {
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
  `]
})
export class ClientContractListComponent implements OnInit {
  private contractService = inject(ClientContractService);
  private notification = inject(NotificationService);

  contracts = signal<Contract[]>([]);
  isLoading = signal(false);
  totalElements = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);

  statusFilter = '';
  statuses = Object.values(ContractStatus);

  ngOnInit(): void {
    this.loadContracts();
  }

  loadContracts(): void {
    this.isLoading.set(true);

    this.contractService.getMyContracts({
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
}
