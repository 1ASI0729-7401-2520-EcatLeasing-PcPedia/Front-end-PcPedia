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
import { ClientTicketService } from '../services/client-ticket.service';
import { MyEquipmentService } from '../../equipment/services/my-equipment.service';
import { MyEquipment } from '../../equipment/models/equipment.model';
import { TicketPriority } from '../../../../../shared/models/base.model';

@Component({
  selector: 'app-client-ticket-form',
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
      title="tickets.newTicket"
      subtitle="tickets.newTicketSubtitle"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/client/dashboard' },
        { label: 'menu.tickets', route: '/client/tickets' },
        { label: 'tickets.new' }
      ]">
    </app-page-header>

    <mat-card>
      <mat-card-content>
        @if (isLoadingEquipments()) {
          <app-loading-spinner></app-loading-spinner>
        } @else {
          <form [formGroup]="ticketForm" (ngSubmit)="submit()" class="ticket-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'tickets.equipment' | translate }}</mat-label>
              <mat-select formControlName="equipmentId">
                <mat-option [value]="null">{{ 'tickets.noEquipment' | translate }}</mat-option>
                @for (equipment of equipments(); track equipment.equipmentId) {
                  <mat-option [value]="equipment.equipmentId">
                    {{ equipment.name }} - {{ equipment.serialNumber || 'Sin S/N' }}
                  </mat-option>
                }
              </mat-select>
              <mat-hint>{{ 'tickets.equipmentHint' | translate }}</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'tickets.title' | translate }}</mat-label>
              <input matInput formControlName="title" maxlength="100">
              <mat-hint align="end">{{ ticketForm.get('title')?.value?.length || 0 }}/100</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'tickets.priority' | translate }}</mat-label>
              <mat-select formControlName="priority">
                @for (priority of priorities; track priority) {
                  <mat-option [value]="priority">{{ 'priority.' + priority | translate }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'tickets.description' | translate }}</mat-label>
              <textarea matInput formControlName="description" rows="6"
                        placeholder="{{ 'tickets.descriptionPlaceholder' | translate }}"></textarea>
            </mat-form-field>

            <div class="form-actions">
              <button mat-button type="button" routerLink="/client/tickets">
                {{ 'common.cancel' | translate }}
              </button>
              <button mat-raised-button color="primary" type="submit"
                      [disabled]="ticketForm.invalid || isSubmitting()">
                @if (isSubmitting()) {
                  <mat-icon class="spinning">sync</mat-icon>
                }
                {{ 'tickets.createTicket' | translate }}
              </button>
            </div>
          </form>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .ticket-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 600px;
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
  `]
})
export class ClientTicketFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ticketService = inject(ClientTicketService);
  private equipmentService = inject(MyEquipmentService);
  private notification = inject(NotificationService);

  equipments = signal<MyEquipment[]>([]);
  isLoadingEquipments = signal(false);
  isSubmitting = signal(false);

  priorities = Object.values(TicketPriority);

  ticketForm = this.fb.group({
    equipmentId: [null as number | null],
    title: ['', [Validators.required, Validators.maxLength(100)]],
    priority: [TicketPriority.MEDIUM, Validators.required],
    description: ['', Validators.required]
  });

  ngOnInit(): void {
    this.loadEquipments();

    // Pre-select equipment if provided in query params
    const equipmentId = this.route.snapshot.queryParamMap.get('equipmentId');
    if (equipmentId) {
      this.ticketForm.patchValue({ equipmentId: Number(equipmentId) });
    }
  }

  loadEquipments(): void {
    this.isLoadingEquipments.set(true);

    this.equipmentService.getMyEquipment().subscribe({
      next: (equipments) => {
        this.equipments.set(equipments);
        this.isLoadingEquipments.set(false);
      },
      error: () => {
        this.isLoadingEquipments.set(false);
      }
    });
  }

  submit(): void {
    if (this.ticketForm.invalid) return;

    this.isSubmitting.set(true);

    const formValue = this.ticketForm.value;
    const request = {
      equipmentId: formValue.equipmentId || undefined,
      title: formValue.title!,
      priority: formValue.priority!,
      description: formValue.description!
    };

    this.ticketService.createTicket(request).subscribe({
      next: () => {
        this.notification.success('Ticket creado exitosamente');
        this.router.navigate(['/client/tickets']);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.notification.error('Error al crear el ticket');
      }
    });
  }
}
