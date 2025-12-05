import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { CurrencyFormatPipe } from '../../../../../shared/pipes/currency-format.pipe';
import { NotificationService } from '../../../../../core/services/notification.service';
import { QuoteService } from '../services/quote.service';
import { RequestService } from '../../requests/services/request.service';
import { InventoryService } from '../../inventory/services/inventory.service';
import { Request } from '../../requests/models/request.model';
import { Equipment } from '../../inventory/models/equipment.model';

@Component({
  selector: 'app-admin-quote-form',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    TranslateModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    CurrencyFormatPipe
  ],
  template: `
    <app-page-header
      [title]="isEditMode ? 'quotes.editQuote' : 'quotes.newQuote'"
      [subtitle]="isEditMode ? 'quotes.editQuoteSubtitle' : 'quotes.newQuoteSubtitle'"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/admin/dashboard' },
        { label: 'menu.quotes', route: '/admin/quotes' },
        { label: isEditMode ? 'quotes.edit' : 'quotes.new' }
      ]">
    </app-page-header>

    <mat-card>
      <mat-card-content>
        @if (isLoadingData()) {
          <app-loading-spinner></app-loading-spinner>
        } @else {
          <form [formGroup]="quoteForm" (ngSubmit)="submit()" class="quote-form">
            @if (request()) {
              <div class="request-info">
                <h3>{{ 'quotes.requestInfo' | translate }}</h3>
                <p><strong>{{ 'requests.client' | translate }}:</strong> {{ request()!.userName }}</p>
                <p><strong>{{ 'users.company' | translate }}:</strong> {{ request()!.companyName || '-' }}</p>
                <p><strong>{{ 'requests.duration' | translate }}:</strong> {{ request()!.durationMonths }} {{ 'common.months' | translate }}</p>
                @if (request()!.items && request()!.items.length > 0) {
                  <p><strong>{{ 'requests.items' | translate }}:</strong></p>
                  <ul class="request-items">
                    @for (item of request()!.items; track item.id) {
                      <li>{{ item.equipmentName }} ({{ item.equipmentBrand }} {{ item.equipmentModel }}) x {{ item.quantity }}</li>
                    }
                  </ul>
                }
              </div>
              <mat-divider></mat-divider>
            }

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'quotes.duration' | translate }}</mat-label>
                <input matInput type="number" formControlName="durationMonths" min="1">
                <span matSuffix>meses</span>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'quotes.validUntil' | translate }}</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="validUntil">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>
            </div>

            <h3>{{ 'quotes.items' | translate }}</h3>

            <div formArrayName="items" class="items-container">
              @for (item of itemsArray.controls; track i; let i = $index) {
                <div [formGroupName]="i" class="item-row">
                  <mat-form-field appearance="outline" class="equipment-field">
                    <mat-label>{{ 'quotes.equipment' | translate }}</mat-label>
                    <mat-select formControlName="equipmentId" (selectionChange)="onEquipmentChange(i)">
                      @for (equipment of getEquipmentOptions(i); track equipment.id) {
                        <mat-option [value]="equipment.id">
                          {{ equipment.serialNumber }} - {{ equipment.name }} - {{ equipment.brand }} {{ equipment.model }}
                        </mat-option>
                      }
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="quantity-field">
                    <mat-label>{{ 'quotes.quantity' | translate }}</mat-label>
                    <input matInput type="number" formControlName="quantity" min="1" max="1" readonly>
                    <mat-hint>1 equipo por item</mat-hint>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="price-field">
                    <mat-label>{{ 'quotes.monthlyPrice' | translate }}</mat-label>
                    <span matPrefix>S/ </span>
                    <input matInput type="number" formControlName="monthlyPrice" min="0" step="0.01">
                  </mat-form-field>

                  <span class="subtotal">
                    {{ calculateSubtotal(i) | currencyFormat }}
                  </span>

                  <button mat-icon-button type="button" color="warn" (click)="removeItem(i)"
                          [disabled]="itemsArray.length === 1">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              }
            </div>

            <button mat-stroked-button type="button" (click)="addItem()">
              <mat-icon>add</mat-icon>
              {{ 'quotes.addItem' | translate }}
            </button>

            <mat-divider></mat-divider>

            <div class="totals">
              <div class="total-row">
                <span>{{ 'quotes.monthlyTotal' | translate }}:</span>
                <span class="amount">{{ calculateTotalMonthly() | currencyFormat }}</span>
              </div>
              <div class="total-row grand-total">
                <span>{{ 'quotes.totalAmount' | translate }} ({{ quoteForm.get('durationMonths')?.value || 0 }} meses):</span>
                <span class="amount">{{ calculateGrandTotal() | currencyFormat }}</span>
              </div>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'quotes.notes' | translate }}</mat-label>
              <textarea matInput formControlName="notes" rows="3"></textarea>
            </mat-form-field>

            <div class="form-actions">
              <button mat-button type="button" routerLink="/admin/quotes">
                {{ 'common.cancel' | translate }}
              </button>
              <button mat-raised-button color="primary" type="submit"
                      [disabled]="quoteForm.invalid || isSubmitting()">
                @if (isSubmitting()) {
                  <mat-icon class="spinning">sync</mat-icon>
                }
                {{ (isEditMode ? 'quotes.updateQuote' : 'quotes.createQuote') | translate }}
              </button>
            </div>
          </form>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .quote-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 900px;
    }

    .request-info {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 8px;
    }

    .request-info h3 {
      margin: 0 0 8px 0;
    }

    .request-info p {
      margin: 4px 0;
    }

    .request-items {
      margin: 8px 0 0 0;
      padding-left: 20px;
    }

    .request-items li {
      margin: 4px 0;
      font-size: 14px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .items-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;
    }

    .item-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .equipment-field {
      flex: 2;
    }

    .quantity-field {
      width: 100px;
    }

    .price-field {
      width: 150px;
    }

    .subtotal {
      min-width: 100px;
      text-align: right;
      font-weight: 500;
      color: #1a3458;
    }

    .full-width {
      width: 100%;
    }

    .totals {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .grand-total {
      font-size: 18px;
      font-weight: 600;
      border-top: 1px solid rgba(0,0,0,0.12);
      padding-top: 8px;
    }

    .amount {
      font-weight: 500;
      color: #1a3458;
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

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .item-row {
        flex-wrap: wrap;
      }

      .equipment-field {
        flex: 1 1 100%;
      }
    }
  `]
})
export class AdminQuoteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private quoteService = inject(QuoteService);
  private requestService = inject(RequestService);
  private inventoryService = inject(InventoryService);
  private notification = inject(NotificationService);

  request = signal<Request | null>(null);
  availableEquipments = signal<Equipment[]>([]);
  isLoadingData = signal(false);
  isSubmitting = signal(false);

  quoteForm = this.fb.group({
    requestId: [0, Validators.required],
    durationMonths: [12, [Validators.required, Validators.min(1)]],
    validUntil: [this.getDefaultValidUntil(), Validators.required],
    items: this.fb.array([]),
    notes: ['']
  });

  get itemsArray(): FormArray {
    return this.quoteForm.get('items') as FormArray;
  }

  isEditMode = false;
  quoteId = 0;

  ngOnInit(): void {
    // Check if editing existing quote
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.quoteId = Number(id);
      this.loadQuote(this.quoteId);
    } else {
      const requestId = this.route.snapshot.queryParamMap.get('requestId');
      if (requestId) {
        this.quoteForm.patchValue({ requestId: Number(requestId) });
        this.loadRequest(Number(requestId));
      } else {
        this.addItem();
      }
    }
    this.loadEquipments();
  }

  loadQuote(id: number): void {
    this.isLoadingData.set(true);

    this.quoteService.getQuote(id).subscribe({
      next: (quote) => {
        this.quoteForm.patchValue({
          requestId: quote.requestId,
          durationMonths: quote.durationMonths,
          validUntil: new Date(quote.validUntil),
          notes: quote.terms || ''
        });

        // Load items
        this.itemsArray.clear();
        quote.items.forEach(item => {
          const units = Math.max(1, item.quantity || 1);
          for (let i = 0; i < units; i++) {
            this.itemsArray.push(this.fb.group({
              equipmentId: [i === 0 ? item.equipmentId : null, Validators.required],
              quantity: [1, [Validators.required, Validators.min(1), Validators.max(1)]],
              monthlyPrice: [item.unitPrice, [Validators.required, Validators.min(0)]]
            }));
          }
        });

        if (this.itemsArray.length === 0) {
          this.addItem();
        }

        // Load request info
        if (quote.requestId) {
          this.loadRequest(quote.requestId);
        }

        this.isLoadingData.set(false);
      },
      error: () => {
        this.isLoadingData.set(false);
        this.notification.error('Error al cargar la cotización');
        this.router.navigate(['/admin/quotes']);
      }
    });
  }

  private getDefaultValidUntil(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 15);
    return date;
  }

  loadRequest(id: number): void {
    this.isLoadingData.set(true);

    this.requestService.getRequest(id).subscribe({
      next: (request) => {
        this.request.set(request);
        this.quoteForm.patchValue({ durationMonths: request.durationMonths });

        // Pre-fill items from request
        if (request.items && request.items.length > 0) {
          this.itemsArray.clear();
          request.items.forEach(item => {
            const units = Math.max(1, item.quantity || 1);
            for (let i = 0; i < units; i++) {
              this.itemsArray.push(this.fb.group({
                equipmentId: [null, Validators.required],
                quantity: [1, [Validators.required, Validators.min(1), Validators.max(1)]],
                monthlyPrice: [0, [Validators.required, Validators.min(0)]]
              }));
            }
          });
        }

        if (this.itemsArray.length === 0) {
          this.addItem();
        }

        this.isLoadingData.set(false);
      },
      error: () => {
        this.isLoadingData.set(false);
        this.notification.error('Error al cargar la solicitud');
      }
    });
  }

  loadEquipments(): void {
    this.inventoryService.getEquipments({ page: 0, size: 100, status: 'AVAILABLE' }).subscribe({
      next: (page) => {
        // Solo conservar disponibles; si la API no filtra por estado, filtramos aquí.
        this.availableEquipments.set(page.content.filter(eq => eq.status === 'AVAILABLE'));
      },
      error: () => {
        this.notification.error('Error al cargar los equipos');
      }
    });
  }

  addItem(): void {
    this.itemsArray.push(this.fb.group({
      equipmentId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1), Validators.max(1)]],
      monthlyPrice: [0, [Validators.required, Validators.min(0)]]
    }));
  }

  removeItem(index: number): void {
    if (this.itemsArray.length > 1) {
      this.itemsArray.removeAt(index);
    }
  }

  onEquipmentChange(index: number): void {
    const control = this.itemsArray.at(index);
    const equipmentId = control.get('equipmentId')?.value;
    const equipment = this.availableEquipments().find(e => e.id === equipmentId);

    if (equipment?.monthlyPrice) {
      control.patchValue({ monthlyPrice: equipment.monthlyPrice });
    }
  }

  calculateSubtotal(index: number): number {
    const item = this.itemsArray.at(index);
    const quantity = item.get('quantity')?.value || 0;
    const price = item.get('monthlyPrice')?.value || 0;
    return quantity * price;
  }

  calculateTotalMonthly(): number {
    let total = 0;
    for (let i = 0; i < this.itemsArray.length; i++) {
      total += this.calculateSubtotal(i);
    }
    return total;
  }

  calculateGrandTotal(): number {
    const months = this.quoteForm.get('durationMonths')?.value || 0;
    return this.calculateTotalMonthly() * months;
  }

  getEquipmentOptions(currentIndex: number): Equipment[] {
    const selectedIds = this.itemsArray.controls
      .map((ctrl, idx) => idx === currentIndex ? null : ctrl.get('equipmentId')?.value)
      .filter((id): id is number => !!id);

    const currentSelected = this.itemsArray.at(currentIndex).get('equipmentId')?.value;

    return this.availableEquipments().filter(eq => {
      const isSame = currentSelected === eq.id;
      const isAvailable = eq.status === 'AVAILABLE';
      return (isAvailable && !selectedIds.includes(eq.id)) || isSame;
    });
  }

  submit(): void {
    if (this.quoteForm.invalid) return;

    this.isSubmitting.set(true);

    const formValue = this.quoteForm.value;
    const request = {
      requestId: formValue.requestId!,
      items: formValue.items!.map((item: any) => ({
        equipmentId: item.equipmentId,
        quantity: item.quantity,
        unitPrice: item.monthlyPrice
      })),
      durationMonths: formValue.durationMonths!,
      validUntil: new Date(formValue.validUntil!).toISOString().split('T')[0],
      notes: formValue.notes || undefined
    };

    if (this.isEditMode) {
      this.quoteService.updateQuote(this.quoteId, request).subscribe({
        next: () => {
          this.notification.success('Cotización actualizada exitosamente');
          this.router.navigate(['/admin/quotes', this.quoteId]);
        },
        error: () => {
          this.isSubmitting.set(false);
          this.notification.error('Error al actualizar la cotización');
        }
      });
    } else {
      this.quoteService.createQuote(request).subscribe({
        next: (quoteId) => {
          this.notification.success('Cotización creada exitosamente');
          this.router.navigate(['/admin/quotes', quoteId]);
        },
        error: () => {
          this.isSubmitting.set(false);
          this.notification.error('Error al crear la cotización');
        }
      });
    }
  }
}
