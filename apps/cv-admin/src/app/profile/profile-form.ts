import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import type { Profile } from '@cv-project/shared-types';
import { UpdateProfilePayload } from './profile.model';
import { ProfileService } from './profile.service';
import { MarkdownEditor } from '../shared/markdown-editor/markdown-editor';
import { notBlank, orNull, toMessages, urlFormat } from '../shared/forms/form-utils';

// Reflète @IsUrl({ require_protocol: true, protocols: ['http', 'https'] }) de l'API.
const URL_PATTERN = /^https?:\/\/\S+$/;
const NOT_FOUND = 'Profil introuvable';

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
  styleUrl: '../shared/forms/form.css',
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
        this.loadError.set(toMessages(err, NOT_FOUND)[0]);
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
        this.apiErrors.set(toMessages(err, NOT_FOUND));
        this.submitting.set(false);
      },
    });
  }
}
