import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter, map, take } from 'rxjs/operators';

export const userOnlyGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.hasValidToken()) {
    router.navigate(['/login']);
    return false;
  }

  const currentUser = authService.getCurrentUser();
  if (currentUser) {
    if (currentUser.role === 'ADMIN') {
      router.navigate(['/admin']);
      return false;
    }
    return true;
  }

  return authService.currentUser$.pipe(
    filter(user => user !== null),
    take(1),
    map(user => {
      if (user!.role === 'ADMIN') {
        router.navigate(['/admin']);
        return false;
      }
      return true;
    })
  );
};
