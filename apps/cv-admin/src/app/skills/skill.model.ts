import type { Skill } from '@cv-project/shared-types';

export interface SkillVariantLink {
  skillId: number;
  variantId: number;
  variant: { id: number; slug: string; label: string };
}

export interface SkillWithVariants extends Skill {
  variants: SkillVariantLink[];
}

// Corps de POST /skills : les champs vides sont OMIS, jamais envoyés à null.
export interface CreateSkillPayload {
  name: string;
  category: string;
  level?: string;
  variantIds?: number[];
}

// Variante telle que proposée dans le formulaire (type local, décision 107).
export interface VariantOption {
  id: number;
  slug: string;
  label: string;
}
