import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { dateOrder, notBlank, orNull, toMessages } from '../shared/forms/form-utils';
import type { VariantOption } from '../variants/variant.model';
import { VariantsService } from '../variants/variants.service';
import {
  CreateEducationPayload,
  EducationWithVariants,
  UpdateEducationPayload,
} from './education.model';
import { EducationsService } from './educations.service';

const NOT_FOUND = 'Formation introuvable';

@Component({
  selector: 'app-education-form',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './education-form.html',
  styleUrl: '../shared/forms/form.css',
})
export class EducationForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly educationsService = inject(EducationsService);
  private readonly variantsService = inject(VariantsService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly route = inject(ActivatedRoute);

  // Mode : paramètre :id présent = modification.
  private readonly rawId: string | null = this.route.snapshot.paramMap.get('id');
  private readonly educationId: number | null =
    this.rawId !== null && /^\d+$/.test(this.rawId) ? Number(this.rawId) : null;
  protected readonly isEdit: boolean = this.rawId !== null;

  protected readonly form = this.fb.group(
    {
      degree: this.fb.control('', notBlank),
      institution: this.fb.control('', notBlank),
      startDate: this.fb.control('', Validators.required),
      endDate: this.fb.control(''),
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

    if (this.isEdit && this.educationId === null) {
      this.optionsError.set('Identifiant invalide');
      this.retryable.set(false);
      this.loadingOptions.set(false);
      return;
    }

    this.loadingOptions.set(true);
    const education$: Observable<EducationWithVariants | null> =
      this.educationId === null ? of(null) : this.educationsService.findOne(this.educationId);

    forkJoin({
      variants: this.variantsService.findAll(),
      education: education$,
    }).subscribe({
      next: ({ variants, education }) => {
        this.variants.set([...variants].sort((a, b) => a.label.localeCompare(b.label, 'fr')));

        if (education !== null) {
          this.form.patchValue({
            degree: education.degree,
            institution: education.institution,
            // "2022-09-01T00:00:00.000Z" -> "2022-09-01"
            startDate: education.startDate.slice(0, 10),
            endDate: education.endDate === null ? '' : education.endDate.slice(0, 10),
            variantIds: education.variants.map((link) => link.variantId),
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

    if (this.educationId !== null) {
      const payload: UpdateEducationPayload = {
        degree: value.degree.trim(),
        institution: value.institution.trim(),
        startDate: value.startDate,
        endDate: orNull(value.endDate),
        variantIds: value.variantIds,
      };
      this.educationsService.update(this.educationId, payload).subscribe({
        next: () => this.onSuccess('Formation modifiée'),
        error: (err: unknown) => this.onError(err),
      });
      return;
    }

    const payload: CreateEducationPayload = {
      degree: value.degree.trim(),
      institution: value.institution.trim(),
      startDate: value.startDate,
    };
    if (value.endDate !== '') {
      payload.endDate = value.endDate;
    }
    if (value.variantIds.length > 0) {
      payload.variantIds = value.variantIds;
    }
    this.educationsService.create(payload).subscribe({
      next: () => this.onSuccess('Formation créée'),
      error: (err: unknown) => this.onError(err),
    });
  }

  private onSuccess(message: string): void {
    this.snackBar.open(message, 'OK', { duration: 4000 });
    void this.router.navigateByUrl('/educations');
  }

  private onError(err: unknown): void {
    this.apiErrors.set(toMessages(err, NOT_FOUND));
    this.submitting.set(false);
  }
}
