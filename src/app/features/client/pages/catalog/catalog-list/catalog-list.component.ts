import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, SlicePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../../shared/components/ui/empty-state/empty-state.component';
import { NotificationService } from '../../../../../core/services/notification.service';
import { CatalogService } from '../services/catalog.service';
import { CatalogProductModel, CatalogSelection } from '../models/catalog.model';
import { EquipmentCategory } from '../../../../../shared/models/base.model';

@Component({
  selector: 'app-catalog-list',
  standalone: true,
  imports: [
    RouterLink,
    SlicePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatBadgeModule,
    MatPaginatorModule,
    FormsModule,
    TranslateModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent
  ],
  template: `
    <app-page-header
      title="catalog.title"
      subtitle="catalog.subtitle"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/client/dashboard' },
        { label: 'menu.catalog' }
      ]">
      @if (getTotalSelectedCount() > 0) {
        <button mat-raised-button color="primary" routerLink="/client/requests/new"
                [queryParams]="{ selections: getSelectionsParam() }">
          <mat-icon>send</mat-icon>
          {{ 'catalog.requestSelected' | translate }} ({{ getTotalSelectedCount() }} equipos)
        </button>
      }
    </app-page-header>

    <mat-card class="filters-card">
      <mat-card-content>
        <div class="filters">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'common.search' | translate }}</mat-label>
            <input matInput
                   [(ngModel)]="searchTerm"
                   (keyup.enter)="search()"
                   placeholder="Buscar modelos...">
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
        </div>
      </mat-card-content>
    </mat-card>

    @if (isLoading()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (productModels().length === 0) {
      <app-empty-state
        icon="storefront"
        [title]="'catalog.noEquipment' | translate"
        [message]="'catalog.noEquipmentMessage' | translate">
      </app-empty-state>
    } @else {
      <div class="catalog-grid">
        @for (item of productModels(); track item.id) {
          <mat-card class="equipment-card" [class.selected]="getSelectedQuantity(item) > 0">
            <div class="card-image">
              @if (item.imageUrl) {
                <img [src]="item.imageUrl" [alt]="item.name">
              } @else {
                <mat-icon class="placeholder-icon">computer</mat-icon>
              }
              @if (item.category) {
                <mat-chip class="category-chip">
                  {{ 'category.' + item.category | translate }}
                </mat-chip>
              }
              <div class="stock-badge" [class.low-stock]="item.availableStock <= 3">
                {{ item.availableStock }} disponibles
              </div>
            </div>

            <mat-card-content>
              <h3 class="equipment-name">{{ item.name }}</h3>
              @if (item.brand || item.model) {
                <p class="equipment-brand">{{ item.brand }} {{ item.model }}</p>
              }
              @if (item.specifications) {
                <p class="equipment-specs">{{ item.specifications | slice:0:100 }}...</p>
              }
            </mat-card-content>

            <mat-card-actions>
              <div class="quantity-selector">
                <button mat-icon-button
                        [disabled]="getSelectedQuantity(item) === 0"
                        (click)="decreaseQuantity(item)">
                  <mat-icon>remove</mat-icon>
                </button>
                <span class="quantity-value">{{ getSelectedQuantity(item) }}</span>
                <button mat-icon-button
                        [disabled]="getSelectedQuantity(item) >= item.availableStock"
                        (click)="increaseQuantity(item)">
                  <mat-icon>add</mat-icon>
                </button>
              </div>
              @if (getSelectedQuantity(item) > 0) {
                <button mat-stroked-button color="warn" (click)="removeSelection(item)">
                  <mat-icon>delete</mat-icon>
                  Quitar
                </button>
              }
            </mat-card-actions>
          </mat-card>
        }
      </div>

      <mat-paginator
        [length]="totalElements()"
        [pageSize]="pageSize()"
        [pageIndex]="pageIndex()"
        [pageSizeOptions]="[8, 16, 24, 48]"
        (page)="onPageChange($event)"
        showFirstLastButtons>
      </mat-paginator>
    }

    @if (selections().length > 0) {
      <div class="selection-summary">
        <h4>Selección actual:</h4>
        <div class="selection-items">
          @for (sel of selections(); track sel.productModel.id) {
            <mat-chip>
              {{ sel.quantity }}x {{ sel.productModel.name }}
              <button matChipRemove (click)="removeSelection(sel.productModel)">
                <mat-icon>cancel</mat-icon>
              </button>
            </mat-chip>
          }
        </div>
        <span class="selection-total">Total: {{ getTotalSelectedCount() }} equipos</span>
      </div>
    }
  `,
  styles: [`
    .filters-card {
      margin-bottom: 24px;
    }

    .filters {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .filters mat-form-field {
      min-width: 200px;
    }

    .catalog-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }

    .equipment-card {
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .equipment-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .equipment-card.selected {
      border: 2px solid #1A3458;
    }

    .card-image {
      position: relative;
      height: 180px;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .card-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .placeholder-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
    }

    .category-chip {
      position: absolute;
      top: 8px;
      right: 8px;
    }

    .stock-badge {
      position: absolute;
      bottom: 8px;
      left: 8px;
      background: #4caf50;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .stock-badge.low-stock {
      background: #ff9800;
    }

    .equipment-name {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
      color: #1A3458;
    }

    .equipment-brand {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #666;
    }

    .equipment-specs {
      margin: 0;
      font-size: 12px;
      color: #999;
      line-height: 1.4;
    }

    mat-card-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px 16px;
    }

    .quantity-selector {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f5f5f5;
      border-radius: 24px;
      padding: 4px;
    }

    .quantity-value {
      min-width: 32px;
      text-align: center;
      font-weight: 600;
      font-size: 16px;
    }

    .selection-summary {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      padding: 16px 24px;
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      gap: 16px;
      z-index: 100;
    }

    .selection-summary h4 {
      margin: 0;
      white-space: nowrap;
    }

    .selection-items {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      flex: 1;
    }

    .selection-total {
      font-weight: 600;
      color: #1A3458;
      white-space: nowrap;
    }
  `]
})
export class CatalogListComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private notification = inject(NotificationService);

  productModels = signal<CatalogProductModel[]>([]);
  selections = signal<CatalogSelection[]>([]);
  isLoading = signal(false);
  totalElements = signal(0);
  pageSize = signal(8);
  pageIndex = signal(0);

  searchTerm = '';
  categoryFilter = '';
  categories = Object.values(EquipmentCategory);

  ngOnInit(): void {
    this.loadCatalog();
  }

  loadCatalog(): void {
    this.isLoading.set(true);

    this.catalogService.getProductModels({
      page: this.pageIndex(),
      size: this.pageSize(),
      search: this.searchTerm || undefined,
      category: this.categoryFilter || undefined
    }).subscribe({
      next: (page) => {
        this.productModels.set(page.content);
        this.totalElements.set(page.totalElements);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.error('Error al cargar el catálogo');
      }
    });
  }

  search(): void {
    this.pageIndex.set(0);
    this.loadCatalog();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadCatalog();
  }

  getSelectedQuantity(item: CatalogProductModel): number {
    const selection = this.selections().find(s => s.productModel.id === item.id);
    return selection?.quantity || 0;
  }

  increaseQuantity(item: CatalogProductModel): void {
    const currentQty = this.getSelectedQuantity(item);
    if (currentQty >= item.availableStock) return;

    this.selections.update(list => {
      const existing = list.find(s => s.productModel.id === item.id);
      if (existing) {
        return list.map(s =>
          s.productModel.id === item.id
            ? { ...s, quantity: s.quantity + 1 }
            : s
        );
      } else {
        return [...list, { productModel: item, quantity: 1 }];
      }
    });
  }

  decreaseQuantity(item: CatalogProductModel): void {
    const currentQty = this.getSelectedQuantity(item);
    if (currentQty <= 0) return;

    this.selections.update(list => {
      if (currentQty === 1) {
        return list.filter(s => s.productModel.id !== item.id);
      }
      return list.map(s =>
        s.productModel.id === item.id
          ? { ...s, quantity: s.quantity - 1 }
          : s
      );
    });
  }

  removeSelection(item: CatalogProductModel): void {
    this.selections.update(list => list.filter(s => s.productModel.id !== item.id));
  }

  getTotalSelectedCount(): number {
    return this.selections().reduce((sum, s) => sum + s.quantity, 0);
  }

  getSelectionsParam(): string {
    // Format: modelId:quantity,modelId:quantity
    return this.selections()
      .map(s => `${s.productModel.id}:${s.quantity}`)
      .join(',');
  }
}
