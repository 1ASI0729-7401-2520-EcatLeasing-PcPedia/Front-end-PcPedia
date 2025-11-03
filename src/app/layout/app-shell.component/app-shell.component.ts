// src/app/layout/app-shell.component/app-shell.component.ts
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationsRepository } from '../../data-access/repositories/notification.repository';
import { AppToolbarComponent } from '../app-toolbar.component/app-toolbar.component';
import { AppSidenavComponent } from '../app-sidenav.component/app-sidenav.component';

export type NavItem = {
  icon: string;
  label: string;
  route: string;
};

@Component({
  standalone: true,
  selector: 'app-shell',
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.css'],
  imports: [AppToolbarComponent, AppSidenavComponent, RouterOutlet],
})
export class AppShellComponent {
  private router = inject(Router);
  private auth = inject(AuthService);
  private notifications = inject(NotificationsRepository);

  menuOpen = signal<boolean>(false);

  // Siempre devuelve string para el toolbar
  userName = computed<string>(() => {
    const u = this.auth.currentUser();
    return u?.displayName ?? u?.email ?? 'Invitado';
  });

  // badge de no leídas
  unreadCount = signal<number>(0);

  // ítems para el sidenav
  items: NavItem[] = [
    { icon: 'Dashboard', label: '', route: '/dashboard' },
    { icon: 'Store', label: '', route: '/catalog' },
    { icon: 'Shopping Cart', label: '', route: '/cart' },
    { icon: 'Assignment', label: '', route: '/orders' },
    { icon: 'Payments', label: '', route: '/payments' },
    { icon: 'Tickets', label: '', route: '/tickets' },
    { icon: 'Mantennance', label: '', route: '/maintenance' },
    { icon: 'Notifications', label: '', route: '/notifications' },
    { icon: 'Profile', label: '', route: '/profile' },
  ];

  ngOnInit() {
    // Suscribir al conteo de no leídas (usa customerId del usuario logueado)
    const cid = this.auth.currentUser()?.customerId ?? 'cus_demo';
    this.notifications.countUnread(cid).subscribe((n) => this.unreadCount.set(n));
  }

  toggleSidenav() { this.menuOpen.update(v => !v); }
  closeOnNavigate() { this.menuOpen.set(false); }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/auth/login');
  }
}
