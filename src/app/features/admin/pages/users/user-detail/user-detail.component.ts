import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { NotificationService } from '../../../../../core/services/notification.service';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { DateFormatPipe } from '../../../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    TranslateModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    DateFormatPipe
  ],
  template: `
    <app-page-header
      title="users.detail"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/admin/dashboard' },
        { label: 'menu.users', route: '/admin/users' },
        { label: 'users.detail' }
      ]">
      <button mat-stroked-button [routerLink]="['/admin/users', userId, 'edit']">
        <mat-icon>edit</mat-icon>
        {{ 'common.edit' | translate }}
      </button>
      <button mat-stroked-button [color]="user()?.isActive ? 'warn' : 'primary'" (click)="toggleStatus()">
        <mat-icon>{{ user()?.isActive ? 'block' : 'check_circle' }}</mat-icon>
        {{ user()?.isActive ? ('common.deactivate' | translate) : ('common.activate' | translate) }}
      </button>
    </app-page-header>

    @if (isLoading()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (user()) {
      <div class="detail-grid">
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ 'users.basicInfo' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <label>ID</label>
                <span>{{ user()?.id }}</span>
              </div>
              <div class="info-item">
                <label>{{ 'users.name' | translate }}</label>
                <span>{{ user()?.name }}</span>
              </div>
              <div class="info-item">
                <label>Email</label>
                <span>{{ user()?.email }}</span>
              </div>
              <div class="info-item">
                <label>{{ 'users.company' | translate }}</label>
                <span>{{ user()?.companyName || '-' }}</span>
              </div>
              <div class="info-item">
                <label>RUC</label>
                <span>{{ user()?.ruc || '-' }}</span>
              </div>
              <div class="info-item">
                <label>{{ 'users.phone' | translate }}</label>
                <span>{{ user()?.phone || '-' }}</span>
              </div>
              <div class="info-item full-width">
                <label>{{ 'users.address' | translate }}</label>
                <span>{{ user()?.address || '-' }}</span>
              </div>
              <div class="info-item">
                <label>{{ 'common.status' | translate }}</label>
                <mat-chip [color]="user()?.isActive ? 'primary' : 'warn'" selected>
                  {{ user()?.isActive ? ('common.active' | translate) : ('common.inactive' | translate) }}
                </mat-chip>
              </div>
              <div class="info-item">
                <label>{{ 'common.createdAt' | translate }}</label>
                <span>{{ user()?.createdAt | dateFormat:'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    }
  `,
  styles: [`
    .detail-grid {
      display: grid;
      gap: 24px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-item.full-width {
      grid-column: 1 / -1;
    }

    .info-item label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-item span {
      font-size: 14px;
      color: #333;
    }
  `]
})
export class UserDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private notification = inject(NotificationService);

  user = signal<User | null>(null);
  isLoading = signal(false);
  userId!: number;

  ngOnInit(): void {
    this.userId = +this.route.snapshot.paramMap.get('id')!;
    this.loadUser();
  }

  loadUser(): void {
    this.isLoading.set(true);
    this.userService.getUser(this.userId).subscribe({
      next: (user) => {
        this.user.set(user);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.error('Error al cargar el cliente');
        this.router.navigate(['/admin/users']);
      }
    });
  }

  toggleStatus(): void {
    const currentUser = this.user();
    if (!currentUser) return;

    this.notification.confirm(
      `¿Desea ${currentUser.isActive ? 'desactivar' : 'activar'} al cliente "${currentUser.name}"?`
    ).then((confirmed) => {
      if (confirmed) {
        this.userService.toggleStatus(this.userId).subscribe({
          next: () => {
            this.notification.success(`Cliente ${currentUser.isActive ? 'desactivado' : 'activado'} correctamente`);
            this.loadUser();
          },
          error: () => {
            this.notification.error('Error al cambiar el estado del cliente');
          }
        });
      }
    });
  }
}
