import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../../shared/components/ui/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../../../../shared/components/ui/status-badge/status-badge.component';
import { DateFormatPipe } from '../../../../../shared/pipes/date-format.pipe';
import { NotificationService } from '../../../../../core/services/notification.service';
import { RequestService } from '../services/request.service';
import { Request } from '../models/request.model';
import { RequestStatus } from '../../../../../shared/models/base.model';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    MatMenuModule,
    FormsModule,
    TranslateModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
    DateFormatPipe
  ],
  template: `
    <app-page-header
      title="requests.title"
      subtitle="requests.subtitle"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/admin/dashboard' },
        { label: 'menu.requests' }
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
        } @else if (requests().length === 0) {
          <app-empty-state
            icon="assignment"
            [title]="'requests.noRequests' | translate"
            [message]="'requests.noRequestsMessage' | translate">
          </app-empty-state>
        } @else {
          <table mat-table [dataSource]="requests()" class="full-width">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let item">{{ item.id }}</td>
            </ng-container>

            <ng-container matColumnDef="client">
              <th mat-header-cell *matHeaderCellDef>{{ 'requests.client' | translate }}</th>
              <td mat-cell *matCellDef="let item">{{ item.userName }}</td>
            </ng-container>

            <ng-container matColumnDef="company">
              <th mat-header-cell *matHeaderCellDef>{{ 'users.company' | translate }}</th>
              <td mat-cell *matCellDef="let item">{{ item.companyName || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="items">
              <th mat-header-cell *matHeaderCellDef>{{ 'requests.items' | translate }}</th>
              <td mat-cell *matCellDef="let item">{{ item.items?.length || 0 }} equipos</td>
            </ng-container>

            <ng-container matColumnDef="duration">
              <th mat-header-cell *matHeaderCellDef>{{ 'requests.duration' | translate }}</th>
              <td mat-cell *matCellDef="let item">{{ item.durationMonths }} meses</td>
            </ng-container>

            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef>{{ 'common.date' | translate }}</th>
              <td mat-cell *matCellDef="let item">{{ item.createdAt | dateFormat }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>{{ 'common.status' | translate }}</th>
              <td mat-cell *matCellDef="let item">
                <app-status-badge [status]="item.status"></app-status-badge>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>{{ 'common.actions' | translate }}</th>
              <td mat-cell *matCellDef="let item">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item [routerLink]="['/admin/requests', item.id]">
                    <mat-icon>visibility</mat-icon>
                    <span>{{ 'common.view' | translate }}</span>
                  </button>
                  @if (item.status === 'PENDING') {
                    <button mat-menu-item [routerLink]="['/admin/quotes/new']" [queryParams]="{ requestId: item.id }">
                      <mat-icon>request_quote</mat-icon>
                      <span>{{ 'requests.createQuote' | translate }}</span>
                    </button>
                    <button mat-menu-item (click)="rejectRequest(item)">
                      <mat-icon color="warn">cancel</mat-icon>
                      <span>{{ 'requests.reject' | translate }}</span>
                    </button>
                  }
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                [class.highlight]="row.status === 'PENDING'"></tr>
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
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    tr.highlight {
      background-color: #fff3e0;
    }
  `]
})
export class RequestListComponent implements OnInit {
  private requestService = inject(RequestService);
  private notification = inject(NotificationService);

  requests = signal<Request[]>([]);
  isLoading = signal(false);
  totalElements = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);

  statusFilter = '';
  statuses = Object.values(RequestStatus);

  displayedColumns = ['id', 'client', 'company', 'items', 'duration', 'createdAt', 'status', 'actions'];

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading.set(true);

    this.requestService.getRequests({
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

  async rejectRequest(item: Request): Promise<void> {
    const confirmed = await this.notification.confirm(
      `¿Está seguro de rechazar la solicitud #${item.id}?`
    );

    if (confirmed) {
      this.requestService.rejectRequest(item.id, { reason: 'Rechazado por el administrador' }).subscribe({
        next: () => {
          this.notification.success('Solicitud rechazada');
          this.loadRequests();
        },
        error: () => {
          this.notification.error('Error al rechazar la solicitud');
        }
      });
    }
  }
}
