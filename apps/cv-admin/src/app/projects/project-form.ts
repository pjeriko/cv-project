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
import { notBlank, orNull, toMessages, urlFormat } from '../shared/forms/form-utils';
import { MarkdownEditor } from '../shared/markdown-editor/markdown-editor';
import type { VariantOption } from '../variants/variant.model';
import { VariantsService } from '../variants/variants.service';
import { CreateProjectPayload, ProjectWithVariants, UpdateProjectPayload } from './project.model';
import { ProjectsService } from './projects.service';

const NOT_FOUND = 'Projet introuvable';

@Component({
  selector: 'app-project-form',
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
  templateUrl: './project-form.html',
  styleUrl: '../shared/forms/form.css',
})
export class ProjectForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly projectsService = inject(ProjectsService);
  private readonly variantsService = inject(VariantsService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly route = inject(ActivatedRoute);

  // Mode : paramètre :id présent = modification.
  private readonly rawId: string | null = this.route.snapshot.paramMap.get('id');
  private readonly projectId: number | null =
    this.rawId !== null && /^\d+$/.test(this.rawId) ? Number(this.rawId) : null;
  protected readonly isEdit: boolean = this.rawId !== null;

  protected readonly form = this.fb.group({
    name: this.fb.control('', notBlank),
    url: this.fb.control('', urlFormat),
    // Entier >= 0 (le motif refuse « - » et « . »). Valeur initiale remplacée au chargement.
    position: this.fb.control<number | null>(0, [Validators.required, Validators.pattern(/^\d+$/)]),
    description: this.fb.control('', notBlank),
    variantIds: this.fb.control<number[]>([]),
  });

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

    if (this.isEdit && this.projectId === null) {
      this.optionsError.set('Identifiant invalide');
      this.retryable.set(false);
      this.loadingOptions.set(false);
      return;
    }

    this.loadingOptions.set(true);
    const project$: Observable<ProjectWithVariants | null> =
      this.projectId === null ? of(null) : this.projectsService.findOne(this.projectId);
    // Création seulement : sert à proposer position = max + 1.
    const projects$: Observable<ProjectWithVariants[]> = this.isEdit
      ? of([])
      : this.projectsService.findAll();

    forkJoin({
      variants: this.variantsService.findAll(),
      project: project$,
      projects: projects$,
    }).subscribe({
      next: ({ variants, project, projects }) => {
        this.variants.set([...variants].sort((a, b) => a.label.localeCompare(b.label, 'fr')));

        if (project !== null) {
          this.form.patchValue({
            name: project.name,
            url: project.url ?? '',
            position: project.position,
            description: project.description,
            variantIds: project.variants.map((link) => link.variantId),
          });
        } else if (!this.isEdit) {
          const max = projects.reduce((m, p) => Math.max(m, p.position), -1);
          this.form.patchValue({ position: max + 1 });
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

    if (this.projectId !== null) {
      const payload: UpdateProjectPayload = {
        name: value.name.trim(),
        description: value.description.trim(),
        url: orNull(value.url),
        position: Number(value.position),
        variantIds: value.variantIds,
      };
      this.projectsService.update(this.projectId, payload).subscribe({
        next: () => this.onSuccess('Projet modifié'),
        error: (err: unknown) => this.onError(err),
      });
      return;
    }

    const payload: CreateProjectPayload = {
      name: value.name.trim(),
      description: value.description.trim(),
      position: Number(value.position),
    };
    const url = orNull(value.url);
    if (url !== null) {
      payload.url = url;
    }
    if (value.variantIds.length > 0) {
      payload.variantIds = value.variantIds;
    }
    this.projectsService.create(payload).subscribe({
      next: () => this.onSuccess('Projet créé'),
      error: (err: unknown) => this.onError(err),
    });
  }

  private onSuccess(message: string): void {
    this.snackBar.open(message, 'OK', { duration: 4000 });
    void this.router.navigateByUrl('/projects');
  }

  private onError(err: unknown): void {
    this.apiErrors.set(toMessages(err, NOT_FOUND));
    this.submitting.set(false);
  }
}
