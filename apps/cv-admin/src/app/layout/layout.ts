import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, inject, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../auth/auth.service';

const DESKTOP_QUERY = '(min-width: 768px)';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  exact: boolean;
}

@Component({
  selector: 'app-layout',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly breakpoints = inject(BreakpointObserver);

  private readonly sidenav = viewChild.required(MatSidenav);

  // Une ligne à ajouter ici à chaque ressource construite (décision 91).
  protected readonly navItems: NavItem[] = [
    { label: 'Accueil', path: '/', icon: 'home', exact: true },
    { label: 'Compétences', path: '/skills', icon: 'code', exact: false },
    { label: 'Variantes', path: '/variants', icon: 'tune', exact: false },
    { label: 'Profil', path: '/profile', icon: 'person', exact: false },
  ];

  protected readonly isDesktop = toSignal(
    this.breakpoints.observe(DESKTOP_QUERY).pipe(map((state) => state.matches)),
    { initialValue: this.breakpoints.isMatched(DESKTOP_QUERY) },
  );

  protected toggleMenu(): void {
    void this.sidenav().toggle();
  }

  protected onNavigate(): void {
    if (!this.isDesktop()) {
      void this.sidenav().close();
    }
  }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
