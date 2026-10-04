import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { guestGuard } from './auth/guest.guard';
import { Login } from './auth/login/login';

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [guestGuard] },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/layout').then((m) => m.Layout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./home/home').then((m) => m.Home),
      },
      {
        path: 'skills',
        loadComponent: () => import('./skills/skills-list').then((m) => m.SkillsList),
      },
      {
        path: 'skills/new',
        loadComponent: () => import('./skills/skill-form').then((m) => m.SkillForm),
      },
      {
        path: 'skills/:id/edit',
        loadComponent: () => import('./skills/skill-form').then((m) => m.SkillForm),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
