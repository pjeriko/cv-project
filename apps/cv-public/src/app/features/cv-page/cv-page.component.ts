import { Component, ElementRef, computed, inject, input, signal, viewChild } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
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

// Ordre = ordre des slides sur mobile et ordre des boutons de navigation.
const SECTIONS: readonly { id: SectionId; label: string }[] = [
  { id: 'profile', label: 'Profil' },
  { id: 'skills', label: 'Compétences' },
  { id: 'experiences', label: 'Expériences' },
  { id: 'educations', label: 'Formations' },
  { id: 'projects', label: 'Projets' },
];

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
})
export class CvPageComponent {
  private readonly cvService = inject(CvService);

  slug = input.required<string>();

  protected readonly sections = SECTIONS;
  protected readonly activeSection = signal<SectionId>('profile');

  // Conteneur horizontal des slides (absent tant que l'état n'est pas 'success').
  private readonly track = viewChild<ElementRef<HTMLElement>>('track');

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

  // Source de vérité unique : la position de scroll. Le signal en est déduit.
  protected onScroll(event: Event): void {
    const el = event.target as HTMLElement;
    if (el.clientWidth === 0) return;
    const section = SECTIONS[Math.round(el.scrollLeft / el.clientWidth)];
    if (section) {
      this.activeSection.set(section.id);
    }
  }

  // Un clic fait défiler ; le signal se met à jour via onScroll.
  protected goTo(id: SectionId): void {
    const el = this.track()?.nativeElement;
    if (!el) return;
    const index = SECTIONS.findIndex((s) => s.id === id);
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' });
  }
}
