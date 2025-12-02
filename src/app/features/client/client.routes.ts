import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/guards/auth.guard';
import { clientGuard } from '../../core/auth/guards/client.guard';
import { ClientLayoutComponent } from './layout/client-layout.component';

export const CLIENT_ROUTES: Routes = [
  {
    path: '',
    component: ClientLayoutComponent,
    canActivate: [authGuard, clientGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.ClientDashboardComponent)
      },
      // Catalog
      {
        path: 'catalog',
        loadComponent: () => import('./pages/catalog/catalog-list/catalog-list.component').then(m => m.CatalogListComponent)
      },
      {
        path: 'catalog/:id',
        loadComponent: () => import('./pages/catalog/catalog-list/catalog-list.component').then(m => m.CatalogListComponent)
      },
      // Requests
      {
        path: 'requests',
        loadComponent: () => import('./pages/requests/request-list/request-list.component').then(m => m.ClientRequestListComponent)
      },
      {
        path: 'requests/new',
        loadComponent: () => import('./pages/requests/request-form/request-form.component').then(m => m.ClientRequestFormComponent)
      },
      {
        path: 'requests/:id',
        loadComponent: () => import('./pages/requests/request-detail/request-detail.component').then(m => m.ClientRequestDetailComponent)
      },
      // Quotes
      {
        path: 'quotes',
        loadComponent: () => import('./pages/quotes/quote-list/quote-list.component').then(m => m.ClientQuoteListComponent)
      },
      {
        path: 'quotes/:id',
        loadComponent: () => import('./pages/quotes/quote-detail/quote-detail.component').then(m => m.ClientQuoteDetailComponent)
      },
      // Contracts
      {
        path: 'contracts',
        loadComponent: () => import('./pages/contracts/contract-list/contract-list.component').then(m => m.ClientContractListComponent)
      },
      {
        path: 'contracts/:id',
        loadComponent: () => import('./pages/contracts/contract-detail/contract-detail.component').then(m => m.ClientContractDetailComponent)
      },
      // Equipment
      {
        path: 'equipment',
        loadComponent: () => import('./pages/equipment/equipment-list/equipment-list.component').then(m => m.ClientEquipmentListComponent)
      },
      {
        path: 'equipment/:id',
        loadComponent: () => import('./pages/equipment/equipment-detail/equipment-detail.component').then(m => m.ClientEquipmentDetailComponent)
      },
      // Tickets
      {
        path: 'tickets',
        loadComponent: () => import('./pages/tickets/ticket-list/ticket-list.component').then(m => m.ClientTicketListComponent)
      },
      {
        path: 'tickets/new',
        loadComponent: () => import('./pages/tickets/ticket-form/ticket-form.component').then(m => m.ClientTicketFormComponent)
      },
      {
        path: 'tickets/:id',
        loadComponent: () => import('./pages/tickets/ticket-detail/ticket-detail.component').then(m => m.ClientTicketDetailComponent)
      },
      // Invoices
      {
        path: 'invoices',
        loadComponent: () => import('./pages/invoices/invoice-list/invoice-list.component').then(m => m.ClientInvoiceListComponent)
      },
      {
        path: 'invoices/:id',
        loadComponent: () => import('./pages/invoices/invoice-detail/invoice-detail.component').then(m => m.ClientInvoiceDetailComponent)
      },
      // Profile
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ClientProfileComponent)
      }
    ]
  }
];
