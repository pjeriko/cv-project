import { Component, computed, input } from '@angular/core';
import { Profile, Variant } from '@cv-project/shared-types';
import { MarkdownComponent } from '../../../shared/markdown/markdown.component';

@Component({
  selector: 'app-profile-section',
  standalone: true,
  imports: [MarkdownComponent],
  templateUrl: './profile-section.component.html',
  host: { class: 'block h-full' },
})
export class ProfileSectionComponent {
  profile = input.required<Profile>();
  variant = input.required<Variant>();

  // Le résumé de la variante (écrit pour le poste visé) prime sur le résumé générique.
  // `||` (et non `??`) pour aussi écarter une chaîne vide.
  // Le texte est interprété en Markdown au rendu (<app-markdown>).
  summary = computed(() => this.variant().summary || this.profile().summary);
}
