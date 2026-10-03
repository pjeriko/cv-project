import type { Skill } from '@cv-project/shared-types';

export interface SkillVariantLink {
  skillId: number;
  variantId: number;
  variant: { id: number; slug: string; label: string };
}

export interface SkillWithVariants extends Skill {
  variants: SkillVariantLink[];
}
