import { Component, computed, input } from '@angular/core';
import type { Skill } from '@cv-project/shared-types';

interface SkillGroup {
  category: string;
  skills: Skill[];
}

@Component({
  selector: 'app-skills-section',
  templateUrl: './skills-section.component.html',
  host: { class: 'block h-full' },
})
export class SkillsSectionComponent {
  skills = input.required<Skill[]>();

  // Regroupe par category, dans l'ordre d'apparition dans le tableau reçu
  // (une Map conserve l'ordre d'insertion).
  groups = computed<SkillGroup[]>(() => {
    const byCategory = new Map<string, Skill[]>();
    for (const skill of this.skills()) {
      const list = byCategory.get(skill.category);
      if (list) {
        list.push(skill);
      } else {
        byCategory.set(skill.category, [skill]);
      }
    }
    return Array.from(byCategory, ([category, skills]) => ({ category, skills }));
  });
}
