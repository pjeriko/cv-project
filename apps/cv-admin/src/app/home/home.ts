import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-home',
  imports: [MatButtonModule],
  template: `
    <main class="home">
      <h1>Connecté</h1>
      <p>Page provisoire, remplacée par le gabarit à l'étape 4.</p>
      <button mat-stroked-button type="button" (click)="logout()">Se déconnecter</button>
    </main>
  `,
  styles: `
    .home {
      padding: 2rem;
    }
  `,
})
export class Home {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
