import { Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map, of, switchMap } from 'rxjs';
import { CvResponse } from '@cv-project/shared-types';
import { CvService } from '../../core/services/cv.service';

type CvPageState =
  | { status: 'loading' }
  | { status: 'success'; cv: CvResponse }
  | { status: 'not-found' }
  | { status: 'error' };

@Component({
  selector: 'app-cv-page',
  standalone: true,
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
}
