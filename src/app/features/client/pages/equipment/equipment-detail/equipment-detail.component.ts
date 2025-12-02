import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { NotificationService } from '../../../../../core/services/notification.service';
import { MyEquipmentService } from '../services/my-equipment.service';
import { MyEquipment } from '../models/equipment.model';

@Component({
  selector: 'app-client-equipment-detail',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    TranslateModule,
    PageHeaderComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <app-page-header
      title="equipment.equipmentDetail"
      [subtitle]="equipment()?.name || ''"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/client/dashboard' },
        { label: 'menu.equipment', route: '/client/equipment' },
        { label: 'equipment.detail' }
      ]">
      <button mat-button routerLink="/client/equipment">
        <mat-icon>arrow_back</mat-icon>
        {{ 'common.back' | translate }}
      </button>
      <button mat-raised-button color="warn" [routerLink]="['/client/tickets/new']"
              [queryParams]="{equipmentId: equipmentId}">
        <mat-icon>report_problem</mat-icon>
        {{ 'equipment.reportIssue' | translate }}
      </button>
    </app-page-header>

    @if (isLoading()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (equipment()) {
      <div class="detail-container">
        <mat-card>
          <mat-card-content>
            <div class="equipment-detail">
              <div class="equipment-image">
                @if (equipment()!.imageUrl) {
                  <img [src]="equipment()!.imageUrl" [alt]="equipment()!.name">
                } @else {
                  <mat-icon>computer</mat-icon>
                }
              </div>

              <div class="equipment-info">
                <h2>{{ equipment()!.name }}</h2>

                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">{{ 'inventory.brand' | translate }}</span>
                    <span class="value">{{ equipment()!.brand || '-' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">{{ 'inventory.model' | translate }}</span>
                    <span class="value">{{ equipment()!.model || '-' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">{{ 'inventory.serialNumber' | translate }}</span>
                    <span class="value">{{ equipment()!.serialNumber || '-' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">{{ 'inventory.category' | translate }}</span>
                    <span class="value">{{ 'category.' + equipment()!.category | translate }}</span>
                  </div>
                  @if (equipment()!.contractNumber) {
                    <div class="info-item">
                      <span class="label">{{ 'contracts.contractNumber' | translate }}</span>
                      <span class="value">{{ equipment()!.contractNumber }}</span>
                    </div>
                  }
                </div>

                @if (equipment()!.specifications) {
                  <mat-divider></mat-divider>
                  <div class="specs-section">
                    <h4>{{ 'inventory.specifications' | translate }}</h4>
                    <p>{{ equipment()!.specifications }}</p>
                  </div>
                }
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    }
  `,
  styles: [`
    .detail-container {
      max-width: 900px;
    }

    .equipment-detail {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 24px;
    }

    @media (max-width: 768px) {
      .equipment-detail {
        grid-template-columns: 1fr;
      }
    }

    .equipment-image {
      height: 250px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .equipment-image img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .equipment-image mat-icon {
      font-size: 100px;
      width: 100px;
      height: 100px;
      color: rgba(0,0,0,0.3);
    }

    .equipment-info h2 {
      margin: 0 0 16px 0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
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

    .specs-section {
      padding-top: 16px;
    }

    .specs-section h4 {
      margin: 0 0 8px 0;
      color: rgba(0,0,0,0.6);
    }

    .specs-section p {
      margin: 0;
      padding: 12px;
      background: rgba(0,0,0,0.04);
      border-radius: 4px;
      white-space: pre-wrap;
    }
  `]
})
export class ClientEquipmentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private equipmentService = inject(MyEquipmentService);
  private notification = inject(NotificationService);

  equipment = signal<MyEquipment | null>(null);
  isLoading = signal(false);
  equipmentId = 0;

  ngOnInit(): void {
    this.equipmentId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadEquipment();
  }

  loadEquipment(): void {
    this.isLoading.set(true);

    this.equipmentService.getEquipment(this.equipmentId).subscribe({
      next: (equipment) => {
        this.equipment.set(equipment);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.error('Error al cargar el equipo');
        this.router.navigate(['/client/equipment']);
      }
    });
  }
}
