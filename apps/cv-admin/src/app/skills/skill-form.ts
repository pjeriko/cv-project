import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import {
  CreateSkillPayload,
  SkillWithVariants,
  UpdateSkillPayload,
  VariantOption,
} from './skill.model';
import { SkillsService } from './skills.service';
import { VariantsService } from './variants.service';

// Libellés alignés sur LEVEL_SCORES de cv-public (décision 100).
// '' = « Aucun » : omis à la création (décision 110), envoyé à null à la modification.
const LEVELS: string[] = ['Intermédiaire', 'Avancé'];

// Une valeur vide ou faite d'espaces est refusée (même erreur « required »).
function notBlank(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  return value.trim() === '' ? { required: true } : null;
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
      return ['Compétence introuvable'];
    }
    return [`Erreur inattendue (code ${err.status})`];
  }
  return ['Erreur inattendue'];
}

@Component({
  selector: 'app-skill-form',
  imports: [
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './skill-form.html',
  styleUrl: './skill-form.css',
})
export class SkillForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly skillsService = inject(SkillsService);
  private readonly variantsService = inject(VariantsService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly route = inject(ActivatedRoute);

  // Mode : paramètre :id présent = modification (décision a).
  private readonly rawId: string | null = this.route.snapshot.paramMap.get('id');
  private readonly skillId: number | null =
    this.rawId !== null && /^\d+$/.test(this.rawId) ? Number(this.rawId) : null;
  protected readonly isEdit: boolean = this.rawId !== null;

  // Options du select de niveau : la liste fermée, plus éventuellement
  // un niveau hors liste déjà en base (décision f).
  protected readonly levels = signal<string[]>(LEVELS);

  protected readonly form = this.fb.group({
    name: this.fb.control('', notBlank),
    category: this.fb.control('', notBlank),
    level: this.fb.control(''),
    variantIds: this.fb.control<number[]>([]),
  });

  protected readonly variants = signal<VariantOption[]>([]);
  protected readonly categories = signal<string[]>([]);
  protected readonly loadingOptions = signal(true);
  protected readonly optionsError = signal<string | null>(null);
  protected readonly retryable = signal(true);
  protected readonly submitting = signal(false);
  protected readonly apiErrors = signal<string[]>([]);

  private readonly categoryValue = toSignal(this.form.controls.category.valueChanges, {
    initialValue: '',
  });

  protected readonly filteredCategories = computed(() => {
    const query = (this.categoryValue() ?? '').trim().toLowerCase();
    return this.categories().filter((c) => c.toLowerCase().includes(query));
  });

  constructor() {
    this.loadOptions();
  }

  protected loadOptions(): void {
    this.optionsError.set(null);
    this.retryable.set(true);

    if (this.isEdit && this.skillId === null) {
      this.optionsError.set('Identifiant invalide');
      this.retryable.set(false);
      this.loadingOptions.set(false);
      return;
    }

    this.loadingOptions.set(true);
    const skill$: Observable<SkillWithVariants | null> =
      this.skillId === null ? of(null) : this.skillsService.findOne(this.skillId);

    forkJoin({
      variants: this.variantsService.findAll(),
      skills: this.skillsService.findAll(),
      skill: skill$,
    }).subscribe({
      next: ({ variants, skills, skill }) => {
        this.variants.set([...variants].sort((a, b) => a.label.localeCompare(b.label, 'fr')));
        const unique = Array.from(new Set(skills.map((s) => s.category)));
        this.categories.set(unique.sort((a, b) => a.localeCompare(b, 'fr')));

        if (skill !== null) {
          const level = skill.level ?? '';
          if (level !== '' && !LEVELS.includes(level)) {
            this.levels.set([...LEVELS, level]);
          }
          this.form.patchValue({
            name: skill.name,
            category: skill.category,
            level,
            variantIds: skill.variants.map((link) => link.variantId),
          });
        }
        this.loadingOptions.set(false);
      },
      error: (err: unknown) => {
        const notFound = err instanceof HttpErrorResponse && err.status === 404;
        this.retryable.set(!notFound);
        this.optionsError.set(toMessages(err)[0]);
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

    if (this.skillId !== null) {
      const payload: UpdateSkillPayload = {
        name: value.name.trim(),
        category: value.category.trim(),
        level: value.level === '' ? null : value.level,
        variantIds: value.variantIds,
      };
      this.skillsService.update(this.skillId, payload).subscribe({
        next: () => this.onSuccess('Compétence modifiée'),
        error: (err: unknown) => this.onError(err),
      });
      return;
    }

    const payload: CreateSkillPayload = {
      name: value.name.trim(),
      category: value.category.trim(),
    };
    if (value.level !== '') {
      payload.level = value.level;
    }
    if (value.variantIds.length > 0) {
      payload.variantIds = value.variantIds;
    }
    this.skillsService.create(payload).subscribe({
      next: () => this.onSuccess('Compétence créée'),
      error: (err: unknown) => this.onError(err),
    });
  }

  private onSuccess(message: string): void {
    this.snackBar.open(message, 'OK', { duration: 4000 });
    void this.router.navigateByUrl('/skills');
  }

  private onError(err: unknown): void {
    this.apiErrors.set(toMessages(err));
    this.submitting.set(false);
  }
}
