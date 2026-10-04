import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
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

@Component({
  selector: 'app-variants-list',
  imports: [MatButtonModule, MatProgressBarModule, MatTableModule, RouterLink],
  templateUrl: './variants-list.html',
  styleUrl: './variants-list.css',
})
export class VariantsList {
  private readonly variantsService = inject(VariantsService);

  protected readonly columns = ['label', 'slug', 'summary', 'actions'];
  protected readonly variants = signal<Variant[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

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
}
