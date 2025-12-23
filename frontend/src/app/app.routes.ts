import { Routes } from '@angular/router';
import { TailwindTest } from './shared/components/tailwind-test/tailwind-test';

export const routes: Routes = [
  {
    path: '',
    component: TailwindTest
  },
  {
    path: 'tailwind-test',
    component: TailwindTest
  }
];
