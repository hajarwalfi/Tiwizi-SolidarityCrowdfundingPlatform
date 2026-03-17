import { Routes } from '@angular/router';
import { adminGuard } from '../core/guards/admin.guard';
import { AdminDashboardShellComponent } from '../features/admin/dashboard/admin-dashboard-shell.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminDashboardShellComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        loadComponent: () =>
          import('../features/admin/overview/admin-overview-page.component').then(
            (m) => m.AdminOverviewPageComponent,
          ),
      },
      {
        path: 'campaigns',
        loadComponent: () =>
          import('../features/admin/campaigns/admin-campaigns-page/admin-campaigns-page.component').then(
            (m) => m.AdminCampaignsPageComponent,
          ),
      },
      {
        path: 'campaigns/:id',
        loadComponent: () =>
          import('../features/admin/campaigns/admin-campaign-review-page/admin-campaign-review-page.component').then(
            (m) => m.AdminCampaignReviewPageComponent,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('../features/admin/users/admin-users-page/admin-users-page.component').then(
            (m) => m.AdminUsersPageComponent,
          ),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('../features/admin/reports/admin-reports-page/admin-reports-page.component').then(
            (m) => m.AdminReportsPageComponent,
          ),
      },
      {
        path: 'activities',
        loadComponent: () =>
          import('../features/admin/activities/admin-activities-page.component').then(
            (m) => m.AdminActivitiesPageComponent,
          ),
      },
    ],
  },
];
