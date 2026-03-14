import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Visitor routes (public — home, campaigns)
  {
    path: '',
    loadChildren: () => import('./routes/visitor.routes').then(m => m.visitorRoutes)
  },
  // Auth routes
  {
    path: '',
    loadChildren: () => import('./routes/auth.routes').then(m => m.authRoutes)
  },
  // User dashboard (all authenticated user routes under /dashboard)
  {
    path: '',
    loadChildren: () => import('./routes/user.routes').then(m => m.userRoutes)
  },
  // Admin routes
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () => import('./routes/admin.routes').then(m => m.adminRoutes)
  }
];
