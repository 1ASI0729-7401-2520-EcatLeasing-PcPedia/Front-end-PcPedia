// src/app/features/payments/payments.routes.ts
import { Routes } from '@angular/router';
import { PaymentsListPage } from './payments';
import { PaymentDetailPage } from './payment-detail';

export default [
  { path: '', component: PaymentsListPage, title: 'Pagos' },
  { path: ':id', component: PaymentDetailPage, title: 'Detalle de pago' },
] as Routes;
