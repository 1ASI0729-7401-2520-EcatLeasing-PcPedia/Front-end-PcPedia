import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthRepository} from '../../data-access/repositories/auth.repository';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthRepository);
  const router = inject(Router);
  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};
