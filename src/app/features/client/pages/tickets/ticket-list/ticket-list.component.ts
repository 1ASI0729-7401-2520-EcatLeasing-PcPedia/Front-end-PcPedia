import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe, SlicePipe } from '@angular/common';
import { PageHeaderComponent } from '../../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../../shared/components/ui/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../../../../shared/components/ui/status-badge/status-badge.component';
import { NotificationService } from '../../../../../core/services/notification.service';
import { ClientTicketService } from '../services/client-ticket.service';
import { Ticket } from '../models/ticket.model';
import { TicketStatus, TicketPriority } from '../../../../../shared/models/base.model';

@Component({
  selector: 'app-client-ticket-list',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatPaginatorModule,
    MatChipsModule,
    FormsModule,
    TranslateModule,
    DatePipe,
    SlicePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    StatusBadgeComponent
  ],
  template: `
    <app-page-header
      title="tickets.myTickets"
      subtitle="tickets.myTicketsSubtitle"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/client/dashboard' },
        { label: 'menu.tickets' }
      ]">
      <button mat-raised-button color="primary" routerLink="/client/tickets/new">
        <mat-icon>add</mat-icon>
        {{ 'tickets.newTicket' | translate }}
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
        } @else if (tickets().length === 0) {
          <app-empty-state
            icon="support_agent"
            [title]="'tickets.noTickets' | translate"
            [message]="'tickets.noTicketsMessage' | translate">
            <button mat-raised-button color="primary" routerLink="/client/tickets/new">
              {{ 'tickets.newTicket' | translate }}
            </button>
          </app-empty-state>
        } @else {
          <div class="ticket-list">
            @for (ticket of tickets(); track ticket.id) {
              <mat-card class="ticket-card" [routerLink]="['/client/tickets', ticket.id]">
                <div class="ticket-header">
                  <div class="ticket-title">
                    <h3>#{{ ticket.id }} - {{ ticket.title }}</h3>
                    <span class="ticket-date">{{ ticket.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                  <div class="ticket-badges">
                    <mat-chip [class]="'priority-' + ticket.priority.toLowerCase()">
                      {{ 'priority.' + ticket.priority | translate }}
                    </mat-chip>
                    <app-status-badge [status]="ticket.status"></app-status-badge>
                  </div>
                </div>
                <p class="ticket-description">{{ ticket.description | slice:0:150 }}{{ ticket.description.length > 150 ? '...' : '' }}</p>
                @if (ticket.equipmentName) {
                  <p class="ticket-equipment">
                    <mat-icon>computer</mat-icon>
                    {{ ticket.equipmentName }}
                  </p>
                }
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

    .ticket-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;
    }

    .ticket-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      padding: 16px;
    }

    .ticket-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .ticket-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .ticket-title h3 {
      margin: 0;
      font-size: 16px;
    }

    .ticket-date {
      font-size: 12px;
      color: rgba(0,0,0,0.6);
    }

    .ticket-badges {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .ticket-description {
      margin: 8px 0;
      color: rgba(0,0,0,0.7);
      font-size: 14px;
    }

    .ticket-equipment {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      color: rgba(0,0,0,0.6);
      margin: 0;
    }

    .ticket-equipment mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .priority-low { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
    .priority-medium { background-color: #fff3e0 !important; color: #e65100 !important; }
    .priority-high { background-color: #ffebee !important; color: #c62828 !important; }
    .priority-urgent { background-color: #f44336 !important; color: white !important; }
  `]
})
export class ClientTicketListComponent implements OnInit {
  private ticketService = inject(ClientTicketService);
  private notification = inject(NotificationService);

  tickets = signal<Ticket[]>([]);
  isLoading = signal(false);
  totalElements = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);

  statusFilter = '';
  statuses = Object.values(TicketStatus);

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.isLoading.set(true);

    this.ticketService.getMyTickets({
      page: this.pageIndex(),
      size: this.pageSize(),
      status: this.statusFilter || undefined
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
}
