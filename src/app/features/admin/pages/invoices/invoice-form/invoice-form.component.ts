import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { InputErrorComponent } from '../../../../../shared/components/forms/input-error/input-error.component';
import { CurrencyFormatPipe } from '../../../../../shared/pipes/currency-format.pipe';
import { NotificationService } from '../../../../../core/services/notification.service';
import { InvoiceService } from '../services/invoice.service';
import { ContractService } from '../../contracts/services/contract.service';
import { Contract } from '../../contracts/models/contract.model';

@Component({
  selector: 'app-admin-invoice-form',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslateModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    InputErrorComponent,
    CurrencyFormatPipe
  ],
  template: `
    <app-page-header
      title="invoices.generateInvoice"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/admin/dashboard' },
        { label: 'menu.invoices', route: '/admin/invoices' },
        { label: 'invoices.new' }
      ]">
    </app-page-header>

    @if (isLoading()) {
      <app-loading-spinner></app-loading-spinner>
    } @else {
      <div class="form-container">
        @if (contract()) {
        <mat-card class="contract-info">
          <mat-card-header>
            <mat-card-title>Contrato: {{ contract()!.contractNumber }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Cliente</span>
                <span class="value">{{ contract()!.userName }}</span>
              </div>
              <div class="info-item">
                <span class="label">Empresa</span>
                <span class="value">{{ contract()!.userCompany || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Total Mensual</span>
                <span class="value">{{ contract()!.totalMonthly | currencyFormat }}</span>
              </div>
              <div class="info-item">
                <span class="label">Duración</span>
                <span class="value">{{ contract()!.durationMonths }} meses</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
        }

        <mat-card>
          <mat-card-header>
            <mat-card-title>Datos de la Factura</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="invoiceForm" (ngSubmit)="onSubmit()">
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Fecha de Emisión</mat-label>
                  <input matInput [matDatepicker]="issuePicker" formControlName="issueDate">
                  <mat-datepicker-toggle matIconSuffix [for]="issuePicker"></mat-datepicker-toggle>
                  <mat-datepicker #issuePicker></mat-datepicker>
                  <mat-error>
                    <app-input-error [control]="invoiceForm.get('issueDate')"></app-input-error>
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Fecha de Vencimiento</mat-label>
                  <input matInput [matDatepicker]="duePicker" formControlName="dueDate">
                  <mat-datepicker-toggle matIconSuffix [for]="duePicker"></mat-datepicker-toggle>
                  <mat-datepicker #duePicker></mat-datepicker>
                  <mat-error>
                    <app-input-error [control]="invoiceForm.get('dueDate')"></app-input-error>
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Monto</mat-label>
                  <input matInput type="number" formControlName="amount" min="0" step="0.01">
                  <span matTextPrefix>S/. &nbsp;</span>
                  <mat-error>
                    <app-input-error [control]="invoiceForm.get('amount')"></app-input-error>
                  </mat-error>
                  <mat-hint>Por defecto: monto mensual del contrato</mat-hint>
                </mat-form-field>
              </div>

              <div class="form-actions">
                <button mat-stroked-button type="button" routerLink="/admin/invoices">
                  {{ 'common.cancel' | translate }}
                </button>
                <button mat-raised-button color="primary" type="submit" [disabled]="isSubmitting()">
                  @if (isSubmitting()) {
                    <mat-spinner diameter="20"></mat-spinner>
                  } @else {
                    <mat-icon>receipt</mat-icon>
                    Generar Factura
                  }
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    }
  `,
  styles: [`
    .form-container {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .contract-info {
      background: #f5f5f5;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      padding: 16px 0;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .label {
      font-size: 12px;
      color: rgba(0,0,0,0.6);
      text-transform: uppercase;
    }

    .value {
      font-size: 16px;
      font-weight: 500;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      padding: 16px 0;
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
export class AdminInvoiceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private invoiceService = inject(InvoiceService);
  private contractService = inject(ContractService);
  private notification = inject(NotificationService);

  isLoading = signal(false);
  isSubmitting = signal(false);
  contract = signal<Contract | null>(null);
  contractId: number | null = null;

  invoiceForm: FormGroup = this.fb.group({
    issueDate: [new Date(), [Validators.required]],
    dueDate: [this.getDefaultDueDate(), [Validators.required]],
    amount: [0, [Validators.required, Validators.min(0.01)]]
  });

  ngOnInit(): void {
    this.contractId = Number(this.route.snapshot.queryParamMap.get('contractId'));

    if (!this.contractId || isNaN(this.contractId)) {
      this.notification.error('Debe seleccionar un contrato para generar la factura');
      this.router.navigate(['/admin/contracts']);
      return;
    }

    this.loadContract();
  }

  loadContract(): void {
    if (!this.contractId) return;

    this.isLoading.set(true);
    this.contractService.getContract(this.contractId).subscribe({
      next: (contract) => {
        this.contract.set(contract);
        this.invoiceForm.patchValue({
          amount: contract.totalMonthly
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.error('Error al cargar el contrato');
        this.router.navigate(['/admin/contracts']);
      }
    });
  }

  getDefaultDueDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  }

  onSubmit(): void {
    if (this.invoiceForm.invalid || !this.contractId) {
      this.invoiceForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.invoiceForm.value;
    const request = {
      contractId: this.contractId,
      issueDate: formValue.issueDate.toISOString().split('T')[0],
      dueDate: formValue.dueDate.toISOString().split('T')[0],
      amount: formValue.amount
    };

    this.invoiceService.createInvoice(request).subscribe({
      next: (invoiceId) => {
        this.isSubmitting.set(false);
        this.notification.success('Factura generada correctamente');
        this.router.navigate(['/admin/invoices', invoiceId]);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        const message = error.error?.message || 'Error al generar la factura';
        this.notification.error(message);
      }
    });
  }
}
