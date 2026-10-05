import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { MarkdownEditor } from '../shared/markdown-editor/markdown-editor';
import { notBlank, orNull, toMessages } from '../shared/forms/form-utils';
import type { VariantOption } from '../skills/skill.model';
import { VariantsService } from '../variants/variants.service';
import {
  CreateExperiencePayload,
  ExperienceWithVariants,
  UpdateExperiencePayload,
} from './experience.model';
import { ExperiencesService } from './experiences.service';

const NOT_FOUND = 'Expérience introuvable';

// Dates au format "YYYY-MM-DD" : la comparaison de chaînes suffit.
// Erreur portée par le groupe, affichée sous les champs de dates.
function dateOrder(group: AbstractControl): ValidationErrors | null {
  const start: string = group.get('startDate')?.value ?? '';
  const end: string = group.get('endDate')?.value ?? '';
  return start !== '' && end !== '' && end < start ? { dateOrder: true } : null;
}

@Component({
  selector: 'app-experience-form',
  imports: [
    MarkdownEditor,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './experience-form.html',
  styleUrls: ['../shared/forms/form.css', './experience-form.css'],
})
export class ExperienceForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly experiencesService = inject(ExperiencesService);
  private readonly variantsService = inject(VariantsService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly route = inject(ActivatedRoute);

  // Mode : paramètre :id présent = modification.
  private readonly rawId: string | null = this.route.snapshot.paramMap.get('id');
  private readonly experienceId: number | null =
    this.rawId !== null && /^\d+$/.test(this.rawId) ? Number(this.rawId) : null;
  protected readonly isEdit: boolean = this.rawId !== null;

  protected readonly form = this.fb.group(
    {
      position: this.fb.control('', notBlank),
      company: this.fb.control('', notBlank),
      startDate: this.fb.control('', Validators.required),
      endDate: this.fb.control(''),
      description: this.fb.control('', notBlank),
      variantIds: this.fb.control<number[]>([]),
    },
    { validators: dateOrder },
  );

  protected readonly variants = signal<VariantOption[]>([]);
  protected readonly loadingOptions = signal(true);
  protected readonly optionsError = signal<string | null>(null);
  protected readonly retryable = signal(true);
  protected readonly submitting = signal(false);
  protected readonly apiErrors = signal<string[]>([]);

  constructor() {
    this.loadOptions();
  }

  protected loadOptions(): void {
    this.optionsError.set(null);
    this.retryable.set(true);

    if (this.isEdit && this.experienceId === null) {
      this.optionsError.set('Identifiant invalide');
      this.retryable.set(false);
      this.loadingOptions.set(false);
      return;
    }

    this.loadingOptions.set(true);
    const experience$: Observable<ExperienceWithVariants | null> =
      this.experienceId === null ? of(null) : this.experiencesService.findOne(this.experienceId);

    forkJoin({
      variants: this.variantsService.findAll(),
      experience: experience$,
    }).subscribe({
      next: ({ variants, experience }) => {
        this.variants.set([...variants].sort((a, b) => a.label.localeCompare(b.label, 'fr')));

        if (experience !== null) {
          this.form.patchValue({
            position: experience.position,
            company: experience.company,
            // "2022-09-01T00:00:00.000Z" -> "2022-09-01"
            startDate: experience.startDate.slice(0, 10),
            endDate: experience.endDate === null ? '' : experience.endDate.slice(0, 10),
            description: experience.description,
            variantIds: experience.variants.map((link) => link.variantId),
          });
        }
        this.loadingOptions.set(false);
      },
      error: (err: unknown) => {
        const notFound = err instanceof HttpErrorResponse && err.status === 404;
        this.retryable.set(!notFound);
        this.optionsError.set(toMessages(err, NOT_FOUND)[0]);
        this.loadingOptions.set(false);
      },
    });
  }

  protected submit(): void {
    if (this.submitting()) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();

    this.submitting.set(true);
    this.apiErrors.set([]);

    if (this.experienceId !== null) {
      const payload: UpdateExperiencePayload = {
        position: value.position.trim(),
        company: value.company.trim(),
        startDate: value.startDate,
        endDate: orNull(value.endDate),
        description: value.description.trim(),
        variantIds: value.variantIds,
      };
      this.experiencesService.update(this.experienceId, payload).subscribe({
        next: () => this.onSuccess('Expérience modifiée'),
        error: (err: unknown) => this.onError(err),
      });
      return;
    }

    const payload: CreateExperiencePayload = {
      position: value.position.trim(),
      company: value.company.trim(),
      startDate: value.startDate,
      description: value.description.trim(),
    };
    if (value.endDate !== '') {
      payload.endDate = value.endDate;
    }
    if (value.variantIds.length > 0) {
      payload.variantIds = value.variantIds;
    }
    this.experiencesService.create(payload).subscribe({
      next: () => this.onSuccess('Expérience créée'),
      error: (err: unknown) => this.onError(err),
    });
  }

  private onSuccess(message: string): void {
    this.snackBar.open(message, 'OK', { duration: 4000 });
    void this.router.navigateByUrl('/experiences');
  }

  private onError(err: unknown): void {
    this.apiErrors.set(toMessages(err, NOT_FOUND));
    this.submitting.set(false);
  }
}
