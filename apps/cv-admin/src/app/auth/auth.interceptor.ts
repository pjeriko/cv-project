import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

// URL absolue ou « protocol-relative » (//hote) : cible potentiellement une autre origine.
const ABSOLUTE_URL = /^(https?:)?\/\//i;

// Le jeton n'est ajouté qu'aux requêtes destinées à notre API.
// - URL absolue : seulement si elle commence par apiBaseUrl + '/' (et si apiBaseUrl n'est pas vide,
//   sinon en production n'importe quelle origine correspondrait).
// - URL relative : même origine (production), donc notre API.
function isApiRequest(url: string): boolean {
  if (ABSOLUTE_URL.test(url)) {
    return environment.apiBaseUrl !== '' && url.startsWith(`${environment.apiBaseUrl}/`);
  }
  return true;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!isApiRequest(req.url)) {
    return next(req);
  }

  const token = auth.getToken();
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      const isLogin = req.url === `${environment.apiBaseUrl}/auth/login`;
      if (error instanceof HttpErrorResponse && error.status === 401 && !isLogin) {
        // Décision 85 : déconnexion + retour au login avec un message neutre.
        auth.logout();
        void router.navigate(['/login'], { queryParams: { expired: 1 } });
      }
      // L'erreur est toujours relancée : l'appelant la voit aussi.
      return throwError(() => error);
    }),
  );
};
