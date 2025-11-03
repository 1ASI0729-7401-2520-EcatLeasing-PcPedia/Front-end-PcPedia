// src/app/features/orders/orders.routes.ts
import { Routes } from '@angular/router';
import { OrdersListPage } from './orders';
import { OrderDetailPage} from './order-detail.component';
import { CheckoutPage } from './checkout';

export default [
  { path: '', component: OrdersListPage, title: 'Pedidos' },
  { path: 'checkout', component: CheckoutPage, title: 'Checkout' }, // 👈 esta es de FRONT
  { path: ':id', component: OrderDetailPage, title: 'Detalle de pedido' },
] as Routes;
