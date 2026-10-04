import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { ConfirmDialog, ConfirmDialogData } from '../shared/confirm-dialog/confirm-dialog';
import { SkillWithVariants } from './skill.model';
import { SkillsService } from './skills.service';

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

function toDeleteMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse && err.status === 404) {
    return 'Compétence déjà supprimée';
  }
  return toMessage(err);
}

@Component({
  selector: 'app-skills-list',
  imports: [MatButtonModule, MatProgressBarModule, MatTableModule, RouterLink],
  templateUrl: './skills-list.html',
  styleUrl: './skills-list.css',
})
export class SkillsList {
  private readonly skillsService = inject(SkillsService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly columns = ['name', 'category', 'level', 'variants', 'actions'];
  protected readonly skills = signal<SkillWithVariants[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly deletingId = signal<number | null>(null);

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

  protected confirmRemove(skill: SkillWithVariants): void {
    if (this.deletingId() !== null) {
      return;
    }
    const data: ConfirmDialogData = {
      title: 'Supprimer la compétence',
      message: `Supprimer « ${skill.name} » (${skill.category}) ? Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
    };
    this.dialog
      .open(ConfirmDialog, { data })
      .afterClosed()
      .subscribe((confirmed: boolean | undefined) => {
        if (confirmed === true) {
          this.remove(skill);
        }
      });
  }

  private remove(skill: SkillWithVariants): void {
    this.deletingId.set(skill.id);
    this.skillsService.remove(skill.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.snackBar.open('Compétence supprimée', 'OK', { duration: 4000 });
        this.load();
      },
      error: (err: unknown) => {
        this.deletingId.set(null);
        this.snackBar.open(toDeleteMessage(err), 'OK', { duration: 6000 });
        this.load();
      },
    });
  }
}
