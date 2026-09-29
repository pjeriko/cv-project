import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'cv/:slug',
    loadComponent: () =>
      import('./features/cv-page/cv-page.component').then((m) => m.CvPageComponent),
  },
];
