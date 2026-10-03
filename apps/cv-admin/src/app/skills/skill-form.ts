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
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CreateSkillPayload, VariantOption } from './skill.model';
import { SkillsService } from './skills.service';
import { VariantsService } from './variants.service';

// Libellés alignés sur LEVEL_SCORES de cv-public (décision 100).
// '' = « Aucun » : le champ level est alors omis du corps de la requête.
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

  protected readonly levels = LEVELS;

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
    this.loadingOptions.set(true);
    this.optionsError.set(null);
    forkJoin({
      variants: this.variantsService.findAll(),
      skills: this.skillsService.findAll(),
    }).subscribe({
      next: ({ variants, skills }) => {
        this.variants.set([...variants].sort((a, b) => a.label.localeCompare(b.label, 'fr')));
        const unique = Array.from(new Set(skills.map((s) => s.category)));
        this.categories.set(unique.sort((a, b) => a.localeCompare(b, 'fr')));
        this.loadingOptions.set(false);
      },
      error: (err: unknown) => {
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

    this.submitting.set(true);
    this.apiErrors.set([]);
    this.skillsService.create(payload).subscribe({
      next: () => {
        this.snackBar.open('Compétence créée', 'OK', { duration: 4000 });
        void this.router.navigateByUrl('/skills');
      },
      error: (err: unknown) => {
        this.apiErrors.set(toMessages(err));
        this.submitting.set(false);
      },
    });
  }
}
