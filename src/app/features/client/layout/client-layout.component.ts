import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/layout/navbar/navbar.component';
import { SidebarComponent, MenuItem } from '../../../shared/components/layout/sidebar/sidebar.component';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <app-navbar
      profileLink="/client/profile"
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
export class ClientLayoutComponent {
  sidebarOpened = signal(true);

  menuItems: MenuItem[] = [
    { label: 'menu.dashboard', icon: 'dashboard', route: '/client/dashboard' },
    { label: 'menu.catalog', icon: 'storefront', route: '/client/catalog' },
    { label: 'menu.requests', icon: 'assignment', route: '/client/requests' },
    { label: 'menu.quotes', icon: 'request_quote', route: '/client/quotes' },
    { label: 'menu.contracts', icon: 'description', route: '/client/contracts' },
    { label: 'menu.equipment', icon: 'devices', route: '/client/equipment' },
    { label: 'menu.tickets', icon: 'support_agent', route: '/client/tickets' },
    { label: 'menu.invoices', icon: 'receipt', route: '/client/invoices' },
    { label: 'menu.profile', icon: 'person', route: '/client/profile', divider: true }
  ];
}
