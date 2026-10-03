import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginResponse {
  accessToken: string;
}

const TOKEN_KEY = 'cv-admin.accessToken';

// Le stockage est isolé ici (décision 84 : sessionStorage).
// try/catch : l'accès peut lever une exception (stockage bloqué par le navigateur).
function readStoredToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeStoredToken(token: string | null): void {
  try {
    if (token === null) {
      sessionStorage.removeItem(TOKEN_KEY);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
    }
  } catch {
    // Stockage indisponible : le jeton reste en mémoire pour cette page seulement.
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly token = signal<string | null>(readStoredToken());

  readonly isAuthenticated = computed(() => this.token() !== null);

  getToken(): string | null {
    return this.token();
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, { email, password })
      .pipe(tap((response) => this.setToken(response.accessToken)));
  }

  logout(): void {
    this.setToken(null);
  }

  private setToken(token: string | null): void {
    writeStoredToken(token);
    this.token.set(token);
  }
}
