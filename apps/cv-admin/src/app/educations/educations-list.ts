import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { ConfirmDialog, ConfirmDialogData } from '../shared/confirm-dialog/confirm-dialog';
import { formatPeriod } from '../shared/dates/period';
import { toMessages } from '../shared/forms/form-utils';
import { EducationWithVariants } from './education.model';
import { EducationsService } from './educations.service';

const NOT_FOUND = 'Formation déjà supprimée';

// Plus récente d'abord ; les chaînes ISO se comparent directement.
function sortEducations(educations: EducationWithVariants[]): EducationWithVariants[] {
  return [...educations].sort((a, b) => b.startDate.localeCompare(a.startDate) || b.id - a.id);
}

@Component({
  selector: 'app-educations-list',
  imports: [MatButtonModule, MatProgressBarModule, MatTableModule, RouterLink],
  templateUrl: './educations-list.html',
  styleUrl: './educations-list.css',
})
export class EducationsList {
  private readonly educationsService = inject(EducationsService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly columns = ['degree', 'institution', 'period', 'variants', 'actions'];
  protected readonly educations = signal<EducationWithVariants[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly deletingId = signal<number | null>(null);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.educationsService.findAll().subscribe({
      next: (educations) => {
        this.educations.set(sortEducations(educations));
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(toMessages(err, 'Formations introuvables')[0]);
        this.loading.set(false);
      },
    });
  }

  protected period(education: EducationWithVariants): string {
    return formatPeriod(education.startDate, education.endDate);
  }

  protected variantLabels(education: EducationWithVariants): string {
    return education.variants.map((link) => link.variant.label).join(', ');
  }

  protected confirmRemove(education: EducationWithVariants): void {
    if (this.deletingId() !== null) {
      return;
    }
    const data: ConfirmDialogData = {
      title: 'Supprimer la formation',
      message: `Supprimer « ${education.degree} » à « ${education.institution} » ? Ses liens avec les variantes seront supprimés. Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
    };
    this.dialog
      .open(ConfirmDialog, { data })
      .afterClosed()
      .subscribe((confirmed: boolean | undefined) => {
        if (confirmed === true) {
          this.remove(education);
        }
      });
  }

  private remove(education: EducationWithVariants): void {
    this.deletingId.set(education.id);
    this.educationsService.remove(education.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.snackBar.open('Formation supprimée', 'OK', { duration: 4000 });
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
