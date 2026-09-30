import { Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map, of, switchMap } from 'rxjs';
import { CvResponse } from '@cv-project/shared-types';
import { CvService } from '../../core/services/cv.service';
import { ProfileSectionComponent } from './sections/profile-section.component';
import { SkillsSectionComponent } from './sections/skills-section.component';

type CvPageState =
  | { status: 'loading' }
  | { status: 'success'; cv: CvResponse }
  | { status: 'not-found' }
  | { status: 'error' };

@Component({
  selector: 'app-cv-page',
  standalone: true,
  imports: [ProfileSectionComponent, SkillsSectionComponent],
  templateUrl: './cv-page.component.html',
})
export class CvPageComponent {
  private readonly cvService = inject(CvService);

  slug = input.required<string>();

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
}
