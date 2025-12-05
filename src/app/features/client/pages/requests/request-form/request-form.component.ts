import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { NotificationService } from '../../../../../core/services/notification.service';
import { CatalogService } from '../../catalog/services/catalog.service';
import { ClientRequestService } from '../services/client-request.service';
import { CatalogProductModel } from '../../catalog/models/catalog.model';

interface SelectableModel extends CatalogProductModel {
  quantity: number;
  selected: boolean;
}

@Component({
  selector: 'app-client-request-form',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatCheckboxModule,
    MatStepperModule,
    TranslateModule,
    PageHeaderComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <app-page-header
      title="requests.newRequest"
      subtitle="requests.newRequestSubtitle"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/client/dashboard' },
        { label: 'menu.requests', route: '/client/requests' },
        { label: 'requests.new' }
      ]">
    </app-page-header>

    @if (isLoadingCatalog()) {
      <app-loading-spinner></app-loading-spinner>
    } @else {
      <mat-stepper linear #stepper>
        <!-- Step 1: Select Equipment -->
        <mat-step [stepControl]="equipmentForm" label="{{ 'requests.selectEquipment' | translate }}">
          <mat-card>
            <mat-card-content>
              <table mat-table [dataSource]="productModels()" class="full-width">
                <ng-container matColumnDef="select">
                  <th mat-header-cell *matHeaderCellDef></th>
                  <td mat-cell *matCellDef="let item">
                    <mat-checkbox
                      [(ngModel)]="item.selected"
                      (change)="onSelectionChange(item)">
                    </mat-checkbox>
                  </td>
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
                  <td mat-cell *matCellDef="let item">
                    @if (item.category) {
                      {{ 'category.' + item.category | translate }}
                    } @else {
                      -
                    }
                  </td>
                </ng-container>

                <ng-container matColumnDef="stock">
                  <th mat-header-cell *matHeaderCellDef>Disponibles</th>
                  <td mat-cell *matCellDef="let item">
                    <span class="stock-badge" [class.low-stock]="item.availableStock <= 3">
                      {{ item.availableStock }}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="quantity">
                  <th mat-header-cell *matHeaderCellDef>{{ 'common.quantity' | translate }}</th>
                  <td mat-cell *matCellDef="let item">
                    <mat-form-field appearance="outline" class="quantity-field">
                      <input matInput type="number"
                             [(ngModel)]="item.quantity"
                             [min]="1"
                             [max]="item.availableStock"
                             [disabled]="!item.selected"
                             (change)="validateQuantity(item)">
                    </mat-form-field>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="equipmentColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: equipmentColumns;"></tr>
              </table>

              <div class="step-actions">
                <button mat-button routerLink="/client/requests">{{ 'common.cancel' | translate }}</button>
                <button mat-raised-button color="primary" matStepperNext
                        [disabled]="!hasSelectedEquipment()">
                  {{ 'common.next' | translate }}
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-step>

        <!-- Step 2: Request Details -->
        <mat-step [stepControl]="detailsForm" label="{{ 'requests.requestDetails' | translate }}">
          <mat-card>
            <mat-card-content>
              <form [formGroup]="detailsForm" class="details-form">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>{{ 'requests.duration' | translate }}</mat-label>
                  <mat-select formControlName="durationMonths">
                    <mat-option [value]="3">3 {{ 'common.months' | translate }}</mat-option>
                    <mat-option [value]="6">6 {{ 'common.months' | translate }}</mat-option>
                    <mat-option [value]="12">12 {{ 'common.months' | translate }}</mat-option>
                    <mat-option [value]="24">24 {{ 'common.months' | translate }}</mat-option>
                    <mat-option [value]="36">36 {{ 'common.months' | translate }}</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>{{ 'requests.notes' | translate }}</mat-label>
                  <textarea matInput formControlName="notes" rows="4"
                            placeholder="{{ 'requests.notesPlaceholder' | translate }}"></textarea>
                </mat-form-field>
              </form>

              <div class="step-actions">
                <button mat-button matStepperPrevious>{{ 'common.back' | translate }}</button>
                <button mat-raised-button color="primary" matStepperNext
                        [disabled]="detailsForm.invalid">
                  {{ 'common.next' | translate }}
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-step>

        <!-- Step 3: Review & Submit -->
        <mat-step label="{{ 'requests.reviewSubmit' | translate }}">
          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ 'requests.summary' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <h4>{{ 'requests.selectedEquipment' | translate }}</h4>
              <table mat-table [dataSource]="getSelectedModels()" class="full-width summary-table">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>{{ 'common.equipment' | translate }}</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.name }}
                    @if (item.brand || item.model) {
                      <br><small class="text-muted">{{ item.brand }} {{ item.model }}</small>
                    }
                  </td>
                </ng-container>

                <ng-container matColumnDef="quantity">
                  <th mat-header-cell *matHeaderCellDef>{{ 'common.quantity' | translate }}</th>
                  <td mat-cell *matCellDef="let item">{{ item.quantity }}</td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="summaryColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: summaryColumns;"></tr>
              </table>

              <div class="summary-info">
                <p><strong>Total equipos:</strong> {{ getTotalQuantity() }}</p>
                <p><strong>{{ 'requests.duration' | translate }}:</strong> {{ detailsForm.get('durationMonths')?.value }} {{ 'common.months' | translate }}</p>
                @if (detailsForm.get('notes')?.value) {
                  <p><strong>{{ 'requests.notes' | translate }}:</strong> {{ detailsForm.get('notes')?.value }}</p>
                }
              </div>

              <div class="step-actions">
                <button mat-button matStepperPrevious>{{ 'common.back' | translate }}</button>
                <button mat-raised-button color="primary" (click)="submit()"
                        [disabled]="isSubmitting()">
                  @if (isSubmitting()) {
                    <mat-icon class="spinning">sync</mat-icon>
                  }
                  {{ 'requests.submitRequest' | translate }}
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-step>
      </mat-stepper>
    }
  `,
  styles: [`
    .full-width {
      width: 100%;
    }

    .quantity-field {
      width: 80px;
    }

    .stock-badge {
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

    .step-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid rgba(0,0,0,0.12);
    }

    .details-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
    }

    .summary-table {
      margin-bottom: 16px;
    }

    .text-muted {
      color: rgba(0,0,0,0.6);
    }

    .summary-info {
      padding: 16px;
      background: rgba(0,0,0,0.04);
      border-radius: 4px;
      margin-bottom: 16px;
    }

    .summary-info p {
      margin: 8px 0;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class ClientRequestFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private catalogService = inject(CatalogService);
  private requestService = inject(ClientRequestService);
  private notification = inject(NotificationService);

  productModels = signal<SelectableModel[]>([]);
  isLoadingCatalog = signal(false);
  isSubmitting = signal(false);

  equipmentForm = this.fb.group({});
  detailsForm = this.fb.group({
    durationMonths: [12, Validators.required],
    notes: ['']
  });

  equipmentColumns = ['select', 'name', 'brand', 'model', 'category', 'stock', 'quantity'];
  summaryColumns = ['name', 'quantity'];

  ngOnInit(): void {
    this.loadCatalog();
  }

  loadCatalog(): void {
    this.isLoadingCatalog.set(true);

    this.catalogService.getProductModels({ page: 0, size: 100 }).subscribe({
      next: (page) => {
        const items: SelectableModel[] = page.content.map(m => ({
          ...m,
          quantity: 1,
          selected: false
        }));
        this.productModels.set(items);
        this.isLoadingCatalog.set(false);

        // Check for pre-selections from catalog
        this.applyPreselections();
      },
      error: () => {
        this.isLoadingCatalog.set(false);
        this.notification.error('Error al cargar el catálogo');
      }
    });
  }

  applyPreselections(): void {
    // Handle selections from catalog: ?selections=1:3,2:5
    const selectionsParam = this.route.snapshot.queryParamMap.get('selections');
    if (selectionsParam) {
      const selections = selectionsParam.split(',').map(s => {
        const [id, qty] = s.split(':');
        return { id: parseInt(id), quantity: parseInt(qty) || 1 };
      });

      this.productModels.update(models =>
        models.map(m => {
          const selection = selections.find(s => s.id === m.id);
          if (selection) {
            return {
              ...m,
              selected: true,
              quantity: Math.min(selection.quantity, m.availableStock)
            };
          }
          return m;
        })
      );
    }
  }

  onSelectionChange(item: SelectableModel): void {
    if (!item.selected) {
      item.quantity = 1;
    }
  }

  validateQuantity(item: SelectableModel): void {
    if (item.quantity < 1) {
      item.quantity = 1;
    }
    if (item.quantity > item.availableStock) {
      item.quantity = item.availableStock;
      this.notification.error(`Máximo disponible: ${item.availableStock}`);
    }
  }

  hasSelectedEquipment(): boolean {
    return this.productModels().some(e => e.selected);
  }

  getSelectedModels(): SelectableModel[] {
    return this.productModels().filter(e => e.selected);
  }

  getTotalQuantity(): number {
    return this.getSelectedModels().reduce((sum, m) => sum + m.quantity, 0);
  }

  submit(): void {
    const selectedItems = this.getSelectedModels();

    if (selectedItems.length === 0) {
      this.notification.error('Debe seleccionar al menos un equipo');
      return;
    }

    this.isSubmitting.set(true);

    const request = {
      durationMonths: this.detailsForm.get('durationMonths')?.value || 12,
      notes: this.detailsForm.get('notes')?.value || undefined,
      items: selectedItems.map(m => ({
        productModelId: m.id,
        quantity: m.quantity
      }))
    };

    this.requestService.createRequest(request).subscribe({
      next: () => {
        this.notification.success('Solicitud creada exitosamente');
        this.router.navigate(['/client/requests']);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.notification.error('Error al crear la solicitud');
      }
    });
  }
}
