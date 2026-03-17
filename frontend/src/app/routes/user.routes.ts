import { Routes } from '@angular/router';
import { userOnlyGuard } from '../core/guards/user-only.guard';
import { UserDashboardShellComponent } from '../features/user/dashboard/user-dashboard-shell.component';

export const userRoutes: Routes = [
  {
    path: 'dashboard',
    component: UserDashboardShellComponent,
    canActivate: [userOnlyGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        loadComponent: () =>
          import('../features/user/profile/overview/overview-page.component').then(
            (m) => m.OverviewPageComponent,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('../features/user/profile/public-profile/public-profile-page.component').then(
            (m) => m.PublicProfilePageComponent,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('../features/user/profile/settings/settings-page.component').then(
            (m) => m.SettingsPageComponent,
          ),
      },
      {
        path: 'donations',
        loadComponent: () =>
          import('../features/user/donations/my-donations/my-donations-page.component').then(
            (m) => m.MyDonationsPageComponent,
          ),
      },
      {
        path: 'favorites',
        loadComponent: () =>
          import('../features/user/favorites/my-favorites/favorites-page.component').then(
            (m) => m.FavoritesPageComponent,
          ),
      },
      {
        path: 'campaigns',
        loadComponent: () =>
          import('../features/user/campaigns/my-campaigns/my-campaigns-page.component').then(
            (m) => m.MyCampaignsPageComponent,
          ),
      },
      {
        path: 'campaigns/create',
        loadComponent: () =>
          import('../features/user/campaigns/create-campaign/create-campaign-page.component').then(
            (m) => m.CreateCampaignPageComponent,
          ),
      },
      {
        path: 'campaigns/edit/:id',
        loadComponent: () =>
          import('../features/user/campaigns/create-campaign/create-campaign-page.component').then(
            (m) => m.CreateCampaignPageComponent,
          ),
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('../features/user/payments/my-payments/my-payments-page.component').then(
            (m) => m.MyPaymentsPageComponent,
          ),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('../features/user/notifications/notifications-page/notifications-page.component').then(
            (m) => m.NotificationsPageComponent,
          ),
      },
    ],
  },
];
