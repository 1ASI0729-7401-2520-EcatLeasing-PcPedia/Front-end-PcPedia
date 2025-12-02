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
import { NotificationService } from '../../../../../core/services/notification.service';
import { ClientRequestService } from '../services/client-request.service';
import { Request } from '../models/request.model';

@Component({
  selector: 'app-client-request-detail',
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
    StatusBadgeComponent
  ],
  template: `
    <app-page-header
      title="requests.requestDetail"
      [subtitle]="'Solicitud #' + requestId"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/client/dashboard' },
        { label: 'menu.requests', route: '/client/requests' },
        { label: 'requests.detail' }
      ]">
      <button mat-button routerLink="/client/requests">
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
                <span class="label">{{ 'requests.duration' | translate }}</span>
                <span class="value">{{ request()!.durationMonths }} {{ 'common.months' | translate }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ 'common.createdAt' | translate }}</span>
                <span class="value">{{ request()!.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
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
                  {{ item.equipmentName || 'Equipo #' + item.equipmentId }}
                </td>
              </ng-container>

              <ng-container matColumnDef="brand">
                <th mat-header-cell *matHeaderCellDef>{{ 'inventory.brand' | translate }}</th>
                <td mat-cell *matCellDef="let item">{{ item.equipmentBrand || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="model">
                <th mat-header-cell *matHeaderCellDef>{{ 'inventory.model' | translate }}</th>
                <td mat-cell *matCellDef="let item">{{ item.equipmentModel || '-' }}</td>
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
  `]
})
export class ClientRequestDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private requestService = inject(ClientRequestService);
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
        this.router.navigate(['/client/requests']);
      }
    });
  }
}
