import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { guestGuard } from './auth/guest.guard';
import { Login } from './auth/login/login';
import { Home } from './home/home';

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: '', component: Home, pathMatch: 'full', canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
