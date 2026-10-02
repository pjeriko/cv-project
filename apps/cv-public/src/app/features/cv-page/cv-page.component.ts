import { Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { catchError, map, of, switchMap } from 'rxjs';
import { CvResponse } from '@cv-project/shared-types';
import { CvService } from '../../core/services/cv.service';
import { ProfileSectionComponent } from './sections/profile-section.component';
import { SkillsSectionComponent } from './sections/skills-section.component';
import { ExperiencesSectionComponent } from './sections/experiences-section.component';
import { EducationsSectionComponent } from './sections/educations-section.component';
import { ProjectsSectionComponent } from './sections/projects-section.component';

type CvPageState =
  | { status: 'loading' }
  | { status: 'success'; cv: CvResponse }
  | { status: 'not-found' }
  | { status: 'error' };

type SectionId = 'profile' | 'skills' | 'experiences' | 'educations' | 'projects';

// Ordre = ordre des sections au swipe et des boutons de navigation.
const SECTIONS: readonly { id: SectionId; label: string }[] = [
  { id: 'profile', label: 'Profil' },
  { id: 'skills', label: 'Compétences' },
  { id: 'experiences', label: 'Expériences' },
  { id: 'educations', label: 'Formations' },
  { id: 'projects', label: 'Projets' },
];

// Correspond au breakpoint `md` de Tailwind (48rem).
const DESKTOP_QUERY = '(min-width: 768px)';
const SWIPE_MIN_DISTANCE = 50;

const DEFAULT_TITLE = 'CV en ligne';
const TITLE_SEPARATOR = ' — ';

// Titre d'onglet : « {libellé de la variante} — {nom} », en ignorant les parties vides.
function buildCvTitle(cv: CvResponse): string {
  return (
    [cv.variant.label, cv.profile.fullName].filter(Boolean).join(TITLE_SEPARATOR) || DEFAULT_TITLE
  );
}

@Component({
  selector: 'app-cv-page',
  standalone: true,
  imports: [
    ProfileSectionComponent,
    SkillsSectionComponent,
    ExperiencesSectionComponent,
    EducationsSectionComponent,
    ProjectsSectionComponent,
  ],
  templateUrl: './cv-page.component.html',
  host: { '(document:keydown)': 'onKeydown($event)' },
})
export class CvPageComponent {
  private readonly cvService = inject(CvService);
  private readonly titleService = inject(Title);

  slug = input.required<string>();

  protected readonly sections = SECTIONS;
  protected readonly activeSection = signal<SectionId>('profile');

  private readonly mediaQuery = window.matchMedia(DESKTOP_QUERY);
  protected readonly isDesktop = signal(this.mediaQuery.matches);

  // Section réellement affichée : sur desktop le profil est dans la colonne gauche,
  // donc « profile » actif y équivaut à la première section de contenu.
  protected readonly current = computed<SectionId>(() =>
    this.isDesktop() && this.activeSection() === 'profile' ? 'skills' : this.activeSection(),
  );

  private touchStart: { x: number; y: number } | null = null;

  constructor() {
    const onChange = (e: MediaQueryListEvent) => this.isDesktop.set(e.matches);
    this.mediaQuery.addEventListener('change', onChange);
    inject(DestroyRef).onDestroy(() => this.mediaQuery.removeEventListener('change', onChange));

    // Le titre suit l'état ; rien n'est posé pendant le chargement.
    effect(() => {
      const s = this.state();
      switch (s.status) {
        case 'success':
          this.titleService.setTitle(buildCvTitle(s.cv));
          break;
        case 'not-found':
          this.titleService.setTitle('Variante introuvable');
          break;
        case 'error':
          this.titleService.setTitle('Erreur de chargement');
          break;
      }
    });
  }

  private readonly state$ = toObservable(this.slug).pipe(
    switchMap((slug) =>
      this.cvService.getCvByVariant(slug).pipe(
        map((cv): CvPageState => ({ status: 'success', cv })),
        catchError((err: HttpErrorResponse) =>
          of<CvPageState>(err.status === 404 ? { status: 'not-found' } : { status: 'error' }),
        ),
      ),
    ),
  );

  state = toSignal(this.state$, {
    initialValue: { status: 'loading' } satisfies CvPageState,
  });

  // Expose le CV uniquement dans l'état 'success' (réduction de type faite en TypeScript,
  // car le template ne peut pas réduire l'union à travers l'appel du signal).
  cv = computed(() => {
    const s = this.state();
    return s.status === 'success' ? s.cv : null;
  });

  protected goTo(id: SectionId): void {
    this.activeSection.set(id);
  }

  // Section précédente (-1) ou suivante (+1), sans boucle aux extrémités.
  private step(delta: -1 | 1): void {
    const list = this.isDesktop() ? SECTIONS.filter((s) => s.id !== 'profile') : SECTIONS;
    const index = list.findIndex((s) => s.id === this.current());
    const target = list[index + delta];
    if (target) {
      this.activeSection.set(target.id);
    }
  }

  protected onTouchStart(event: TouchEvent): void {
    if (this.isDesktop() || event.touches.length !== 1) {
      this.touchStart = null;
      return;
    }
    const t = event.touches[0];
    this.touchStart = { x: t.clientX, y: t.clientY };
  }

  protected onTouchEnd(event: TouchEvent): void {
    const start = this.touchStart;
    this.touchStart = null;
    if (!start || this.isDesktop()) return;
    const t = event.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    // Geste horizontal net : assez long, et nettement plus horizontal que vertical.
    if (Math.abs(dx) < SWIPE_MIN_DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    this.step(dx < 0 ? 1 : -1);
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.isDesktop() || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowRight') this.step(1);
    else if (event.key === 'ArrowLeft') this.step(-1);
  }
}
