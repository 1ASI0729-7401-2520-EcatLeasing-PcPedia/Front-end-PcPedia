import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { InputErrorComponent } from '../../../../../shared/components/forms/input-error/input-error.component';
import { NotificationService } from '../../../../../core/services/notification.service';
import { InventoryService } from '../services/inventory.service';
import { ProductModelService } from '../../product-models/services/product-model.service';
import { ProductModel } from '../../product-models/models/product-model.model';
import { EquipmentCategory } from '../../../../../shared/models/base.model';

@Component({
  selector: 'app-inventory-form',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslateModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    InputErrorComponent
  ],
  template: `
    <app-page-header
      [title]="isEditMode() ? 'inventory.editEquipment' : 'inventory.newEquipment'"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/admin/dashboard' },
        { label: 'menu.inventory', route: '/admin/inventory' },
        { label: isEditMode() ? 'common.edit' : 'common.create' }
      ]">
    </app-page-header>

    @if (isLoadingData()) {
      <app-loading-spinner></app-loading-spinner>
    } @else {
      <mat-card>
        <mat-card-content>
          <form [formGroup]="equipmentForm" (ngSubmit)="onSubmit()">
            <div class="form-grid">
              @if (!isEditMode()) {
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Modelo de Producto</mat-label>
                  <mat-select formControlName="productModelId" (selectionChange)="onProductModelChange($event.value)">
                    @for (model of productModels(); track model.id) {
                      <mat-option [value]="model.id">
                        {{ model.name }} - {{ model.brand }} {{ model.model }}
                      </mat-option>
                    }
                  </mat-select>
                  <mat-error>
                    <app-input-error [control]="equipmentForm.get('productModelId')"></app-input-error>
                  </mat-error>
                  <mat-hint>Selecciona el modelo base para este equipo</mat-hint>
                </mat-form-field>

                @if (selectedModel()) {
                  <div class="model-preview full-width">
                    <h4>Detalles del Modelo Seleccionado</h4>
                    <div class="model-details">
                      <span><strong>Nombre:</strong> {{ selectedModel()!.name }}</span>
                      <span><strong>Marca:</strong> {{ selectedModel()!.brand }}</span>
                      <span><strong>Modelo:</strong> {{ selectedModel()!.model }}</span>
                      <span><strong>Categoria:</strong> {{ selectedModel()!.category }}</span>
                    </div>
                  </div>
                }
              }

              <mat-form-field appearance="outline">
                <mat-label>{{ 'inventory.serialNumber' | translate }}</mat-label>
                <input matInput formControlName="serialNumber" placeholder="Ej: SN-2024-001">
                <mat-error>
                  <app-input-error [control]="equipmentForm.get('serialNumber')"></app-input-error>
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'inventory.purchaseDate' | translate }}</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="purchaseDate">
                <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>

              @if (isEditMode()) {
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'inventory.name' | translate }}</mat-label>
                  <input matInput formControlName="name">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>{{ 'inventory.brand' | translate }}</mat-label>
                  <input matInput formControlName="brand">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>{{ 'inventory.model' | translate }}</mat-label>
                  <input matInput formControlName="model">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>{{ 'inventory.category' | translate }}</mat-label>
                  <mat-select formControlName="category">
                    @for (category of categories; track category) {
                      <mat-option [value]="category">{{ 'category.' + category | translate }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>{{ 'inventory.basePrice' | translate }}</mat-label>
                  <input matInput type="number" formControlName="basePrice" min="0" step="0.01">
                  <span matTextPrefix>S/. &nbsp;</span>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>{{ 'inventory.imageUrl' | translate }}</mat-label>
                  <input matInput formControlName="imageUrl" placeholder="https://...">
                  <mat-icon matSuffix>image</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>{{ 'inventory.specifications' | translate }}</mat-label>
                  <textarea matInput formControlName="specifications" rows="4"
                            placeholder="CPU: Intel i7, RAM: 16GB, SSD: 512GB..."></textarea>
                </mat-form-field>
              }
            </div>

            <div class="form-actions">
              <button mat-stroked-button type="button" routerLink="/admin/inventory">
                {{ 'common.cancel' | translate }}
              </button>
              <button mat-raised-button color="primary" type="submit"
                      [disabled]="isSubmitting() || (!isEditMode() && !selectedModel())">
                @if (isSubmitting()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  {{ 'common.save' | translate }}
                }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: [`
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .model-preview {
      background: #f5f5f5;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 8px;
    }

    .model-preview h4 {
      margin: 0 0 12px 0;
      color: #1A3458;
    }

    .model-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 8px;
    }

    .model-details span {
      font-size: 14px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
    }
  `]
})
export class InventoryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private inventoryService = inject(InventoryService);
  private productModelService = inject(ProductModelService);
  private notification = inject(NotificationService);

  isEditMode = signal(false);
  isLoadingData = signal(false);
  isSubmitting = signal(false);
  equipmentId: number | null = null;

  productModels = signal<ProductModel[]>([]);
  selectedModel = signal<ProductModel | null>(null);
  categories = Object.values(EquipmentCategory);

  equipmentForm: FormGroup = this.fb.group({
    productModelId: [null, [Validators.required]],
    serialNumber: ['', [Validators.required]],
    purchaseDate: [null],
    // Fields for edit mode
    name: [''],
    brand: [''],
    model: [''],
    category: [''],
    specifications: [''],
    basePrice: [0],
    imageUrl: ['']
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.equipmentId = +id;
      this.loadEquipment();
    } else {
      this.loadProductModels();
    }
  }

  loadProductModels(): void {
    this.productModelService.getAllActiveModels().subscribe({
      next: (models) => {
        this.productModels.set(models);
      },
      error: () => {
        this.notification.error('Error al cargar los modelos de producto');
      }
    });
  }

  onProductModelChange(modelId: number): void {
    const model = this.productModels().find(m => m.id === modelId);
    this.selectedModel.set(model || null);
  }

  loadEquipment(): void {
    if (!this.equipmentId) return;

    this.isLoadingData.set(true);
    this.inventoryService.getEquipment(this.equipmentId).subscribe({
      next: (equipment) => {
        this.equipmentForm.patchValue({
          serialNumber: equipment.serialNumber,
          purchaseDate: equipment.purchaseDate ? new Date(equipment.purchaseDate) : null,
          name: equipment.name,
          brand: equipment.brand,
          model: equipment.model,
          category: equipment.category,
          specifications: equipment.specifications,
          basePrice: equipment.basePrice,
          imageUrl: equipment.imageUrl
        });
        this.isLoadingData.set(false);
      },
      error: () => {
        this.isLoadingData.set(false);
        this.notification.error('Error al cargar el equipo');
        this.router.navigate(['/admin/inventory']);
      }
    });
  }

  onSubmit(): void {
    if (this.equipmentForm.invalid) {
      this.equipmentForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const formValue = { ...this.equipmentForm.value };

    if (formValue.purchaseDate) {
      formValue.purchaseDate = formValue.purchaseDate.toISOString().split('T')[0];
    }

    if (this.isEditMode() && this.equipmentId) {
      this.inventoryService.updateEquipment(this.equipmentId, formValue).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.notification.success('Equipo actualizado correctamente');
          this.router.navigate(['/admin/inventory']);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          const message = error.error?.message || 'Error al actualizar el equipo';
          this.notification.error(message);
        }
      });
    } else {
      const createRequest = {
        productModelId: formValue.productModelId,
        serialNumber: formValue.serialNumber,
        purchaseDate: formValue.purchaseDate
      };

      this.inventoryService.createEquipment(createRequest).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.notification.success('Equipo creado correctamente');
          this.router.navigate(['/admin/inventory']);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          const message = error.error?.message || 'Error al crear el equipo';
          this.notification.error(message);
        }
      });
    }
  }
}
