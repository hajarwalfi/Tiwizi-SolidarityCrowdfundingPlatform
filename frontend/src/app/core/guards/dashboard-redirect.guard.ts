import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

export const dashboardRedirectGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    map(user => {
      if (!user) {
        return router.createUrlTree(['/login']);
      }
      if (user.role === 'ADMIN') {
        return router.createUrlTree(['/admin']);
      }
      return router.createUrlTree(['/dashboard']);
    })
  );
};
