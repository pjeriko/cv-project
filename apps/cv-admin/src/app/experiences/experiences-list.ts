import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { ConfirmDialog, ConfirmDialogData } from '../shared/confirm-dialog/confirm-dialog';
import { toMessages } from '../shared/forms/form-utils';
import { ExperienceWithVariants } from './experience.model';
import { ExperiencesService } from './experiences.service';

const NOT_FOUND = 'Expérience déjà supprimée';

// Dates ISO de l'API ("2022-09-01T00:00:00.000Z") : mois et année, en UTC
// pour éviter un décalage d'un jour selon le fuseau.
const MONTH_FORMAT = new Intl.DateTimeFormat('fr-FR', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

function formatDate(iso: string): string {
  return MONTH_FORMAT.format(new Date(iso));
}

// Plus récente d'abord ; les chaînes ISO se comparent directement.
function sortExperiences(experiences: ExperienceWithVariants[]): ExperienceWithVariants[] {
  return [...experiences].sort((a, b) => b.startDate.localeCompare(a.startDate) || b.id - a.id);
}

@Component({
  selector: 'app-experiences-list',
  imports: [MatButtonModule, MatProgressBarModule, MatTableModule, RouterLink],
  templateUrl: './experiences-list.html',
  styleUrl: './experiences-list.css',
})
export class ExperiencesList {
  private readonly experiencesService = inject(ExperiencesService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly columns = ['position', 'company', 'period', 'variants', 'actions'];
  protected readonly experiences = signal<ExperienceWithVariants[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly deletingId = signal<number | null>(null);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.experiencesService.findAll().subscribe({
      next: (experiences) => {
        this.experiences.set(sortExperiences(experiences));
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(toMessages(err, 'Expériences introuvables')[0]);
        this.loading.set(false);
      },
    });
  }

  protected period(experience: ExperienceWithVariants): string {
    const end = experience.endDate === null ? 'en cours' : formatDate(experience.endDate);
    return `${formatDate(experience.startDate)} – ${end}`;
  }

  protected variantLabels(experience: ExperienceWithVariants): string {
    return experience.variants.map((link) => link.variant.label).join(', ');
  }

  protected confirmRemove(experience: ExperienceWithVariants): void {
    if (this.deletingId() !== null) {
      return;
    }
    const data: ConfirmDialogData = {
      title: "Supprimer l'expérience",
      message: `Supprimer « ${experience.position} » chez « ${experience.company} » ? Ses liens avec les variantes seront supprimés. Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
    };
    this.dialog
      .open(ConfirmDialog, { data })
      .afterClosed()
      .subscribe((confirmed: boolean | undefined) => {
        if (confirmed === true) {
          this.remove(experience);
        }
      });
  }

  private remove(experience: ExperienceWithVariants): void {
    this.deletingId.set(experience.id);
    this.experiencesService.remove(experience.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.snackBar.open('Expérience supprimée', 'OK', { duration: 4000 });
        this.load();
      },
      error: (err: unknown) => {
        this.deletingId.set(null);
        this.snackBar.open(toMessages(err, NOT_FOUND)[0], 'OK', { duration: 6000 });
        this.load();
      },
    });
  }
}
