import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { SkillWithVariants } from './skill.model';
import { SkillsService } from './skills.service';
import { RouterLink } from '@angular/router';

function sortSkills(skills: SkillWithVariants[]): SkillWithVariants[] {
  return [...skills].sort(
    (a, b) => a.category.localeCompare(b.category, 'fr') || a.name.localeCompare(b.name, 'fr'),
  );
}

function toMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    return err.status === 0
      ? "Impossible de joindre l'API"
      : `Erreur inattendue (code ${err.status})`;
  }
  return 'Erreur inattendue';
}

@Component({
  selector: 'app-skills-list',
  imports: [MatButtonModule, MatProgressBarModule, MatTableModule, RouterLink],
  templateUrl: './skills-list.html',
  styleUrl: './skills-list.css',
})
export class SkillsList {
  private readonly skillsService = inject(SkillsService);

  protected readonly columns = ['name', 'category', 'level', 'variants'];
  protected readonly skills = signal<SkillWithVariants[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.skillsService.findAll().subscribe({
      next: (skills) => {
        this.skills.set(sortSkills(skills));
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(toMessage(err));
        this.loading.set(false);
      },
    });
  }

  protected variantLabels(skill: SkillWithVariants): string {
    return skill.variants.map((link) => link.variant.label).join(', ');
  }
}
