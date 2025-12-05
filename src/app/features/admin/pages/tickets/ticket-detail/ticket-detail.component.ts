import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { PageHeaderComponent } from '../../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../../../shared/components/ui/status-badge/status-badge.component';
import { NotificationService } from '../../../../../core/services/notification.service';
import { TicketService } from '../services/ticket.service';
import { Ticket } from '../models/ticket.model';

@Component({
  selector: 'app-admin-ticket-detail',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
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
        { label: 'menu.dashboard', route: '/admin/dashboard' },
        { label: 'menu.tickets', route: '/admin/tickets' },
        { label: 'tickets.detail' }
      ]">
      <button mat-button routerLink="/admin/tickets">
        <mat-icon>arrow_back</mat-icon>
        {{ 'common.back' | translate }}
      </button>
      @if (ticket()?.status === 'OPEN' || ticket()?.status === 'IN_PROGRESS') {
        <button mat-raised-button color="primary" (click)="resolveTicket()">
          <mat-icon>check</mat-icon>
          {{ 'tickets.resolve' | translate }}
        </button>
      }
      @if (ticket()?.status === 'RESOLVED') {
        <button mat-raised-button color="primary" (click)="closeTicket()">
          <mat-icon>done_all</mat-icon>
          {{ 'tickets.close' | translate }}
        </button>
      }
    </app-page-header>

    @if (isLoading()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (ticket()) {
      <div class="detail-container">
        <div class="main-content">
          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ ticket()!.title }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="ticket-meta">
                <app-status-badge [status]="ticket()!.status"></app-status-badge>
                <span class="priority-badge" [class]="'priority-' + ticket()!.priority.toLowerCase()">
                  {{ 'priority.' + ticket()!.priority | translate }}
                </span>
                <span class="date">{{ ticket()!.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
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
              <div class="comments">
                @if (ticket()!.comments && ticket()!.comments!.length > 0) {
                  @for (comment of ticket()!.comments; track comment.id) {
                    <div class="comment" [class.admin-comment]="comment.userRole === 'ADMIN'">
                      <div class="comment-header">
                        <span class="author">{{ comment.userName }}</span>
                        <span class="role-badge" [class.admin]="comment.userRole === 'ADMIN'">
                          {{ comment.userRole === 'ADMIN' ? 'Admin' : 'Cliente' }}
                        </span>
                        <span class="time">{{ comment.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
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
                <form [formGroup]="commentForm" (ngSubmit)="sendComment()" class="comment-form">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'tickets.addComment' | translate }}</mat-label>
                    <textarea matInput formControlName="content" rows="3"></textarea>
                  </mat-form-field>
                  <button mat-raised-button color="primary" type="submit"
                          [disabled]="commentForm.invalid || isSending()">
                    @if (isSending()) {
                      <mat-icon class="spinning">sync</mat-icon>
                    } @else {
                      <mat-icon>send</mat-icon>
                    }
                    {{ 'common.send' | translate }}
                  </button>
                </form>
              }
            </mat-card-content>
          </mat-card>
        </div>

        <div class="sidebar">
          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ 'tickets.client' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="info-list">
                <div class="info-item">
                  <span class="label">{{ 'users.name' | translate }}</span>
                  <span class="value">{{ ticket()!.userName }}</span>
                </div>
                @if (ticket()!.companyName) {
                  <div class="info-item">
                    <span class="label">{{ 'users.company' | translate }}</span>
                    <span class="value">{{ ticket()!.companyName }}</span>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>

          @if (ticket()!.equipmentName) {
            <mat-card>
              <mat-card-header>
                <mat-card-title>{{ 'tickets.equipment' | translate }}</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="info-list">
                  <div class="info-item">
                    <span class="label">{{ 'equipment.name' | translate }}</span>
                    <span class="value">{{ ticket()!.equipmentName }}</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          }

          @if (ticket()!.resolvedAt) {
            <mat-card class="resolved-card">
              <mat-card-content>
                <mat-icon>check_circle</mat-icon>
                <h4>{{ 'tickets.resolved' | translate }}</h4>
                <p>{{ ticket()!.resolvedAt | date:'dd/MM/yyyy HH:mm' }}</p>
              </mat-card-content>
            </mat-card>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .detail-container {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 16px;
    }

    .main-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .sidebar {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .ticket-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 0;
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

    .date {
      color: rgba(0,0,0,0.6);
      font-size: 14px;
      margin-left: auto;
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

    .comments {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
    }

    .comment {
      padding: 12px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .comment.admin-comment {
      background: #e3f2fd;
    }

    .comment-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .author {
      font-weight: 500;
    }

    .role-badge {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(0,0,0,0.1);
    }

    .role-badge.admin {
      background: #1a3458;
      color: white;
    }

    .time {
      font-size: 12px;
      color: rgba(0,0,0,0.6);
      margin-left: auto;
    }

    .comment-content {
      margin: 0;
      white-space: pre-wrap;
    }

    .no-comments {
      text-align: center;
      color: rgba(0,0,0,0.6);
      padding: 24px;
    }

    .comment-form {
      padding-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .comment-form button {
      align-self: flex-end;
    }

    .full-width {
      width: 100%;
    }

    .info-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 8px 0;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .label {
      font-size: 12px;
      color: rgba(0,0,0,0.6);
    }

    .value {
      font-weight: 500;
    }

    .assigned-to {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 8px 0 16px 0;
    }

    .not-assigned {
      color: rgba(0,0,0,0.6);
      margin: 8px 0 16px 0;
    }

    .resolved-card, .closed-card {
      text-align: center;
    }

    .resolved-card {
      background: #e8f5e9;
    }

    .resolved-card mat-icon {
      color: #4caf50;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .closed-card {
      background: #f5f5f5;
    }

    .closed-card mat-icon {
      color: rgba(0,0,0,0.6);
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (max-width: 1024px) {
      .detail-container {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminTicketDetailComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ticketService = inject(TicketService);
  private notification = inject(NotificationService);

  ticket = signal<Ticket | null>(null);
  isLoading = signal(false);
  isSending = signal(false);
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
        this.router.navigate(['/admin/tickets']);
      }
    });
  }

  sendComment(): void {
    if (this.commentForm.invalid) return;

    this.isSending.set(true);

    this.ticketService.addComment(this.ticketId, {
      content: this.commentForm.value.content!
    }).subscribe({
      next: () => {
        this.commentForm.reset();
        this.isSending.set(false);
        this.notification.success('Comentario enviado');
        this.loadTicket();
      },
      error: () => {
        this.isSending.set(false);
        this.notification.error('Error al enviar el comentario');
      }
    });
  }

  async resolveTicket(): Promise<void> {
    const confirmed = await this.notification.confirm(
      `¿Marcar el ticket #${this.ticketId} como resuelto?`
    );

    if (confirmed) {
      this.ticketService.resolveTicket(this.ticketId).subscribe({
        next: () => {
          this.notification.success('Ticket marcado como resuelto');
          this.loadTicket();
        },
        error: () => {
          this.notification.error('Error al resolver el ticket');
        }
      });
    }
  }

  async closeTicket(): Promise<void> {
    const confirmed = await this.notification.confirm(
      `¿Cerrar el ticket #${this.ticketId}?`
    );

    if (confirmed) {
      this.ticketService.closeTicket(this.ticketId).subscribe({
        next: () => {
          this.notification.success('Ticket cerrado');
          this.loadTicket();
        },
        error: () => {
          this.notification.error('Error al cerrar el ticket');
        }
      });
    }
  }
}
