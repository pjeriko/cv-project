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
import { MatSnackBar } from '@angular/material/snack-bar';
import type { Profile } from '@cv-project/shared-types';
import { UpdateProfilePayload } from './profile.model';
import { ProfileService } from './profile.service';
import { MarkdownEditor } from '../shared/markdown-editor/markdown-editor';

// Reflète @IsUrl({ require_protocol: true, protocols: ['http', 'https'] }) de l'API.
const URL_PATTERN = /^https?:\/\/\S+$/;

function notBlank(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  return value.trim() === '' ? { required: true } : null;
}

// Champ facultatif : vide accepté, sinon http(s):// obligatoire.
function urlFormat(control: AbstractControl): ValidationErrors | null {
  const value: string = (control.value ?? '').trim();
  if (value === '') {
    return null;
  }
  return URL_PATTERN.test(value) ? null : { urlFormat: true };
}

function orNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function toMessages(err: unknown): string[] {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return ["Impossible de joindre l'API"];
    }
    if (err.status === 400) {
      const message: unknown = err.error?.message;
      if (Array.isArray(message)) {
        return message.map((m) => String(m));
      }
      if (typeof message === 'string') {
        return [message];
      }
      return ['Requête invalide (code 400)'];
    }
    if (err.status === 404) {
      return ['Profil introuvable'];
    }
    return [`Erreur inattendue (code ${err.status})`];
  }
  return ['Erreur inattendue'];
}

@Component({
  selector: 'app-profile-form',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MarkdownEditor,
    ReactiveFormsModule,
  ],
  templateUrl: './profile-form.html',
  styleUrl: './profile-form.css',
})
export class ProfileForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly profileService = inject(ProfileService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly form = this.fb.group({
    fullName: this.fb.control('', notBlank),
    title: this.fb.control('', notBlank),
    summary: this.fb.control(''),
    email: this.fb.control('', [notBlank, Validators.email]),
    phone: this.fb.control(''),
    location: this.fb.control(''),
    linkedin: this.fb.control('', urlFormat),
    github: this.fb.control('', urlFormat),
    website: this.fb.control('', urlFormat),
  });

  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);
  protected readonly retryable = signal(true);
  protected readonly submitting = signal(false);
  protected readonly apiErrors = signal<string[]>([]);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loadError.set(null);
    this.retryable.set(true);
    this.loading.set(true);

    this.profileService.find().subscribe({
      next: (profile) => {
        this.fill(profile);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        const notFound = err instanceof HttpErrorResponse && err.status === 404;
        this.retryable.set(!notFound);
        this.loadError.set(toMessages(err)[0]);
        this.loading.set(false);
      },
    });
  }

  // reset() repeuple le formulaire ET le remet à l'état « non modifié ».
  private fill(profile: Profile): void {
    this.form.reset({
      fullName: profile.fullName,
      title: profile.title,
      summary: profile.summary ?? '',
      email: profile.email,
      phone: profile.phone ?? '',
      location: profile.location ?? '',
      linkedin: profile.linkedin ?? '',
      github: profile.github ?? '',
      website: profile.website ?? '',
    });
  }

  protected submit(): void {
    if (this.submitting() || this.form.pristine) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();

    // Colonnes non nullables : jamais null. Colonnes nullables vides : null.
    const payload: UpdateProfilePayload = {
      fullName: value.fullName.trim(),
      title: value.title.trim(),
      summary: value.summary.trim() === '' ? '' : value.summary,
      email: value.email.trim(),
      phone: orNull(value.phone),
      location: orNull(value.location),
      linkedin: orNull(value.linkedin),
      github: orNull(value.github),
      website: orNull(value.website),
    };

    this.submitting.set(true);
    this.apiErrors.set([]);

    this.profileService.update(payload).subscribe({
      next: (profile) => {
        this.fill(profile);
        this.submitting.set(false);
        this.snackBar.open('Profil enregistré', 'OK', { duration: 4000 });
      },
      error: (err: unknown) => {
        this.apiErrors.set(toMessages(err));
        this.submitting.set(false);
      },
    });
  }
}
