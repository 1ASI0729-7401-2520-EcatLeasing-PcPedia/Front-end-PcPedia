import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { PageHeaderComponent } from '../../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { CurrencyFormatPipe } from '../../../../../shared/pipes/currency-format.pipe';
import { NotificationService } from '../../../../../core/services/notification.service';
import { ContractService } from '../services/contract.service';
import { QuoteService } from '../../quotes/services/quote.service';
import { Quote } from '../../quotes/models/quote.model';

@Component({
  selector: 'app-admin-contract-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    TranslateModule,
    DatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    CurrencyFormatPipe
  ],
  template: `
    <app-page-header
      title="contracts.newContract"
      subtitle="contracts.newContractSubtitle"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/admin/dashboard' },
        { label: 'menu.contracts', route: '/admin/contracts' },
        { label: 'contracts.new' }
      ]">
    </app-page-header>

    @if (isLoading()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (!quote()) {
      <mat-card>
        <mat-card-content>
          <div class="error-state">
            <mat-icon>error_outline</mat-icon>
            <h3>{{ 'contracts.noQuoteSelected' | translate }}</h3>
            <p>{{ 'contracts.selectQuoteMessage' | translate }}</p>
            <button mat-raised-button color="primary" routerLink="/admin/quotes">
              {{ 'contracts.goToQuotes' | translate }}
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    } @else {
      <div class="form-container">
        <mat-card class="quote-info-card">
          <mat-card-header>
            <mat-card-title>{{ 'contracts.quoteInfo' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">{{ 'quotes.quoteNumber' | translate }}</span>
                <span class="value">COT-{{ quote()!.id.toString().padStart(4, '0') }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ 'quotes.client' | translate }}</span>
                <span class="value">{{ quote()!.userName }}</span>
              </div>
              @if (quote()!.companyName) {
                <div class="info-item">
                  <span class="label">{{ 'users.company' | translate }}</span>
                  <span class="value">{{ quote()!.companyName }}</span>
                </div>
              }
              <div class="info-item">
                <span class="label">{{ 'quotes.monthlyTotal' | translate }}</span>
                <span class="value price">{{ quote()!.totalMonthly | currencyFormat }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ 'quotes.duration' | translate }}</span>
                <span class="value">{{ quote()!.durationMonths }} meses</span>
              </div>
              <div class="info-item">
                <span class="label">{{ 'quotes.totalAmount' | translate }}</span>
                <span class="value price">{{ quote()!.totalMonthly * quote()!.durationMonths | currencyFormat }}</span>
              </div>
            </div>

            <mat-divider></mat-divider>

            <h4>{{ 'quotes.items' | translate }}</h4>
            <ul class="items-list">
              @for (item of quote()!.items; track item.id) {
                <li>
                  <strong>{{ item.equipmentName }}</strong>
                  @if (item.equipmentBrand || item.equipmentModel) {
                    ({{ item.equipmentBrand }} {{ item.equipmentModel }})
                  }
                  - {{ item.quantity }} unidad(es) x {{ item.unitPrice | currencyFormat }}
                </li>
              }
            </ul>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ 'contracts.contractDetails' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="contractForm" (ngSubmit)="submit()" class="contract-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'contracts.startDate' | translate }}</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="startDate">
                <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-hint>{{ 'contracts.startDateHint' | translate }}</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'contracts.terms' | translate }}</mat-label>
                <textarea matInput formControlName="terms" rows="4"
                          placeholder="{{ 'contracts.termsPlaceholder' | translate }}"></textarea>
                <mat-hint>{{ 'contracts.termsHint' | translate }}</mat-hint>
              </mat-form-field>

              <div class="contract-summary">
                <div class="summary-item">
                  <span>{{ 'contracts.startDate' | translate }}:</span>
                  <span>{{ contractForm.get('startDate')?.value | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="summary-item">
                  <span>{{ 'contracts.endDate' | translate }}:</span>
                  <span>{{ getEndDate() | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="summary-item">
                  <span>{{ 'contracts.duration' | translate }}:</span>
                  <span>{{ quote()!.durationMonths }} meses</span>
                </div>
              </div>

              <div class="form-actions">
                <button mat-button type="button" routerLink="/admin/quotes">
                  {{ 'common.cancel' | translate }}
                </button>
                <button mat-raised-button color="primary" type="submit"
                        [disabled]="contractForm.invalid || isSubmitting()">
                  @if (isSubmitting()) {
                    <mat-icon class="spinning">sync</mat-icon>
                  }
                  {{ 'contracts.createContract' | translate }}
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
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .error-state {
      text-align: center;
      padding: 48px;
    }

    .error-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ff9800;
    }

    .error-state h3 {
      margin: 16px 0 8px;
    }

    .error-state p {
      color: rgba(0,0,0,0.6);
      margin-bottom: 24px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
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

    .value.price {
      color: #1a3458;
    }

    .items-list {
      margin: 16px 0;
      padding-left: 20px;
    }

    .items-list li {
      margin-bottom: 8px;
    }

    h4 {
      margin: 16px 0 8px;
      color: rgba(0,0,0,0.6);
    }

    .contract-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 16px;
    }

    .full-width {
      width: 100%;
    }

    .contract-summary {
      background: rgba(0,0,0,0.04);
      padding: 16px;
      border-radius: 4px;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
    }

    .summary-item:not(:last-child) {
      border-bottom: 1px solid rgba(0,0,0,0.1);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      padding-top: 16px;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (max-width: 1024px) {
      .form-container {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminContractFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private contractService = inject(ContractService);
  private quoteService = inject(QuoteService);
  private notification = inject(NotificationService);

  quote = signal<Quote | null>(null);
  isLoading = signal(false);
  isSubmitting = signal(false);

  contractForm: FormGroup = this.fb.group({
    startDate: [new Date(), Validators.required],
    terms: ['']
  });

  ngOnInit(): void {
    const quoteId = this.route.snapshot.queryParamMap.get('quoteId');
    if (quoteId) {
      this.loadQuote(Number(quoteId));
    }
  }

  loadQuote(id: number): void {
    this.isLoading.set(true);

    this.quoteService.getQuote(id).subscribe({
      next: (quote) => {
        if (quote.status !== 'ACCEPTED') {
          this.notification.error('Solo se pueden crear contratos de cotizaciones aceptadas');
          this.router.navigate(['/admin/quotes']);
          return;
        }
        this.quote.set(quote);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.error('Error al cargar la cotización');
        this.router.navigate(['/admin/quotes']);
      }
    });
  }

  getEndDate(): Date | null {
    const startDate = this.contractForm.get('startDate')?.value;
    const quote = this.quote();
    if (!startDate || !quote) return null;

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + quote.durationMonths);
    return endDate;
  }

  submit(): void {
    if (this.contractForm.invalid || !this.quote()) return;

    this.isSubmitting.set(true);

    const formValue = this.contractForm.value;
    const request = {
      quoteId: this.quote()!.id,
      startDate: new Date(formValue.startDate).toISOString().split('T')[0],
      terms: formValue.terms || undefined
    };

    this.contractService.createContract(request).subscribe({
      next: (contractId: number) => {
        this.notification.success('Contrato creado exitosamente');
        this.router.navigate(['/admin/contracts', contractId]);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.notification.error('Error al crear el contrato');
      }
    });
  }
}
