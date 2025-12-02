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
import { ContractService } from '../services/contract.service';
import { Contract } from '../models/contract.model';

@Component({
  selector: 'app-admin-contract-detail',
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
      title="contracts.contractDetail"
      [subtitle]="contract()?.contractNumber || ''"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/admin/dashboard' },
        { label: 'menu.contracts', route: '/admin/contracts' },
        { label: 'contracts.detail' }
      ]">
      <button mat-button routerLink="/admin/contracts">
        <mat-icon>arrow_back</mat-icon>
        {{ 'common.back' | translate }}
      </button>
      @if (contract()?.status === 'ACTIVE') {
        <button mat-raised-button color="warn" (click)="cancelContract()">
          <mat-icon>cancel</mat-icon>
          {{ 'contracts.cancel' | translate }}
        </button>
      }
    </app-page-header>

    @if (isLoading()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (contract()) {
      <div class="detail-container">
        <div class="main-content">
          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ 'contracts.information' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">{{ 'contracts.contractNumber' | translate }}</span>
                  <span class="value">{{ contract()!.contractNumber }}</span>
                </div>
                <div class="info-item">
                  <span class="label">{{ 'common.status' | translate }}</span>
                  <app-status-badge [status]="contract()!.status"></app-status-badge>
                </div>
                <div class="info-item">
                  <span class="label">{{ 'contracts.duration' | translate }}</span>
                  <span class="value">{{ contract()!.durationMonths }} meses</span>
                </div>
                <div class="info-item">
                  <span class="label">{{ 'contracts.startDate' | translate }}</span>
                  <span class="value">{{ contract()!.startDate | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">{{ 'contracts.endDate' | translate }}</span>
                  <span class="value" [class.expiring]="isExpiringSoon()">
                    {{ contract()!.endDate | date:'dd/MM/yyyy' }}
                  </span>
                </div>
                @if (contract()!.signedAt) {
                  <div class="info-item">
                    <span class="label">{{ 'contracts.signedAt' | translate }}</span>
                    <span class="value">{{ contract()!.signedAt | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ 'contracts.client' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">{{ 'users.name' | translate }}</span>
                  <span class="value">{{ contract()!.userName }}</span>
                </div>
                @if (contract()!.userCompany) {
                  <div class="info-item">
                    <span class="label">{{ 'users.company' | translate }}</span>
                    <span class="value">{{ contract()!.userCompany }}</span>
                  </div>
                }
                @if (contract()!.userEmail) {
                  <div class="info-item">
                    <span class="label">{{ 'users.email' | translate }}</span>
                    <span class="value">{{ contract()!.userEmail }}</span>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ 'contracts.equipments' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table mat-table [dataSource]="contract()!.items" class="full-width">
                <ng-container matColumnDef="equipment">
                  <th mat-header-cell *matHeaderCellDef>{{ 'contracts.equipment' | translate }}</th>
                  <td mat-cell *matCellDef="let item">
                    <div class="equipment-info">
                      <span class="equipment-name">{{ item.equipmentName }}</span>
                      @if (item.equipmentBrand || item.equipmentModel) {
                        <span class="equipment-detail">{{ item.equipmentBrand }} {{ item.equipmentModel }}</span>
                      }
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="serialNumber">
                  <th mat-header-cell *matHeaderCellDef>{{ 'contracts.serialNumber' | translate }}</th>
                  <td mat-cell *matCellDef="let item">{{ item.serialNumber || '-' }}</td>
                </ng-container>

                <ng-container matColumnDef="quantity">
                  <th mat-header-cell *matHeaderCellDef>{{ 'contracts.quantity' | translate }}</th>
                  <td mat-cell *matCellDef="let item">{{ item.quantity }}</td>
                </ng-container>

                <ng-container matColumnDef="monthlyPrice">
                  <th mat-header-cell *matHeaderCellDef>{{ 'contracts.monthlyPrice' | translate }}</th>
                  <td mat-cell *matCellDef="let item">{{ item.monthlyPrice | currencyFormat }}</td>
                </ng-container>

                <ng-container matColumnDef="subtotal">
                  <th mat-header-cell *matHeaderCellDef>{{ 'contracts.subtotal' | translate }}</th>
                  <td mat-cell *matCellDef="let item" class="amount">{{ item.subtotal | currencyFormat }}</td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="itemColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: itemColumns;"></tr>
              </table>
            </mat-card-content>
          </mat-card>

          @if (contract()!.terminatedAt) {
            <mat-card class="terminated-card">
              <mat-card-header>
                <mat-card-title>{{ 'contracts.terminationInfo' | translate }}</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">{{ 'contracts.terminatedAt' | translate }}</span>
                    <span class="value">{{ contract()!.terminatedAt | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                  @if (contract()!.terminationReason) {
                    <div class="info-item">
                      <span class="label">{{ 'contracts.terminationReason' | translate }}</span>
                      <span class="value">{{ contract()!.terminationReason }}</span>
                    </div>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>

        <div class="sidebar">
          <mat-card class="totals-card">
            <mat-card-header>
              <mat-card-title>{{ 'contracts.summary' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="totals">
                <div class="total-row">
                  <span>{{ 'contracts.monthlyTotal' | translate }}</span>
                  <span class="amount">{{ contract()!.totalMonthly | currencyFormat }}</span>
                </div>
                <div class="total-row">
                  <span>{{ 'contracts.duration' | translate }}</span>
                  <span>{{ contract()!.durationMonths }} meses</span>
                </div>
                <mat-divider></mat-divider>
                <div class="total-row grand-total">
                  <span>{{ 'contracts.totalAmount' | translate }}</span>
                  <span class="amount">{{ contract()!.totalAmount | currencyFormat }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          @if (contract()!.status === 'ACTIVE') {
            <mat-card class="active-card">
              <mat-card-content>
                <mat-icon>verified</mat-icon>
                <h3>{{ 'contracts.active' | translate }}</h3>
                <p>{{ 'contracts.daysRemaining' | translate }}: {{ getDaysRemaining() }}</p>
                <button mat-stroked-button
                        [routerLink]="['/admin/invoices/new']"
                        [queryParams]="{ contractId: contract()!.id }">
                  <mat-icon>receipt</mat-icon>
                  {{ 'contracts.generateInvoice' | translate }}
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

    .expiring {
      color: #ff9800;
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

    .terminated-card {
      background: #ffebee;
    }

    .active-card {
      background: #e8f5e9;
      text-align: center;
    }

    .active-card mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #4caf50;
    }

    .active-card h3 {
      margin: 8px 0;
      color: #2e7d32;
    }

    .active-card button {
      margin-top: 16px;
    }

    @media (max-width: 1024px) {
      .detail-container {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminContractDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private contractService = inject(ContractService);
  private notification = inject(NotificationService);

  contract = signal<Contract | null>(null);
  isLoading = signal(false);
  contractId = 0;

  itemColumns = ['equipment', 'serialNumber', 'quantity', 'monthlyPrice', 'subtotal'];

  ngOnInit(): void {
    this.contractId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadContract();
  }

  loadContract(): void {
    this.isLoading.set(true);

    this.contractService.getContract(this.contractId).subscribe({
      next: (contract) => {
        this.contract.set(contract);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.error('Error al cargar el contrato');
        this.router.navigate(['/admin/contracts']);
      }
    });
  }

  isExpiringSoon(): boolean {
    const contract = this.contract();
    if (!contract || contract.status !== 'ACTIVE') return false;
    const daysRemaining = this.getDaysRemaining();
    return daysRemaining <= 30 && daysRemaining > 0;
  }

  getDaysRemaining(): number {
    const contract = this.contract();
    if (!contract) return 0;
    const endDate = new Date(contract.endDate);
    const today = new Date();
    return Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  async cancelContract(): Promise<void> {
    const contract = this.contract();
    if (!contract) return;

    const confirmed = await this.notification.confirm(
      `¿Está seguro de cancelar el contrato ${contract.contractNumber}? Esta acción no se puede deshacer.`
    );

    if (confirmed) {
      this.contractService.cancelContract(contract.id).subscribe({
        next: (updated: Contract) => {
          this.contract.set(updated);
          this.notification.success('Contrato cancelado');
        },
        error: () => {
          this.notification.error('Error al cancelar el contrato');
        }
      });
    }
  }
}
