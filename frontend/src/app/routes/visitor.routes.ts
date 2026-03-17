import { Routes } from '@angular/router';

export const visitorRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../features/visitor/home/pages/landing-page/landing-page.component').then(
        (m) => m.LandingPageComponent,
      ),
  },
  {
    path: 'campaigns',
    loadComponent: () =>
      import('../features/visitor/campaigns/pages/campaigns-list-page/campaigns-list-page.component').then(
        (m) => m.CampaignsListPageComponent,
      ),
  },
  {
    path: 'campaigns/:id',
    loadComponent: () =>
      import('../features/visitor/campaigns/pages/campaign-details-page/campaign-details-page.component').then(
        (m) => m.CampaignDetailsPageComponent,
      ),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('../features/visitor/about/pages/about-page/about-page.component').then(
        (m) => m.AboutPageComponent,
      ),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('../features/visitor/contact/pages/contact-page/contact-page.component').then(
        (m) => m.ContactPageComponent,
      ),
  },
  {
    path: 'profile/:userId',
    loadComponent: () =>
      import('../features/visitor/public-profile/pages/public-profile-page/public-profile-page.component').then(
        (m) => m.PublicProfilePageComponent,
      ),
  },
];
