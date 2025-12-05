import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { PageHeaderComponent } from '../../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../../../shared/components/ui/status-badge/status-badge.component';
import { CurrencyFormatPipe } from '../../../../../shared/pipes/currency-format.pipe';
import { NotificationService } from '../../../../../core/services/notification.service';
import { ClientContractService } from '../services/client-contract.service';
import { Contract } from '../models/contract.model';

@Component({
  selector: 'app-client-contract-detail',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDividerModule,
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
        { label: 'menu.dashboard', route: '/client/dashboard' },
        { label: 'menu.contracts', route: '/client/contracts' },
        { label: 'contracts.detail' }
      ]">
      <button mat-button routerLink="/client/contracts">
        <mat-icon>arrow_back</mat-icon>
        {{ 'common.back' | translate }}
      </button>
      <button mat-raised-button color="primary" (click)="downloadPdf()">
        <mat-icon>download</mat-icon>
        {{ 'contracts.downloadPdf' | translate }}
      </button>
    </app-page-header>

    @if (isLoading()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (contract()) {
      <div class="detail-container">
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
                <span class="label">{{ 'contracts.startDate' | translate }}</span>
                <span class="value">{{ contract()!.startDate | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ 'contracts.endDate' | translate }}</span>
                <span class="value">{{ contract()!.endDate | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ 'contracts.monthlyAmount' | translate }}</span>
                <span class="value price">{{ contract()!.monthlyAmount | currencyFormat }}</span>
              </div>
            </div>

            @if (contract()!.terms) {
              <mat-divider></mat-divider>
              <div class="terms-section">
                <h4>{{ 'contracts.terms' | translate }}</h4>
                <p>{{ contract()!.terms }}</p>
              </div>
            }
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ 'contracts.assignedEquipment' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="contract()!.items" class="full-width">
              <ng-container matColumnDef="equipment">
                <th mat-header-cell *matHeaderCellDef>{{ 'common.equipment' | translate }}</th>
                <td mat-cell *matCellDef="let item">
                  {{ item.equipment?.name || 'Equipo #' + item.equipmentId }}
                </td>
              </ng-container>

              <ng-container matColumnDef="serial">
                <th mat-header-cell *matHeaderCellDef>{{ 'inventory.serialNumber' | translate }}</th>
                <td mat-cell *matCellDef="let item">{{ item.equipment?.serialNumber || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="monthlyPrice">
                <th mat-header-cell *matHeaderCellDef>{{ 'contracts.monthlyPrice' | translate }}</th>
                <td mat-cell *matCellDef="let item">{{ item.monthlyPrice | currencyFormat }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </mat-card-content>
        </mat-card>
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
      white-space: pre-wrap;
    }

    .full-width {
      width: 100%;
    }
  `]
})
export class ClientContractDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private contractService = inject(ClientContractService);
  private notification = inject(NotificationService);

  contract = signal<Contract | null>(null);
  isLoading = signal(false);
  contractId = 0;

  displayedColumns = ['equipment', 'serial', 'monthlyPrice'];

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
        this.router.navigate(['/client/contracts']);
      }
    });
  }

  downloadPdf(): void {
    this.contractService.downloadPdf(this.contractId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contrato-${this.contract()?.contractNumber}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.notification.error('Error al descargar el PDF');
      }
    });
  }
}
