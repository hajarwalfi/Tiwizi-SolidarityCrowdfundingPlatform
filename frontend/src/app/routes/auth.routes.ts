import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('../features/auth/pages/login-page/login-page.component').then(m => m.LoginPageComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('../features/auth/pages/register-page/register-page.component').then(m => m.RegisterPageComponent)
  },
  {
    path: 'oauth2/redirect',
    loadComponent: () =>
      import('../features/auth/pages/oauth2-callback-page/oauth2-redirect.component').then(m => m.OAuth2RedirectComponent)
  },
  {
    path: 'oauth2/error',
    loadComponent: () =>
      import('../features/auth/pages/oauth2-callback-page/oauth2-error.component').then(m => m.OAuth2ErrorComponent)
  }
];
