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
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../../shared/components/ui/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../../../../shared/components/ui/status-badge/status-badge.component';
import { CurrencyFormatPipe } from '../../../../../shared/pipes/currency-format.pipe';
import { NotificationService } from '../../../../../core/services/notification.service';
import { InventoryService } from '../services/inventory.service';
import { Equipment } from '../models/equipment.model';
import { EquipmentStatus, EquipmentCategory } from '../../../../../shared/models/base.model';

@Component({
  selector: 'app-inventory-list',
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
    FormsModule,
    TranslateModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
    CurrencyFormatPipe
  ],
  template: `
    <app-page-header
      title="inventory.title"
      subtitle="inventory.subtitle"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/admin/dashboard' },
        { label: 'menu.inventory' }
      ]">
      <button mat-raised-button color="primary" routerLink="/admin/inventory/new">
        <mat-icon>add</mat-icon>
        {{ 'inventory.newEquipment' | translate }}
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
                   placeholder="Nombre, marca o modelo...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'inventory.category' | translate }}</mat-label>
            <mat-select [(ngModel)]="categoryFilter" (selectionChange)="search()">
              <mat-option value="">{{ 'common.all' | translate }}</mat-option>
              @for (category of categories; track category) {
                <mat-option [value]="category">{{ 'category.' + category | translate }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

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
        } @else if (equipments().length === 0) {
          <app-empty-state
            icon="inventory_2"
            [title]="'inventory.noEquipment' | translate"
            [message]="'inventory.noEquipmentMessage' | translate">
            <button mat-raised-button color="primary" routerLink="/admin/inventory/new">
              {{ 'inventory.newEquipment' | translate }}
            </button>
          </app-empty-state>
        } @else {
          <table mat-table [dataSource]="equipments()" class="full-width">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let item">{{ item.id }}</td>
            </ng-container>

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>{{ 'inventory.name' | translate }}</th>
              <td mat-cell *matCellDef="let item">{{ item.name }}</td>
            </ng-container>

            <ng-container matColumnDef="brand">
              <th mat-header-cell *matHeaderCellDef>{{ 'inventory.brand' | translate }}</th>
              <td mat-cell *matCellDef="let item">{{ item.brand || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="model">
              <th mat-header-cell *matHeaderCellDef>{{ 'inventory.model' | translate }}</th>
              <td mat-cell *matCellDef="let item">{{ item.model || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef>{{ 'inventory.category' | translate }}</th>
              <td mat-cell *matCellDef="let item">{{ 'category.' + item.category | translate }}</td>
            </ng-container>

            <ng-container matColumnDef="basePrice">
              <th mat-header-cell *matHeaderCellDef>{{ 'inventory.basePrice' | translate }}</th>
              <td mat-cell *matCellDef="let item">{{ item.basePrice | currencyFormat }}</td>
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
                  <button mat-menu-item [routerLink]="['/admin/inventory', item.id]">
                    <mat-icon>visibility</mat-icon>
                    <span>{{ 'common.view' | translate }}</span>
                  </button>
                  <button mat-menu-item [routerLink]="['/admin/inventory', item.id, 'edit']">
                    <mat-icon>edit</mat-icon>
                    <span>{{ 'common.edit' | translate }}</span>
                  </button>
                  <button mat-menu-item [matMenuTriggerFor]="statusMenu">
                    <mat-icon>swap_horiz</mat-icon>
                    <span>{{ 'inventory.changeStatus' | translate }}</span>
                  </button>
                  <mat-menu #statusMenu="matMenu">
                    @for (status of statuses; track status) {
                      <button mat-menu-item (click)="changeStatus(item, status)"
                              [disabled]="item.status === status">
                        {{ 'status.' + status | translate }}
                      </button>
                    }
                  </mat-menu>
                  <button mat-menu-item (click)="deleteEquipment(item)">
                    <mat-icon color="warn">delete</mat-icon>
                    <span>{{ 'common.delete' | translate }}</span>
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
      min-width: 180px;
    }

    .full-width {
      width: 100%;
    }

    table {
      margin-bottom: 16px;
    }
  `]
})
export class InventoryListComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private notification = inject(NotificationService);

  private allEquipments: Equipment[] = [];
  equipments = signal<Equipment[]>([]);
  isLoading = signal(false);
  totalElements = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);

  searchTerm = '';
  statusFilter = '';
  categoryFilter = '';

  statuses = Object.values(EquipmentStatus);
  categories = Object.values(EquipmentCategory);

  displayedColumns = ['id', 'name', 'brand', 'model', 'category', 'basePrice', 'status', 'actions'];

  ngOnInit(): void {
    this.loadEquipments();
  }

  loadEquipments(): void {
    this.isLoading.set(true);

    this.inventoryService.getEquipments({
      page: 0,
      size: 1000
    }).subscribe({
      next: (page) => {
        this.allEquipments = page.content;
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.error('Error al cargar el inventario');
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.allEquipments];

    // Filtro por búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.name?.toLowerCase().includes(term) ||
        e.brand?.toLowerCase().includes(term) ||
        e.model?.toLowerCase().includes(term)
      );
    }

    // Filtro por estado
    if (this.statusFilter) {
      filtered = filtered.filter(e => e.status === this.statusFilter);
    }

    // Filtro por categoría
    if (this.categoryFilter) {
      filtered = filtered.filter(e => e.category === this.categoryFilter);
    }

    this.totalElements.set(filtered.length);

    // Paginación en frontend
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    this.equipments.set(filtered.slice(start, end));
  }

  search(): void {
    this.pageIndex.set(0);
    this.applyFilters();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.applyFilters();
  }

  changeStatus(item: Equipment, status: EquipmentStatus): void {
    this.inventoryService.changeStatus(item.id, { status }).subscribe({
      next: () => {
        this.notification.success('Estado actualizado correctamente');
        this.loadEquipments();
      },
      error: () => {
        this.notification.error('Error al cambiar el estado');
      }
    });
  }

  deleteEquipment(item: Equipment): void {
    this.notification.confirmDelete(item.name).then((confirmed) => {
      if (confirmed) {
        this.inventoryService.deleteEquipment(item.id).subscribe({
          next: () => {
            this.notification.success('Equipo eliminado correctamente');
            this.loadEquipments();
          },
          error: () => {
            this.notification.error('Error al eliminar el equipo');
          }
        });
      }
    });
  }
}
