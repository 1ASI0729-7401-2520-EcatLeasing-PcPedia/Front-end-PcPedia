import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/layout/navbar/navbar.component';
import { SidebarComponent, MenuItem } from '../../../shared/components/layout/sidebar/sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <app-navbar
      profileLink="/admin/profile"
      (toggleSidebar)="sidebarOpened.set(!sidebarOpened())">
    </app-navbar>

    <app-sidebar
      [menuItems]="menuItems"
      [opened]="sidebarOpened()"
      (openedChange)="sidebarOpened.set($event)">
      <router-outlet></router-outlet>
    </app-sidebar>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AdminLayoutComponent {
  sidebarOpened = signal(true);

  menuItems: MenuItem[] = [
    { label: 'menu.dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'menu.users', icon: 'people', route: '/admin/users' },
    { label: 'menu.inventory', icon: 'inventory_2', route: '/admin/inventory' },
    { label: 'Modelos', icon: 'category', route: '/admin/product-models' },
    { label: 'menu.requests', icon: 'assignment', route: '/admin/requests' },
    { label: 'menu.quotes', icon: 'request_quote', route: '/admin/quotes' },
    { label: 'menu.contracts', icon: 'description', route: '/admin/contracts' },
    { label: 'menu.tickets', icon: 'support_agent', route: '/admin/tickets' },
    { label: 'menu.invoices', icon: 'receipt', route: '/admin/invoices' },
    { label: 'menu.payments', icon: 'payments', route: '/admin/payments' },
    { label: 'menu.profile', icon: 'person', route: '/admin/profile', divider: true }
  ];
}
