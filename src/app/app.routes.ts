// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell.component/app-shell.component';
import { authGuard } from './core/guards/auth.guard';

export const APP_ROUTES: Routes = [
  // 🔐 Rutas públicas (login)
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then(m => m.LoginPage),
    title: 'Login',
    data: { breadcrumb: 'Login' },
  },

  // 🧱 Rutas de autenticación antigua (si las usas aún)
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadChildren: () =>
          import('./features/auth/login.routes').then(m => m.default),
        title: 'Login',
        data: { breadcrumb: 'Login' },
      },
    ],
  },

  // 🧭 App protegida (requiere sesión iniciada)
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(m => m.default),
        title: 'Dashboard',
        data: { icon: 'dashboard', breadcrumb: 'Dashboard' },
      },
      {
        path: 'catalog',
        loadChildren: () =>
          import('./features/catalog/catalog.routes').then(m => m.default),
        title: 'Catalog',
        data: { icon: 'store', breadcrumb: 'Catalog' },
      },
      {
        path: 'cart',
        loadChildren: () =>
          import('./features/cart/cart.routes').then(m => m.default),
        title: 'My Cart',
        data: { icon: 'shopping_cart', breadcrumb: 'Cart' },
      },
      {
        path: 'tickets',
        loadChildren: () =>
          import('./features/tickets/tickets.routes').then(m => m.default),
        title: 'Support Tickets',
        data: { icon: 'confirmation_number', breadcrumb: 'Tickets' },
      },
      {
        path: 'maintenance',
        loadChildren: () =>
          import('./features/maintenance/maintenance.routes').then(m => m.default),
        title: 'Maintenance',
        data: { icon: 'build', breadcrumb: 'Maintenance' },
      },
      {
        path: 'returns',
        loadChildren: () =>
          import('./features/returns/returns.routes').then(m => m.default),
        title: 'Returns',
        data: { icon: 'assignment_return', breadcrumb: 'Returns' },
      },
      {
        path: 'payments',
        loadChildren: () =>
          import('./features/payments/payments.routes').then(m => m.default),
        title: 'Payments & Invoices',
        data: { icon: 'payments', breadcrumb: 'Payments' },
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('./features/notifications/notifications.routes').then(m => m.default),
        title: 'Notifications',
        data: { icon: 'notifications', breadcrumb: 'Notifications' },
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./features/profile/profile.routes').then(m => m.default),
        title: 'My Profile',
        data: { icon: 'person', breadcrumb: 'Profile' },
      },
      {
        path: 'orders',
        loadChildren: () =>
          import('./features/orders/orders.routes').then(m => m.default),
        title: 'Pedidos',
        data: { icon: 'assignment', breadcrumb: 'Pedidos' },
      },
    ],
  },

  // 🚧 Fallback
  { path: '**', redirectTo: '' },
];
