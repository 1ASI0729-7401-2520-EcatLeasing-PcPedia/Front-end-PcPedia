import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
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
import { NotificationService } from '../../../../../core/services/notification.service';
import { ClientRequestService } from '../services/client-request.service';
import { Request } from '../models/request.model';
import { RequestStatus } from '../../../../../shared/models/base.model';

@Component({
  selector: 'app-client-request-list',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatPaginatorModule,
    FormsModule,
    TranslateModule,
    DatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    StatusBadgeComponent
  ],
  template: `
    <app-page-header
      title="requests.myRequests"
      subtitle="requests.myRequestsSubtitle"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/client/dashboard' },
        { label: 'menu.requests' }
      ]">
      <button mat-raised-button color="primary" routerLink="/client/requests/new">
        <mat-icon>add</mat-icon>
        {{ 'requests.newRequest' | translate }}
      </button>
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
        } @else if (requests().length === 0) {
          <app-empty-state
            icon="description"
            [title]="'requests.noRequests' | translate"
            [message]="'requests.noRequestsMessage' | translate">
            <button mat-raised-button color="primary" routerLink="/client/requests/new">
              {{ 'requests.newRequest' | translate }}
            </button>
          </app-empty-state>
        } @else {
          <div class="request-cards">
            @for (request of requests(); track request.id) {
              <mat-card class="request-card" [routerLink]="['/client/requests', request.id]">
                <mat-card-header>
                  <mat-card-title>Solicitud #{{ request.id }}</mat-card-title>
                  <mat-card-subtitle>{{ request.createdAt | date:'dd/MM/yyyy HH:mm' }}</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="request-info">
                    <div class="info-item">
                      <span class="label">{{ 'requests.duration' | translate }}:</span>
                      <span class="value">{{ request.durationMonths }} {{ 'common.months' | translate }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">{{ 'requests.items' | translate }}:</span>
                      <span class="value">{{ request.items.length || 0 }} {{ 'common.equipments' | translate }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">{{ 'common.status' | translate }}:</span>
                      <app-status-badge [status]="request.status"></app-status-badge>
                    </div>
                  </div>
                  @if (request.notes) {
                    <p class="notes">{{ request.notes }}</p>
                  }
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

    .request-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .request-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .request-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .request-info {
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

    .notes {
      margin-top: 12px;
      padding: 8px;
      background: rgba(0,0,0,0.04);
      border-radius: 4px;
      font-size: 14px;
      color: rgba(0,0,0,0.7);
    }
  `]
})
export class ClientRequestListComponent implements OnInit {
  private requestService = inject(ClientRequestService);
  private notification = inject(NotificationService);

  requests = signal<Request[]>([]);
  isLoading = signal(false);
  totalElements = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);

  statusFilter = '';
  statuses = Object.values(RequestStatus);

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading.set(true);

    this.requestService.getMyRequests({
      page: this.pageIndex(),
      size: this.pageSize(),
      status: this.statusFilter || undefined
    }).subscribe({
      next: (page) => {
        this.requests.set(page.content);
        this.totalElements.set(page.totalElements);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.error('Error al cargar las solicitudes');
      }
    });
  }

  search(): void {
    this.pageIndex.set(0);
    this.loadRequests();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadRequests();
  }
}
