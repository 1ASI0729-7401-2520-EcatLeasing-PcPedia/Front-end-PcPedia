import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/guards/auth.guard';
import { adminGuard } from '../../core/auth/guards/admin.guard';
import { AdminLayoutComponent } from './layout/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.AdminDashboardComponent)
      },
      // Users
      {
        path: 'users',
        loadComponent: () => import('./pages/users/user-list/user-list.component').then(m => m.UserListComponent)
      },
      {
        path: 'users/new',
        loadComponent: () => import('./pages/users/user-form/user-form.component').then(m => m.UserFormComponent)
      },
      {
        path: 'users/:id',
        loadComponent: () => import('./pages/users/user-detail/user-detail.component').then(m => m.UserDetailComponent)
      },
      {
        path: 'users/:id/edit',
        loadComponent: () => import('./pages/users/user-form/user-form.component').then(m => m.UserFormComponent)
      },
      // Inventory
      {
        path: 'inventory',
        loadComponent: () => import('./pages/inventory/inventory-list/inventory-list.component').then(m => m.InventoryListComponent)
      },
      {
        path: 'inventory/new',
        loadComponent: () => import('./pages/inventory/inventory-form/inventory-form.component').then(m => m.InventoryFormComponent)
      },
      {
        path: 'inventory/:id',
        loadComponent: () => import('./pages/inventory/inventory-list/inventory-list.component').then(m => m.InventoryListComponent)
      },
      {
        path: 'inventory/:id/edit',
        loadComponent: () => import('./pages/inventory/inventory-form/inventory-form.component').then(m => m.InventoryFormComponent)
      },
            // Product Models
      {
        path: 'product-models',
        loadComponent: () => import('./pages/product-models/product-model-list/product-model-list.component').then(m => m.ProductModelListComponent)
      },
      {
        path: 'product-models/new',
        loadComponent: () => import('./pages/product-models/product-model-form/product-model-form.component').then(m => m.ProductModelFormComponent)
      },
      {
        path: 'product-models/:id/edit',
        loadComponent: () => import('./pages/product-models/product-model-form/product-model-form.component').then(m => m.ProductModelFormComponent)
      },
      {
        path: 'product-models/:id/add-equipment',
        loadComponent: () => import('./pages/product-models/add-equipment/add-equipment.component').then(m => m.AddEquipmentComponent)
      },
      // Requests
      {
        path: 'requests',
        loadComponent: () => import('./pages/requests/request-list/request-list.component').then(m => m.RequestListComponent)
      },
      {
        path: 'requests/:id',
        loadComponent: () => import('./pages/requests/request-detail/request-detail.component').then(m => m.AdminRequestDetailComponent)
      },
      // Quotes
      {
        path: 'quotes',
        loadComponent: () => import('./pages/quotes/quote-list/quote-list.component').then(m => m.AdminQuoteListComponent)
      },
      {
        path: 'quotes/new',
        loadComponent: () => import('./pages/quotes/quote-form/quote-form.component').then(m => m.AdminQuoteFormComponent)
      },
      {
        path: 'quotes/:id',
        loadComponent: () => import('./pages/quotes/quote-detail/quote-detail.component').then(m => m.AdminQuoteDetailComponent)
      },
      {
        path: 'quotes/:id/edit',
        loadComponent: () => import('./pages/quotes/quote-form/quote-form.component').then(m => m.AdminQuoteFormComponent)
      },
      // Contracts
      {
        path: 'contracts',
        loadComponent: () => import('./pages/contracts/contract-list/contract-list.component').then(m => m.AdminContractListComponent)
      },
      {
        path: 'contracts/new',
        loadComponent: () => import('./pages/contracts/contract-form/contract-form.component').then(m => m.AdminContractFormComponent)
      },
      {
        path: 'contracts/:id',
        loadComponent: () => import('./pages/contracts/contract-detail/contract-detail.component').then(m => m.AdminContractDetailComponent)
      },
      // Tickets
      {
        path: 'tickets',
        loadComponent: () => import('./pages/tickets/ticket-list/ticket-list.component').then(m => m.AdminTicketListComponent)
      },
      {
        path: 'tickets/:id',
        loadComponent: () => import('./pages/tickets/ticket-detail/ticket-detail.component').then(m => m.AdminTicketDetailComponent)
      },
      // Invoices
      {
        path: 'invoices',
        loadComponent: () => import('./pages/invoices/invoice-list/invoice-list.component').then(m => m.AdminInvoiceListComponent)
      },
      {
        path: 'invoices/new',
        loadComponent: () => import('./pages/invoices/invoice-form/invoice-form.component').then(m => m.AdminInvoiceFormComponent)
      },
      {
        path: 'invoices/:id',
        loadComponent: () => import('./pages/invoices/invoice-detail/invoice-detail.component').then(m => m.AdminInvoiceDetailComponent)
      },
      // Payments
      {
        path: 'payments',
        loadComponent: () => import('./pages/payments/payment-list/payment-list.component').then(m => m.AdminPaymentListComponent)
      },
      {
        path: 'payments/new',
        loadComponent: () => import('./pages/payments/payment-form/payment-form.component').then(m => m.AdminPaymentFormComponent)
      },
      {
        path: 'payments/:id',
        loadComponent: () => import('./pages/payments/payment-detail/payment-detail.component').then(m => m.AdminPaymentDetailComponent)
      },
      // Profile
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.AdminProfileComponent)
      }
    ]
  }
];
