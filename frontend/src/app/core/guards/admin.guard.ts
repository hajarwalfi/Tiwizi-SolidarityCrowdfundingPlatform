import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter, map, take } from 'rxjs/operators';

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.hasValidToken()) {
    router.navigate(['/login']);
    return false;
  }

  // If user is already loaded synchronously, check immediately
  const currentUser = authService.getCurrentUser();
  if (currentUser) {
    if (currentUser.role === 'ADMIN') return true;
    router.navigate(['/campaigns']);
    return false;
  }

  // Otherwise wait for the user to load before deciding
  return authService.currentUser$.pipe(
    filter(user => user !== null),
    take(1),
    map(user => {
      if (user!.role === 'ADMIN') return true;
      router.navigate(['/campaigns']);
      return false;
    })
  );
};
