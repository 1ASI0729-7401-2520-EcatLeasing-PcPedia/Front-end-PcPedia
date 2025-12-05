import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { NotificationService } from '../../../../../core/services/notification.service';
import { ProductModelService } from '../services/product-model.service';
import { ProductModel } from '../models/product-model.model';

@Component({
  selector: 'app-add-equipment',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    TranslateModule,
    PageHeaderComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <app-page-header
      title="Agregar Equipos por Lote"
      [subtitle]="productModel()?.name || 'Cargando...'"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/admin/dashboard' },
        { label: 'Modelos', route: '/admin/product-models' },
        { label: 'Agregar Equipos' }
      ]">
    </app-page-header>

    <mat-card>
      <mat-card-content>
        @if (isLoading()) {
          <app-loading-spinner></app-loading-spinner>
        } @else if (productModel()) {
          <div class="model-info">
            <h3>Modelo: {{ productModel()!.name }}</h3>
            <p>{{ productModel()!.brand }} {{ productModel()!.model }}</p>
            <p>Stock actual: {{ productModel()!.totalEquipments }} equipos ({{ productModel()!.availableEquipments }} disponibles)</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="form-container">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Fecha de Compra</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="purchaseDate">
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Números de Serie (uno por línea)</mat-label>
              <textarea matInput formControlName="serialNumbers" rows="10"
                        placeholder="ABC123&#10;DEF456&#10;GHI789"></textarea>
              <mat-hint>Ingresa cada número de serie en una línea separada</mat-hint>
            </mat-form-field>

            @if (parsedSerials().length > 0) {
              <div class="serial-preview">
                <h4>Vista previa: {{ parsedSerials().length }} equipos a crear</h4>
                <div class="serial-chips">
                  @for (serial of parsedSerials().slice(0, 20); track serial) {
                    <mat-chip>{{ serial }}</mat-chip>
                  }
                  @if (parsedSerials().length > 20) {
                    <mat-chip>+{{ parsedSerials().length - 20 }} más</mat-chip>
                  }
                </div>
              </div>
            }

            <div class="form-actions">
              <button mat-button type="button" routerLink="/admin/product-models">
                {{ 'common.cancel' | translate }}
              </button>
              <button mat-raised-button color="primary" type="submit"
                      [disabled]="form.invalid || parsedSerials().length === 0 || isSubmitting()">
                @if (isSubmitting()) {
                  <mat-icon class="spinning">sync</mat-icon>
                }
                Crear {{ parsedSerials().length }} Equipos
              </button>
            </div>
          </form>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .model-info {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .model-info h3 {
      margin: 0 0 8px 0;
    }

    .model-info p {
      margin: 4px 0;
      color: rgba(0,0,0,0.6);
    }

    .form-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 800px;
    }

    .full-width {
      width: 100%;
    }

    .serial-preview {
      background: #e3f2fd;
      padding: 16px;
      border-radius: 8px;
    }

    .serial-preview h4 {
      margin: 0 0 12px 0;
    }

    .serial-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
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
  `]
})
export class AddEquipmentComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productModelService = inject(ProductModelService);
  private notification = inject(NotificationService);

  productModel = signal<ProductModel | null>(null);
  isLoading = signal(false);
  isSubmitting = signal(false);
  parsedSerials = signal<string[]>([]);

  modelId = 0;

  form = this.fb.group({
    purchaseDate: [new Date()],
    serialNumbers: ['', Validators.required]
  });

  ngOnInit(): void {
    this.modelId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadModel();

    // Watch for changes in serial numbers
    this.form.get('serialNumbers')?.valueChanges.subscribe(value => {
      this.parseSerials(value || '');
    });
  }

  loadModel(): void {
    this.isLoading.set(true);

    this.productModelService.getProductModel(this.modelId).subscribe({
      next: (model) => {
        this.productModel.set(model);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.error('Error al cargar el modelo');
        this.router.navigate(['/admin/product-models']);
      }
    });
  }

  parseSerials(text: string): void {
    const serials = text
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    this.parsedSerials.set(serials);
  }

  submit(): void {
    if (this.form.invalid || this.parsedSerials().length === 0) return;

    this.isSubmitting.set(true);

    const formValue = this.form.value;
    const purchaseDate = formValue.purchaseDate
      ? new Date(formValue.purchaseDate).toISOString().split('T')[0]
      : undefined;

    this.productModelService.createEquipmentBatch({
      productModelId: this.modelId,
      serialNumbers: this.parsedSerials(),
      purchaseDate
    }).subscribe({
      next: (count) => {
        this.notification.success(`Se crearon ${count} equipos exitosamente`);
        this.router.navigate(['/admin/product-models']);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        const message = error.error?.message || 'Error al crear los equipos';
        this.notification.error(message);
      }
    });
  }
}
