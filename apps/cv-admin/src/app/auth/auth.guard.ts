import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

// Ne vérifie que la PRÉSENCE du jeton, pas sa validité (un jeton expiré
// n'est détecté qu'au premier 401, géré par l'intercepteur).
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isAuthenticated() ? true : inject(Router).createUrlTree(['/login']);
};
