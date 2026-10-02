// Décalage d'apparition des items d'une liste : base (laisse finir le zoom
// de la section), puis un pas par item, plafonné pour ne pas retarder
// les longues listes. Règle commune à toutes les sections.
const ITEM_BASE_DELAY_MS = 100;
const ITEM_STEP_MS = 150;
const ITEM_MAX_STEPS = 5;

export function itemDelay(index: number): number {
  return ITEM_BASE_DELAY_MS + Math.min(index, ITEM_MAX_STEPS) * ITEM_STEP_MS;
}
