import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MaintenanceRepository} from '../../data-access/repositories';
import {PageHeaderComponent} from '../../shared/ui/page-header.component/page-header.component';

@Component({
  standalone: true,
  selector: 'pc-maintenance-form',
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, PageHeaderComponent],
  template: `
  <app-page-header title="Nueva solicitud de mantenimiento" />
  <form [formGroup]="form" (ngSubmit)="submit()" class="form">
    <mat-form-field appearance="outline">
      <mat-label>Equipo (deviceId)</mat-label>
      <input matInput formControlName="deviceId" placeholder="dev_001">
    </mat-form-field>

    <mat-form-field appearance="outline">
      <mat-label>Tipo</mat-label>
      <mat-select formControlName="kind">
        <mat-option value="incident">Incidente</mat-option>
        <mat-option value="preventive">Preventivo</mat-option>
      </mat-select>
    </mat-form-field>

    <mat-form-field appearance="outline">
      <mat-label>Prioridad</mat-label>
      <mat-select formControlName="priority">
        <mat-option value="low">Baja</mat-option>
        <mat-option value="medium">Media</mat-option>
        <mat-option value="high">Alta</mat-option>
        <mat-option value="urgent">Urgente</mat-option>
      </mat-select>
    </mat-form-field>

    <mat-form-field appearance="outline" class="full">
      <mat-label>Descripción</mat-label>
      <textarea matInput rows="4" formControlName="description"></textarea>
    </mat-form-field>

    <div class="actions">
      <button mat-stroked-button color="primary" routerLink="/maintenance">Cancelar</button>
      <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Crear ticket</button>
    </div>
  </form>
  `,
  styles: [`
  .form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;max-width:920px}
  .full{grid-column:1/-1}
  .actions{grid-column:1/-1;display:flex;gap:8px;justify-content:flex-end}
  `],
})
export class MaintenanceFormPage {
  private fb = inject(FormBuilder);
  private repo = inject(MaintenanceRepository);
  private router = inject(Router);

  private readonly customerId = 'cus_demo';
  private readonly requestedBy = 'sebastian@pcpedia.local';

  form = this.fb.group({
    deviceId: ['', Validators.required],
    kind: ['incident', Validators.required],
    priority: ['medium', Validators.required],
    description: ['', [Validators.required, Validators.minLength(8)]],
  });

  submit() {
    if (this.form.invalid) return;
    const v = this.form.value as any;
    this.repo.create({
      id: 'tmp', // no se usa, el repo genera/servidor asigna
      customerId: this.customerId,
      deviceId: v.deviceId,
      orderId: null,
      kind: v.kind,
      priority: v.priority,
      status: 'open',
      description: v.description,
      requestedBy: this.requestedBy,
      requestedAt: new Date().toISOString(),
      assignedTo: null,
      attachments: [],
      updates: [],
      rating: null,
      slaHours: 48,
      etaAt: null,
      closedAt: null,
    } as any).subscribe((created) => {
      this.router.navigate(['/maintenance', created.id]);
    });
  }
}
