import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../../../shared/components/ui/status-badge/status-badge.component';
import { DateFormatPipe } from '../../../../../shared/pipes/date-format.pipe';
import { NotificationService } from '../../../../../core/services/notification.service';
import { RequestService } from '../services/request.service';
import { Request, RequestItem } from '../models/request.model';

@Component({
  selector: 'app-admin-request-detail',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDividerModule,
    TranslateModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
    DateFormatPipe
  ],
  template: `
    <app-page-header
      title="requests.requestDetail"
      [subtitle]="'Solicitud #' + requestId"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/admin/dashboard' },
        { label: 'menu.requests', route: '/admin/requests' },
        { label: 'requests.detail' }
      ]">
      <button mat-button routerLink="/admin/requests">
        <mat-icon>arrow_back</mat-icon>
        {{ 'common.back' | translate }}
      </button>
    </app-page-header>

    @if (isLoading()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (request()) {
      <div class="detail-container">
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ 'requests.information' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">{{ 'common.status' | translate }}</span>
                <app-status-badge [status]="request()!.status"></app-status-badge>
              </div>
              <div class="info-item">
                <span class="label">{{ 'requests.client' | translate }}</span>
                <span class="value">{{ request()!.userName }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ 'users.company' | translate }}</span>
                <span class="value">{{ request()!.companyName || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ 'requests.duration' | translate }}</span>
                <span class="value">{{ request()!.durationMonths }} {{ 'common.months' | translate }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ 'common.createdAt' | translate }}</span>
                <span class="value">{{ request()!.createdAt | dateFormat }}</span>
              </div>
            </div>

            @if (request()!.notes) {
              <mat-divider></mat-divider>
              <div class="notes-section">
                <h4>{{ 'requests.notes' | translate }}</h4>
                <p>{{ request()!.notes }}</p>
              </div>
            }
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ 'requests.requestedEquipment' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="request()!.items" class="full-width">
              <ng-container matColumnDef="equipment">
                <th mat-header-cell *matHeaderCellDef>{{ 'common.equipment' | translate }}</th>
                <td mat-cell *matCellDef="let item">
                  {{ getItemName(item) }}
                </td>
              </ng-container>

              <ng-container matColumnDef="brand">
                <th mat-header-cell *matHeaderCellDef>{{ 'inventory.brand' | translate }}</th>
                <td mat-cell *matCellDef="let item">{{ getItemBrand(item) }}</td>
              </ng-container>

              <ng-container matColumnDef="model">
                <th mat-header-cell *matHeaderCellDef>{{ 'inventory.model' | translate }}</th>
                <td mat-cell *matCellDef="let item">{{ getItemModel(item) }}</td>
              </ng-container>

              <ng-container matColumnDef="quantity">
                <th mat-header-cell *matHeaderCellDef>{{ 'common.quantity' | translate }}</th>
                <td mat-cell *matCellDef="let item">{{ item.quantity }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </mat-card-content>
        </mat-card>

        @if (request()!.status === 'PENDING') {
          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ 'common.actions' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="actions">
                <button mat-raised-button color="primary" [routerLink]="['/admin/quotes/new']" [queryParams]="{ requestId: requestId }">
                  <mat-icon>request_quote</mat-icon>
                  {{ 'requests.createQuote' | translate }}
                </button>
                <button mat-raised-button color="warn" (click)="rejectRequest()">
                  <mat-icon>cancel</mat-icon>
                  {{ 'requests.reject' | translate }}
                </button>
              </div>
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

    .notes-section {
      padding: 16px 0;
    }

    .notes-section h4 {
      margin: 0 0 8px 0;
      color: rgba(0,0,0,0.6);
    }

    .notes-section p {
      margin: 0;
      padding: 12px;
      background: rgba(0,0,0,0.04);
      border-radius: 4px;
    }

    .full-width {
      width: 100%;
    }

    .actions {
      display: flex;
      gap: 12px;
      padding: 8px 0;
    }
  `]
})
export class AdminRequestDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private requestService = inject(RequestService);
  private notification = inject(NotificationService);

  request = signal<Request | null>(null);
  isLoading = signal(false);
  requestId = 0;

  displayedColumns = ['equipment', 'brand', 'model', 'quantity'];

  ngOnInit(): void {
    this.requestId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadRequest();
  }

  loadRequest(): void {
    this.isLoading.set(true);

    this.requestService.getRequest(this.requestId).subscribe({
      next: (request) => {
        this.request.set(request);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.error('Error al cargar la solicitud');
        this.router.navigate(['/admin/requests']);
      }
    });
  }

  async rejectRequest(): Promise<void> {
    const confirmed = await this.notification.confirm(
      `¿Está seguro de rechazar la solicitud #${this.requestId}?`
    );

    if (confirmed) {
      this.requestService.rejectRequest(this.requestId, { reason: 'Rechazado por el administrador' }).subscribe({
        next: () => {
          this.notification.success('Solicitud rechazada');
          this.router.navigate(['/admin/requests']);
        },
        error: () => {
          this.notification.error('Error al rechazar la solicitud');
        }
      });
    }
  }

  getItemName(item: RequestItem): string {
    if (item.equipmentName) return item.equipmentName;
    if (item.productModelName) return item.productModelName;
    if (item.productModel?.name) return item.productModel.name;

    const referenceId = item.equipmentId ?? item.productModelId;
    return referenceId ? `Equipo #${referenceId}` : 'Equipo';
  }

  getItemBrand(item: RequestItem): string {
    return item.equipmentBrand
      || item.productModelBrand
      || item.productModel?.brand
      || '-';
  }

  getItemModel(item: RequestItem): string {
    return item.equipmentModel
      || item.productModelModel
      || item.productModel?.model
      || '-';
  }
}
