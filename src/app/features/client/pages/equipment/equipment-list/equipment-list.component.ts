import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../../shared/components/ui/empty-state/empty-state.component';
import { NotificationService } from '../../../../../core/services/notification.service';
import { MyEquipmentService } from '../services/my-equipment.service';
import { MyEquipment } from '../models/equipment.model';

@Component({
  selector: 'app-client-equipment-list',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent
  ],
  template: `
    <app-page-header
      title="equipment.myEquipment"
      subtitle="equipment.myEquipmentSubtitle"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/client/dashboard' },
        { label: 'menu.equipment' }
      ]">
    </app-page-header>

    <mat-card>
      <mat-card-content>
        @if (isLoading()) {
          <app-loading-spinner></app-loading-spinner>
        } @else if (equipments().length === 0) {
          <app-empty-state
            icon="devices"
            [title]="'equipment.noEquipment' | translate"
            [message]="'equipment.noEquipmentMessage' | translate">
          </app-empty-state>
        } @else {
          <div class="equipment-grid">
            @for (equipment of equipments(); track equipment.equipmentId) {
              <mat-card class="equipment-card">
                <div class="equipment-image">
                  @if (equipment.imageUrl) {
                    <img [src]="equipment.imageUrl" [alt]="equipment.name">
                  } @else {
                    <mat-icon>computer</mat-icon>
                  }
                </div>
                <mat-card-content>
                  <h3>{{ equipment.name }}</h3>
                  <p class="brand-model">
                    {{ equipment.brand }} {{ equipment.model }}
                  </p>
                  <p class="serial">
                    <strong>S/N:</strong> {{ equipment.serialNumber || '-' }}
                  </p>
                  <p class="category">
                    {{ 'category.' + equipment.category | translate }}
                  </p>
                  @if (equipment.contractNumber) {
                    <p class="contract">
                      <mat-icon>description</mat-icon>
                      {{ equipment.contractNumber }}
                    </p>
                  }
                </mat-card-content>
                <mat-card-actions>
                  <button mat-button color="primary" [routerLink]="['/client/equipment', equipment.equipmentId]">
                    <mat-icon>visibility</mat-icon>
                    {{ 'common.viewDetail' | translate }}
                  </button>
                  <button mat-button color="warn" [routerLink]="['/client/tickets/new']"
                          [queryParams]="{equipmentId: equipment.equipmentId}">
                    <mat-icon>report_problem</mat-icon>
                    {{ 'equipment.reportIssue' | translate }}
                  </button>
                </mat-card-actions>
              </mat-card>
            }
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .equipment-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .equipment-card {
      display: flex;
      flex-direction: column;
    }

    .equipment-image {
      height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      border-radius: 4px 4px 0 0;
    }

    .equipment-image img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .equipment-image mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: rgba(0,0,0,0.3);
    }

    mat-card-content h3 {
      margin: 8px 0 4px 0;
      font-size: 16px;
    }

    .brand-model {
      color: rgba(0,0,0,0.6);
      margin: 0 0 8px 0;
    }

    .serial, .category, .contract {
      font-size: 14px;
      margin: 4px 0;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .contract mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    mat-card-actions {
      margin-top: auto;
      padding: 8px;
    }
  `]
})
export class ClientEquipmentListComponent implements OnInit {
  private equipmentService = inject(MyEquipmentService);
  private notification = inject(NotificationService);

  equipments = signal<MyEquipment[]>([]);
  isLoading = signal(false);

  ngOnInit(): void {
    this.loadEquipment();
  }

  loadEquipment(): void {
    this.isLoading.set(true);

    this.equipmentService.getMyEquipment().subscribe({
      next: (equipments) => {
        this.equipments.set(equipments);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.error('Error al cargar los equipos');
      }
    });
  }
}
