import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../../shared/components/ui/empty-state/empty-state.component';
import { NotificationService } from '../../../../../core/services/notification.service';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatMenuModule,
    MatChipsModule,
    FormsModule,
    TranslateModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent
  ],
  template: `
    <app-page-header
      title="users.title"
      subtitle="users.subtitle"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/admin/dashboard' },
        { label: 'menu.users' }
      ]">
      <button mat-raised-button color="primary" routerLink="/admin/users/new">
        <mat-icon>person_add</mat-icon>
        {{ 'users.newUser' | translate }}
      </button>
    </app-page-header>

    <mat-card>
      <mat-card-content>
        <!-- Filters -->
        <div class="filters">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'common.search' | translate }}</mat-label>
            <input matInput
                   [(ngModel)]="searchTerm"
                   (keyup.enter)="search()"
                   placeholder="Nombre, email o empresa...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'common.status' | translate }}</mat-label>
            <mat-select [(ngModel)]="statusFilter" (selectionChange)="search()">
              <mat-option value="">{{ 'common.all' | translate }}</mat-option>
              <mat-option value="true">{{ 'common.active' | translate }}</mat-option>
              <mat-option value="false">{{ 'common.inactive' | translate }}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        @if (isLoading()) {
          <app-loading-spinner></app-loading-spinner>
        } @else if (users().length === 0) {
          <app-empty-state
            icon="people"
            [title]="'users.noUsers' | translate"
            [message]="'users.noUsersMessage' | translate">
            <button mat-raised-button color="primary" routerLink="/admin/users/new">
              {{ 'users.newUser' | translate }}
            </button>
          </app-empty-state>
        } @else {
          <table mat-table [dataSource]="users()" class="full-width">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let user">{{ user.id }}</td>
            </ng-container>

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>{{ 'users.name' | translate }}</th>
              <td mat-cell *matCellDef="let user">{{ user.name }}</td>
            </ng-container>

            <ng-container matColumnDef="companyName">
              <th mat-header-cell *matHeaderCellDef>{{ 'users.company' | translate }}</th>
              <td mat-cell *matCellDef="let user">{{ user.companyName || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="ruc">
              <th mat-header-cell *matHeaderCellDef>RUC</th>
              <td mat-cell *matCellDef="let user">{{ user.ruc || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let user">{{ user.email }}</td>
            </ng-container>

            <ng-container matColumnDef="isActive">
              <th mat-header-cell *matHeaderCellDef>{{ 'common.status' | translate }}</th>
              <td mat-cell *matCellDef="let user">
                <mat-chip [color]="user.isActive ? 'primary' : 'warn'" selected>
                  {{ user.isActive ? ('common.active' | translate) : ('common.inactive' | translate) }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>{{ 'common.actions' | translate }}</th>
              <td mat-cell *matCellDef="let user">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item [routerLink]="['/admin/users', user.id]">
                    <mat-icon>visibility</mat-icon>
                    <span>{{ 'common.view' | translate }}</span>
                  </button>
                  <button mat-menu-item [routerLink]="['/admin/users', user.id, 'edit']">
                    <mat-icon>edit</mat-icon>
                    <span>{{ 'common.edit' | translate }}</span>
                  </button>
                  <button mat-menu-item (click)="toggleStatus(user)">
                    <mat-icon>{{ user.isActive ? 'block' : 'check_circle' }}</mat-icon>
                    <span>{{ user.isActive ? ('common.deactivate' | translate) : ('common.activate' | translate) }}</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
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
      flex-wrap: wrap;
    }

    .filters mat-form-field {
      min-width: 200px;
    }

    .full-width {
      width: 100%;
    }

    table {
      margin-bottom: 16px;
    }
  `]
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  users = signal<User[]>([]);
  isLoading = signal(false);
  totalElements = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);

  searchTerm = '';
  statusFilter = '';

  displayedColumns = ['id', 'name', 'companyName', 'ruc', 'email', 'isActive', 'actions'];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);

    this.userService.getUsers({
      page: this.pageIndex(),
      size: this.pageSize(),
      search: this.searchTerm || undefined,
      status: this.statusFilter || undefined
    }).subscribe({
      next: (page) => {
        this.users.set(page.content);
        this.totalElements.set(page.totalElements);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.error('Error al cargar los clientes');
      }
    });
  }

  search(): void {
    this.pageIndex.set(0);
    this.loadUsers();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadUsers();
  }

  toggleStatus(user: User): void {
    this.notification.confirm(
      `¿Desea ${user.isActive ? 'desactivar' : 'activar'} al cliente "${user.name}"?`
    ).then((confirmed) => {
      if (confirmed) {
        this.userService.toggleStatus(user.id).subscribe({
          next: () => {
            this.notification.success(`Cliente ${user.isActive ? 'desactivado' : 'activado'} correctamente`);
            this.loadUsers();
          },
          error: () => {
            this.notification.error('Error al cambiar el estado del cliente');
          }
        });
      }
    });
  }
}
