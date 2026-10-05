import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CreateVariantPayload, UpdateVariantPayload } from './variant.model';
import { VariantsService } from './variants.service';
import { MarkdownEditor } from '../shared/markdown-editor/markdown-editor';
import { notBlank, toMessages } from '../shared/forms/form-utils';

// Le slug sert d'adresse publique (/cv/slug) : minuscules, chiffres, tirets.
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const NOT_FOUND = 'Variante introuvable';

function slugFormat(control: AbstractControl): ValidationErrors | null {
  const value: string = (control.value ?? '').trim();
  if (value === '') {
    return { required: true };
  }
  return SLUG_PATTERN.test(value) ? null : { slugFormat: true };
}

@Component({
  selector: 'app-variant-form',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MarkdownEditor,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './variant-form.html',
  styleUrl: '../shared/forms/form.css',
})
export class VariantForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly variantsService = inject(VariantsService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly route = inject(ActivatedRoute);

  // Mode : paramètre :id présent = modification (décision g).
  private readonly rawId: string | null = this.route.snapshot.paramMap.get('id');
  private readonly variantId: number | null =
    this.rawId !== null && /^\d+$/.test(this.rawId) ? Number(this.rawId) : null;
  protected readonly isEdit: boolean = this.rawId !== null;

  protected readonly form = this.fb.group({
    slug: this.fb.control('', slugFormat),
    label: this.fb.control('', notBlank),
    summary: this.fb.control(''),
  });

  // En création, rien à charger.
  protected readonly loading = signal(this.isEdit);
  protected readonly loadError = signal<string | null>(null);
  protected readonly retryable = signal(true);
  protected readonly submitting = signal(false);
  protected readonly apiErrors = signal<string[]>([]);

  constructor() {
    this.load();
  }

  protected load(): void {
    if (!this.isEdit) {
      return;
    }
    this.loadError.set(null);
    this.retryable.set(true);

    if (this.variantId === null) {
      this.loadError.set('Identifiant invalide');
      this.retryable.set(false);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.variantsService.findOne(this.variantId).subscribe({
      next: (variant) => {
        this.form.patchValue({
          slug: variant.slug,
          label: variant.label,
          summary: variant.summary ?? '',
        });
        this.loading.set(false);
      },
      error: (err: unknown) => {
        const notFound = err instanceof HttpErrorResponse && err.status === 404;
        this.retryable.set(!notFound);
        this.loadError.set(toMessages(err, NOT_FOUND)[0]);
        this.loading.set(false);
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

    if (this.variantId !== null) {
      const payload: UpdateVariantPayload = {
        slug: value.slug.trim(),
        label: value.label.trim(),
        summary: value.summary.trim() === '' ? null : value.summary,
      };
      this.variantsService.update(this.variantId, payload).subscribe({
        next: () => this.onSuccess('Variante modifiée'),
        error: (err: unknown) => this.onError(err),
      });
      return;
    }

    const payload: CreateVariantPayload = {
      slug: value.slug.trim(),
      label: value.label.trim(),
    };
    if (value.summary.trim() !== '') {
      payload.summary = value.summary;
    }
    this.variantsService.create(payload).subscribe({
      next: () => this.onSuccess('Variante créée'),
      error: (err: unknown) => this.onError(err),
    });
  }

  private onSuccess(message: string): void {
    this.snackBar.open(message, 'OK', { duration: 4000 });
    void this.router.navigateByUrl('/variants');
  }

  private onError(err: unknown): void {
    this.submitting.set(false);
  }
}
