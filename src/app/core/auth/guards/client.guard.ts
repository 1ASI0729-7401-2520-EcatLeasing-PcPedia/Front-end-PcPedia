import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/user.model';

export const clientGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.hasRole(Role.CLIENT)) {
    return true;
  }

  if (authService.isAuthenticated()) {
    router.navigate(['/admin/dashboard']);
  } else {
    router.navigate(['/login']);
  }

  return false;
};
