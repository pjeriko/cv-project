import { Component, input, signal } from '@angular/core';
import { Project } from '@cv-project/shared-types';
import { itemDelay } from '../../../shared/animation/item-delay';
import { MarkdownComponent } from '../../../shared/markdown/markdown.component';

@Component({
  selector: 'app-projects-section',
  imports: [MarkdownComponent],
  templateUrl: './projects-section.component.html',
  host: { class: 'block h-full' },
})
export class ProjectsSectionComponent {
  projects = input.required<Project[]>();

  readonly itemDelay = itemDelay;

  // Ids des projets dépliés. Tous fermés au départ.
  private readonly openIds = signal<ReadonlySet<number>>(new Set());

  isOpen(id: number): boolean {
    return this.openIds().has(id);
  }

  toggle(id: number): void {
    this.openIds.update((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }
}
