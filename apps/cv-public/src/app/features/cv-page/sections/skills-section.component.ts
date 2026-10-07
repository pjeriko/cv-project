import { Component, computed, input } from '@angular/core';
import type { Skill } from '@cv-project/shared-types';
import { itemDelay } from '../../../shared/animation/item-delay';

interface SkillGroup {
  category: string;
  skills: Skill[];
}

// Correspondance libellé en base -> nombre de « + » (1 à 3).
// Un libellé absent de cette table est affiché tel quel, sans « + ».
// Clés en minuscules : la comparaison ignore la casse et les espaces autour.
const LEVEL_SCORES: Record<string, number> = {
  débutant: 1,
  intermédiaire: 2,
  avancé: 3,
};
const MAX_LEVEL = 3;

@Component({
  selector: 'app-skills-section',
  templateUrl: './skills-section.component.html',
  host: { class: 'block h-full' },
})
export class SkillsSectionComponent {
  skills = input.required<Skill[]>();

  readonly maxLevel = MAX_LEVEL;
  readonly itemDelay = itemDelay;

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

  // Renvoie 1 à 3 si le libellé est connu, sinon null.
  levelScore(level: string | null): number | null {
    if (!level) {
      return null;
    }
    return LEVEL_SCORES[level.trim().toLowerCase()] ?? null;
  }

  plusSigns(score: number): string {
    return '+'.repeat(score);
  }
}
