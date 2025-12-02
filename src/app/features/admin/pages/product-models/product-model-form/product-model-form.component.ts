import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { NotificationService } from '../../../../../core/services/notification.service';
import { ProductModelService } from '../services/product-model.service';

@Component({
  selector: 'app-product-model-form',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TranslateModule,
    PageHeaderComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <app-page-header
      [title]="isEditMode ? 'Editar Modelo' : 'Nuevo Modelo'"
      [subtitle]="isEditMode ? 'Modifica los datos del modelo' : 'Crea un nuevo modelo de producto'"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/admin/dashboard' },
        { label: 'Modelos', route: '/admin/product-models' },
        { label: isEditMode ? 'Editar' : 'Nuevo' }
      ]">
    </app-page-header>

    <mat-card>
      <mat-card-content>
        @if (isLoading()) {
          <app-loading-spinner></app-loading-spinner>
        } @else {
          <form [formGroup]="form" (ngSubmit)="submit()" class="form-container">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nombre</mat-label>
              <input matInput formControlName="name" placeholder="Ej: HP ProBook 450 G8">
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Marca</mat-label>
                <input matInput formControlName="brand" placeholder="Ej: HP">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Modelo</mat-label>
                <input matInput formControlName="model" placeholder="Ej: ProBook 450 G8">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Categoría</mat-label>
                <mat-select formControlName="category">
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

              <mat-form-field appearance="outline">
                <mat-label>Precio Base Mensual</mat-label>
                <span matPrefix>S/ </span>
                <input matInput type="number" formControlName="basePrice" min="0" step="0.01">
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Especificaciones</mat-label>
              <textarea matInput formControlName="specifications" rows="4"
                        placeholder="Intel Core i5, 16GB RAM, 512GB SSD..."></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>URL de Imagen</mat-label>
              <input matInput formControlName="imageUrl" placeholder="https://...">
            </mat-form-field>

            <div class="form-actions">
              <button mat-button type="button" routerLink="/admin/product-models">
                {{ 'common.cancel' | translate }}
              </button>
              <button mat-raised-button color="primary" type="submit"
                      [disabled]="form.invalid || isSubmitting()">
                @if (isSubmitting()) {
                  <mat-icon class="spinning">sync</mat-icon>
                }
                {{ 'common.save' | translate }}
              </button>
            </div>
          </form>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 800px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding-top: 16px;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (max-width: 600px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProductModelFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productModelService = inject(ProductModelService);
  private notification = inject(NotificationService);

  isLoading = signal(false);
  isSubmitting = signal(false);
  isEditMode = false;
  modelId = 0;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    brand: ['', Validators.maxLength(100)],
    model: ['', Validators.maxLength(100)],
    category: [''],
    specifications: [''],
    basePrice: [0],
    imageUrl: ['', Validators.maxLength(500)]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.modelId = Number(id);
      this.loadModel();
    }
  }

  loadModel(): void {
    this.isLoading.set(true);

    this.productModelService.getProductModel(this.modelId).subscribe({
      next: (model) => {
        this.form.patchValue({
          name: model.name,
          brand: model.brand || '',
          model: model.model || '',
          category: model.category || '',
          specifications: model.specifications || '',
          basePrice: model.basePrice || 0,
          imageUrl: model.imageUrl || ''
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.error('Error al cargar el modelo');
        this.router.navigate(['/admin/product-models']);
      }
    });
  }

  submit(): void {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    const formValue = this.form.value;

    const request = {
      name: formValue.name!,
      brand: formValue.brand || undefined,
      model: formValue.model || undefined,
      category: formValue.category || undefined,
      specifications: formValue.specifications || undefined,
      basePrice: formValue.basePrice || undefined,
      imageUrl: formValue.imageUrl || undefined
    };

    if (this.isEditMode) {
      this.productModelService.updateProductModel(this.modelId, request).subscribe({
        next: () => {
          this.notification.success('Modelo actualizado exitosamente');
          this.router.navigate(['/admin/product-models']);
        },
        error: () => {
          this.isSubmitting.set(false);
          this.notification.error('Error al actualizar el modelo');
        }
      });
    } else {
      this.productModelService.createProductModel(request).subscribe({
        next: () => {
          this.notification.success('Modelo creado exitosamente');
          this.router.navigate(['/admin/product-models']);
        },
        error: () => {
          this.isSubmitting.set(false);
          this.notification.error('Error al crear el modelo');
        }
      });
    }
  }
}
