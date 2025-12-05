import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../../shared/components/ui/empty-state/empty-state.component';
import { CurrencyFormatPipe } from '../../../../../shared/pipes/currency-format.pipe';
import { NotificationService } from '../../../../../core/services/notification.service';
import { ProductModelService } from '../services/product-model.service';
import { ProductModel } from '../models/product-model.model';

@Component({
  selector: 'app-product-model-list',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatChipsModule,
    MatMenuModule,
    TranslateModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    CurrencyFormatPipe
  ],
  template: `
    <app-page-header
      title="Modelos de Productos"
      subtitle="Gestiona los modelos base para crear equipos"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/admin/dashboard' },
        { label: 'Modelos' }
      ]">
      <button mat-raised-button color="primary" routerLink="/admin/product-models/new">
        <mat-icon>add</mat-icon>
        Nuevo Modelo
      </button>
    </app-page-header>

    <mat-card>
      <mat-card-content>
        <div class="filters">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>{{ 'common.search' | translate }}</mat-label>
            <input matInput [(ngModel)]="searchTerm" (keyup.enter)="search()" placeholder="Buscar por nombre, marca o modelo">
            <button mat-icon-button matSuffix (click)="search()">
              <mat-icon>search</mat-icon>
            </button>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Categoría</mat-label>
            <mat-select [(ngModel)]="selectedCategory" (selectionChange)="search()">
              <mat-option value="">Todas</mat-option>
              <mat-option value="LAPTOP">Laptop</mat-option>
              <mat-option value="DESKTOP">Desktop</mat-option>
              <mat-option value="SERVER">Servidor</mat-option>
              <mat-option value="MONITOR">Monitor</mat-option>
              <mat-option value="PRINTER">Impresora</mat-option>
              <mat-option value="PERIPHERAL">Periférico</mat-option>
              <mat-option value="NETWORK">Red</mat-option>
              <mat-option value="OTHER">Otro</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        @if (isLoading()) {
          <app-loading-spinner></app-loading-spinner>
        } @else if (productModels().length === 0) {
          <app-empty-state
            icon="inventory_2"
            title="No hay modelos"
            message="Crea tu primer modelo de producto">
            <button mat-raised-button color="primary" routerLink="/admin/product-models/new">
              <mat-icon>add</mat-icon>
              Nuevo Modelo
            </button>
          </app-empty-state>
        } @else {
          <table mat-table [dataSource]="productModels()" class="full-width">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nombre</th>
              <td mat-cell *matCellDef="let model">
                <div class="model-info">
                  <span class="model-name">{{ model.name }}</span>
                  <span class="model-brand">{{ model.brand }} {{ model.model }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef>Categoría</th>
              <td mat-cell *matCellDef="let model">
                <mat-chip>{{ model.category || 'Sin categoría' }}</mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="basePrice">
              <th mat-header-cell *matHeaderCellDef>Precio Base</th>
              <td mat-cell *matCellDef="let model">{{ model.basePrice | currencyFormat }}</td>
            </ng-container>

            <ng-container matColumnDef="stock">
              <th mat-header-cell *matHeaderCellDef>Stock</th>
              <td mat-cell *matCellDef="let model">
                <div class="stock-info">
                  <span class="stock-total">{{ model.totalEquipments }} total</span>
                  <div class="stock-details">
                    <span class="available">{{ model.availableEquipments }} disponibles</span>
                    <span class="leased">{{ model.leasedEquipments }} arrendados</span>
                  </div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let model">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item [routerLink]="['/admin/product-models', model.id, 'edit']">
                    <mat-icon>edit</mat-icon>
                    <span>Editar</span>
                  </button>
                  <button mat-menu-item [routerLink]="['/admin/product-models', model.id, 'add-equipment']">
                    <mat-icon>add_circle</mat-icon>
                    <span>Agregar Equipos</span>
                  </button>
                  <button mat-menu-item (click)="deactivate(model)">
                    <mat-icon>delete</mat-icon>
                    <span>Eliminar</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <mat-paginator
            [length]="totalElements"
            [pageSize]="pageSize"
            [pageIndex]="currentPage"
            [pageSizeOptions]="[10, 25, 50]"
            (page)="onPageChange($event)">
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

    .search-field {
      flex: 1;
      min-width: 250px;
    }

    .full-width {
      width: 100%;
    }

    .model-info {
      display: flex;
      flex-direction: column;
    }

    .model-name {
      font-weight: 500;
    }

    .model-brand {
      font-size: 12px;
      color: rgba(0,0,0,0.6);
    }

    .stock-info {
      display: flex;
      flex-direction: column;
    }

    .stock-total {
      font-weight: 500;
    }

    .stock-details {
      font-size: 12px;
      display: flex;
      gap: 8px;
    }

    .available {
      color: #4caf50;
    }

    .leased {
      color: #ff9800;
    }
  `]
})
export class ProductModelListComponent implements OnInit {
  private productModelService = inject(ProductModelService);
  private notification = inject(NotificationService);

  productModels = signal<ProductModel[]>([]);
  isLoading = signal(false);

  searchTerm = '';
  selectedCategory = '';
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;

  displayedColumns = ['name', 'category', 'basePrice', 'stock', 'actions'];

  ngOnInit(): void {
    this.loadProductModels();
  }

  loadProductModels(): void {
    this.isLoading.set(true);

    this.productModelService.getProductModels({
      page: this.currentPage,
      size: this.pageSize,
      search: this.searchTerm || undefined,
      category: this.selectedCategory || undefined
    }).subscribe({
      next: (page) => {
        this.productModels.set(page.content);
        this.totalElements = page.totalElements;
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.error('Error al cargar los modelos');
      }
    });
  }

  search(): void {
    this.currentPage = 0;
    this.loadProductModels();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProductModels();
  }

  async deactivate(model: ProductModel): Promise<void> {
    if (model.totalEquipments > 0) {
      this.notification.error(
        `No se puede eliminar el modelo "${model.name}" porque tiene ${model.totalEquipments} equipos asociados. Elimina los equipos primero.`
      );
      return;
    }

    const confirmed = await this.notification.confirm(
      `¿Estás seguro de eliminar el modelo "${model.name}"?`
    );

    if (confirmed) {
      this.productModelService.deactivateProductModel(model.id).subscribe({
        next: () => {
          this.notification.success('Modelo eliminado exitosamente');
          this.loadProductModels();
        },
        error: (err) => {
          const message = err.error?.message || 'Error al eliminar el modelo';
          this.notification.error(message);
        }
      });
    }
  }
}
