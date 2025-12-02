import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { PageHeaderComponent } from '../../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../../../shared/components/ui/status-badge/status-badge.component';
import { NotificationService } from '../../../../../core/services/notification.service';
import { ClientTicketService } from '../services/client-ticket.service';
import { Ticket } from '../models/ticket.model';

@Component({
  selector: 'app-client-ticket-detail',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatChipsModule,
    TranslateModule,
    DatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent
  ],
  template: `
    <app-page-header
      title="tickets.ticketDetail"
      [subtitle]="'#' + ticketId"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/client/dashboard' },
        { label: 'menu.tickets', route: '/client/tickets' },
        { label: 'tickets.detail' }
      ]">
      <button mat-button routerLink="/client/tickets">
        <mat-icon>arrow_back</mat-icon>
        {{ 'common.back' | translate }}
      </button>
    </app-page-header>

    @if (isLoading()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (ticket()) {
      <div class="detail-container">
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ ticket()!.title }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="ticket-meta">
              <div class="meta-item">
                <span class="label">{{ 'common.status' | translate }}</span>
                <app-status-badge [status]="ticket()!.status"></app-status-badge>
              </div>
              <div class="meta-item">
                <span class="label">{{ 'tickets.priority' | translate }}</span>
                <mat-chip [class]="'priority-' + ticket()!.priority.toLowerCase()">
                  {{ 'priority.' + ticket()!.priority | translate }}
                </mat-chip>
              </div>
              <div class="meta-item">
                <span class="label">{{ 'common.createdAt' | translate }}</span>
                <span>{{ ticket()!.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              @if (ticket()!.resolvedAt) {
                <div class="meta-item">
                  <span class="label">{{ 'tickets.resolvedAt' | translate }}</span>
                  <span>{{ ticket()!.resolvedAt | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
              }
            </div>

            @if (ticket()!.equipmentName) {
              <div class="equipment-info">
                <mat-icon>computer</mat-icon>
                <span>{{ ticket()!.equipmentName }}</span>
              </div>
            }

            <mat-divider></mat-divider>

            <div class="description">
              <h4>{{ 'tickets.description' | translate }}</h4>
              <p>{{ ticket()!.description }}</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ 'tickets.comments' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="comments-list">
              @if (ticket()!.comments && ticket()!.comments.length > 0) {
                @for (comment of ticket()!.comments; track comment.id) {
                  <div class="comment">
                    <div class="comment-header">
                      <strong>{{ comment.userName || 'Usuario' }}</strong>
                      <span class="comment-date">{{ comment.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                    </div>
                    <p class="comment-content">{{ comment.content }}</p>
                  </div>
                }
              } @else {
                <p class="no-comments">{{ 'tickets.noComments' | translate }}</p>
              }
            </div>

            @if (ticket()!.status !== 'CLOSED') {
              <mat-divider></mat-divider>
              <form [formGroup]="commentForm" (ngSubmit)="addComment()" class="comment-form">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>{{ 'tickets.addComment' | translate }}</mat-label>
                  <textarea matInput formControlName="content" rows="3"></textarea>
                </mat-form-field>
                <button mat-raised-button color="primary" type="submit"
                        [disabled]="commentForm.invalid || isSubmitting()">
                  <mat-icon>send</mat-icon>
                  {{ 'common.send' | translate }}
                </button>
              </form>
            }
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

    .ticket-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      padding: 16px 0;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .label {
      font-size: 12px;
      color: rgba(0,0,0,0.6);
      text-transform: uppercase;
    }

    .equipment-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: rgba(0,0,0,0.04);
      border-radius: 4px;
      margin-bottom: 16px;
    }

    .equipment-info .serial {
      color: rgba(0,0,0,0.6);
    }

    .description {
      padding: 16px 0;
    }

    .description h4 {
      margin: 0 0 8px 0;
      color: rgba(0,0,0,0.6);
    }

    .description p {
      margin: 0;
      white-space: pre-wrap;
    }

    .comments-list {
      padding: 16px 0;
    }

    .comment {
      padding: 12px;
      background: rgba(0,0,0,0.04);
      border-radius: 4px;
      margin-bottom: 12px;
    }

    .comment-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .comment-date {
      font-size: 12px;
      color: rgba(0,0,0,0.6);
    }

    .comment-content {
      margin: 0;
    }

    .no-comments {
      color: rgba(0,0,0,0.6);
      text-align: center;
      padding: 24px;
    }

    .comment-form {
      padding-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: flex-end;
    }

    .full-width {
      width: 100%;
    }

    .priority-low { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
    .priority-medium { background-color: #fff3e0 !important; color: #e65100 !important; }
    .priority-high { background-color: #ffebee !important; color: #c62828 !important; }
    .priority-urgent { background-color: #f44336 !important; color: white !important; }
  `]
})
export class ClientTicketDetailComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ticketService = inject(ClientTicketService);
  private notification = inject(NotificationService);

  ticket = signal<Ticket | null>(null);
  isLoading = signal(false);
  isSubmitting = signal(false);
  ticketId = 0;

  commentForm = this.fb.group({
    content: ['', Validators.required]
  });

  ngOnInit(): void {
    this.ticketId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTicket();
  }

  loadTicket(): void {
    this.isLoading.set(true);

    this.ticketService.getTicket(this.ticketId).subscribe({
      next: (ticket) => {
        this.ticket.set(ticket);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.error('Error al cargar el ticket');
        this.router.navigate(['/client/tickets']);
      }
    });
  }

  addComment(): void {
    if (this.commentForm.invalid) return;

    this.isSubmitting.set(true);
    const content = this.commentForm.get('content')?.value || '';

    this.ticketService.addComment(this.ticketId, { content }).subscribe({
      next: () => {
        this.notification.success('Comentario agregado');
        this.commentForm.reset();
        this.loadTicket();
        this.isSubmitting.set(false);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.notification.error('Error al agregar el comentario');
      }
    });
  }
}
