import { Routes } from '@angular/router';
import { noAuthGuard } from '../../core/auth/guards/no-auth.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    canActivate: [noAuthGuard],
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'forgot-password',
    canActivate: [noAuthGuard],
    loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  }
];
