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
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { PageHeaderComponent } from '../../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../../shared/components/ui/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../../../../shared/components/ui/status-badge/status-badge.component';
import { NotificationService } from '../../../../../core/services/notification.service';
import { TicketService } from '../services/ticket.service';
import { Ticket } from '../models/ticket.model';
import { TicketStatus, TicketPriority } from '../../../../../shared/models/base.model';

@Component({
  selector: 'app-admin-ticket-list',
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
    MatChipsModule,
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
      title="tickets.management"
      subtitle="tickets.managementSubtitle"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/admin/dashboard' },
        { label: 'menu.tickets' }
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

          <mat-form-field appearance="outline">
            <mat-label>{{ 'tickets.priority' | translate }}</mat-label>
            <mat-select [(ngModel)]="priorityFilter" (selectionChange)="search()">
              <mat-option value="">{{ 'common.all' | translate }}</mat-option>
              @for (priority of priorities; track priority) {
                <mat-option [value]="priority">{{ 'priority.' + priority | translate }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        @if (isLoading()) {
          <app-loading-spinner></app-loading-spinner>
        } @else if (tickets().length === 0) {
          <app-empty-state
            icon="confirmation_number"
            [title]="'tickets.noTickets' | translate"
            [message]="'tickets.noTicketsMessage' | translate">
          </app-empty-state>
        } @else {
          <table mat-table [dataSource]="tickets()" class="full-width">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let ticket">#{{ ticket.id }}</td>
            </ng-container>

            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>{{ 'tickets.title' | translate }}</th>
              <td mat-cell *matCellDef="let ticket">
                <div class="ticket-title">
                  <span>{{ ticket.title }}</span>
                  @if (ticket.equipmentName) {
                    <span class="equipment-tag">{{ ticket.equipmentName }}</span>
                  }
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="client">
              <th mat-header-cell *matHeaderCellDef>{{ 'tickets.client' | translate }}</th>
              <td mat-cell *matCellDef="let ticket">
                <div class="client-info">
                  <span class="client-name">{{ ticket.userName }}</span>
                  @if (ticket.userCompany) {
                    <span class="client-company">{{ ticket.userCompany }}</span>
                  }
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="priority">
              <th mat-header-cell *matHeaderCellDef>{{ 'tickets.priority' | translate }}</th>
              <td mat-cell *matCellDef="let ticket">
                <span class="priority-badge" [class]="'priority-' + ticket.priority.toLowerCase()">
                  {{ 'priority.' + ticket.priority | translate }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="assignedTo">
              <th mat-header-cell *matHeaderCellDef>{{ 'tickets.assignedTo' | translate }}</th>
              <td mat-cell *matCellDef="let ticket">
                {{ ticket.assignedToName || '-' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef>{{ 'common.date' | translate }}</th>
              <td mat-cell *matCellDef="let ticket">{{ ticket.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>{{ 'common.status' | translate }}</th>
              <td mat-cell *matCellDef="let ticket">
                <app-status-badge [status]="ticket.status"></app-status-badge>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>{{ 'common.actions' | translate }}</th>
              <td mat-cell *matCellDef="let ticket">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item [routerLink]="['/admin/tickets', ticket.id]">
                    <mat-icon>visibility</mat-icon>
                    <span>{{ 'common.view' | translate }}</span>
                  </button>
                  @if (ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') {
                    <button mat-menu-item (click)="resolveTicket(ticket)">
                      <mat-icon>check</mat-icon>
                      <span>{{ 'tickets.resolve' | translate }}</span>
                    </button>
                  }
                  @if (ticket.status === 'RESOLVED') {
                    <button mat-menu-item (click)="closeTicket(ticket)">
                      <mat-icon>done_all</mat-icon>
                      <span>{{ 'tickets.close' | translate }}</span>
                    </button>
                  }
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                [class.high-priority]="row.priority === 'HIGH' || row.priority === 'URGENT'"
                [class.open-row]="row.status === 'OPEN'"></tr>
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

    .ticket-title {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .equipment-tag {
      font-size: 11px;
      background: #e3f2fd;
      color: #1565c0;
      padding: 2px 8px;
      border-radius: 12px;
      width: fit-content;
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

    .priority-badge {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }

    .priority-low {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .priority-medium {
      background: #fff3e0;
      color: #e65100;
    }

    .priority-high {
      background: #ffebee;
      color: #c62828;
    }

    .priority-urgent {
      background: #f44336;
      color: white;
    }

    .high-priority {
      background-color: #fff8e1;
    }

    .open-row {
      border-left: 4px solid #ff9800;
    }

    table {
      margin-bottom: 16px;
    }
  `]
})
export class AdminTicketListComponent implements OnInit {
  private ticketService = inject(TicketService);
  private notification = inject(NotificationService);

  tickets = signal<Ticket[]>([]);
  isLoading = signal(false);
  totalElements = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);

  statusFilter = '';
  priorityFilter = '';
  statuses = Object.values(TicketStatus);
  priorities = Object.values(TicketPriority);

  displayedColumns = ['id', 'title', 'client', 'priority', 'assignedTo', 'createdAt', 'status', 'actions'];

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.isLoading.set(true);

    this.ticketService.getTickets({
      page: this.pageIndex(),
      size: this.pageSize(),
      status: this.statusFilter || undefined,
      priority: this.priorityFilter || undefined
    }).subscribe({
      next: (page) => {
        this.tickets.set(page.content);
        this.totalElements.set(page.totalElements);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.error('Error al cargar los tickets');
      }
    });
  }

  search(): void {
    this.pageIndex.set(0);
    this.loadTickets();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadTickets();
  }

  async resolveTicket(ticket: Ticket): Promise<void> {
    const confirmed = await this.notification.confirm(
      `¿Marcar el ticket #${ticket.id} como resuelto?`
    );

    if (confirmed) {
      this.ticketService.resolveTicket(ticket.id).subscribe({
        next: () => {
          this.notification.success('Ticket marcado como resuelto');
          this.loadTickets();
        },
        error: () => {
          this.notification.error('Error al resolver el ticket');
        }
      });
    }
  }

  async closeTicket(ticket: Ticket): Promise<void> {
    const confirmed = await this.notification.confirm(
      `¿Cerrar el ticket #${ticket.id}?`
    );

    if (confirmed) {
      this.ticketService.closeTicket(ticket.id).subscribe({
        next: () => {
          this.notification.success('Ticket cerrado');
          this.loadTickets();
        },
        error: () => {
          this.notification.error('Error al cerrar el ticket');
        }
      });
    }
  }
}
