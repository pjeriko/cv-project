import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { ConfirmDialog, ConfirmDialogData } from '../shared/confirm-dialog/confirm-dialog';
import { toMessages } from '../shared/forms/form-utils';
import { ProjectWithVariants } from './project.model';
import { ProjectsService } from './projects.service';

const NOT_FOUND = 'Projet déjà supprimé';

// Position croissante, puis id croissant (l'API n'impose pas l'unicité).
function sortProjects(projects: ProjectWithVariants[]): ProjectWithVariants[] {
  return [...projects].sort((a, b) => a.position - b.position || a.id - b.id);
}

@Component({
  selector: 'app-projects-list',
  imports: [MatButtonModule, MatProgressBarModule, MatTableModule, RouterLink],
  templateUrl: './projects-list.html',
  styleUrl: './projects-list.css',
})
export class ProjectsList {
  private readonly projectsService = inject(ProjectsService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly columns = ['name', 'url', 'position', 'variants', 'actions'];
  protected readonly projects = signal<ProjectWithVariants[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly deletingId = signal<number | null>(null);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.projectsService.findAll().subscribe({
      next: (projects) => {
        this.projects.set(sortProjects(projects));
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(toMessages(err, 'Projets introuvables')[0]);
        this.loading.set(false);
      },
    });
  }

  protected variantLabels(project: ProjectWithVariants): string {
    return project.variants.map((link) => link.variant.label).join(', ');
  }

  protected confirmRemove(project: ProjectWithVariants): void {
    if (this.deletingId() !== null) {
      return;
    }
    const data: ConfirmDialogData = {
      title: 'Supprimer le projet',
      message: `Supprimer « ${project.name} » ? Ses liens avec les variantes seront supprimés. Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
    };
    this.dialog
      .open(ConfirmDialog, { data })
      .afterClosed()
      .subscribe((confirmed: boolean | undefined) => {
        if (confirmed === true) {
          this.remove(project);
        }
      });
  }

  private remove(project: ProjectWithVariants): void {
    this.deletingId.set(project.id);
    this.projectsService.remove(project.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.snackBar.open('Projet supprimé', 'OK', { duration: 4000 });
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
