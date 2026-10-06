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
      {
        path: 'experiences',
        loadComponent: () =>
          import('./experiences/experiences-list').then((m) => m.ExperiencesList),
      },
      {
        path: 'experiences/new',
        loadComponent: () => import('./experiences/experience-form').then((m) => m.ExperienceForm),
      },
      {
        path: 'experiences/:id/edit',
        loadComponent: () => import('./experiences/experience-form').then((m) => m.ExperienceForm),
      },
      {
        path: 'educations',
        loadComponent: () => import('./educations/educations-list').then((m) => m.EducationsList),
      },
      {
        path: 'educations/new',
        loadComponent: () => import('./educations/education-form').then((m) => m.EducationForm),
      },
      {
        path: 'educations/:id/edit',
        loadComponent: () => import('./educations/education-form').then((m) => m.EducationForm),
      },
      {
        path: 'projects',
        loadComponent: () => import('./projects/projects-list').then((m) => m.ProjectsList),
      },
      {
        path: 'variants',
        loadComponent: () => import('./variants/variants-list').then((m) => m.VariantsList),
      },
      {
        path: 'variants/new',
        loadComponent: () => import('./variants/variant-form').then((m) => m.VariantForm),
      },
      {
        path: 'variants/:id/edit',
        loadComponent: () => import('./variants/variant-form').then((m) => m.VariantForm),
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile-form').then((m) => m.ProfileForm),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
