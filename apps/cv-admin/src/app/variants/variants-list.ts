import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { ConfirmDialog, ConfirmDialogData } from '../shared/confirm-dialog/confirm-dialog';
import { Variant } from './variant.model';
import { VariantsService } from './variants.service';

function sortVariants(variants: Variant[]): Variant[] {
  return [...variants].sort((a, b) => a.label.localeCompare(b.label, 'fr'));
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
    return 'Variante déjà supprimée';
  }
  return toMessage(err);
}

@Component({
  selector: 'app-variants-list',
  imports: [MatButtonModule, MatProgressBarModule, MatTableModule, RouterLink],
  templateUrl: './variants-list.html',
  styleUrl: './variants-list.css',
})
export class VariantsList {
  private readonly variantsService = inject(VariantsService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly columns = ['label', 'slug', 'summary', 'actions'];
  protected readonly variants = signal<Variant[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly deletingId = signal<number | null>(null);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.variantsService.findAll().subscribe({
      next: (variants) => {
        this.variants.set(sortVariants(variants));
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(toMessage(err));
        this.loading.set(false);
      },
    });
  }

  protected confirmRemove(variant: Variant): void {
    if (this.deletingId() !== null) {
      return;
    }
    const data: ConfirmDialogData = {
      title: 'Supprimer la variante',
      message: `Supprimer « ${variant.label} » (/${variant.slug}) ? Ses liens avec les blocs seront supprimés et l'adresse /cv/${variant.slug} ne fonctionnera plus. Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
    };
    this.dialog
      .open(ConfirmDialog, { data })
      .afterClosed()
      .subscribe((confirmed: boolean | undefined) => {
        if (confirmed === true) {
          this.remove(variant);
        }
      });
  }

  private remove(variant: Variant): void {
    this.deletingId.set(variant.id);
    this.variantsService.remove(variant.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.snackBar.open('Variante supprimée', 'OK', { duration: 4000 });
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
