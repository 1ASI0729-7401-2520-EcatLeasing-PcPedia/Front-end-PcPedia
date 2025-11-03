// src/app/features/maintenance/maintenance.routes.ts
import { Routes } from '@angular/router';
import { MaintenancePage } from './maintenance';
import { MaintenanceFormPage } from './maintenance-form.component';
import { MaintenanceDetailPage } from './maintenance-detail.component';

export default [
  { path: '', component: MaintenancePage, title: 'Mantenimientos' },
  { path: 'new', component: MaintenanceFormPage, title: 'Nueva solicitud' },
  { path: ':id', component: MaintenanceDetailPage, title: 'Detalle de mantenimiento' },
] as Routes;
