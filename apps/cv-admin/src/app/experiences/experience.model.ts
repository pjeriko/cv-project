import type { Experience } from '@cv-project/shared-types';
import type { VariantOption } from '../skills/skill.model';

export interface ExperienceVariantLink {
  experienceId: number;
  variantId: number;
  variant: VariantOption;
}

export interface ExperienceWithVariants extends Experience {
  variants: ExperienceVariantLink[];
}

// Corps de POST /experiences : endDate et variantIds vides sont OMIS.
// Dates au format "YYYY-MM-DD".
export interface CreateExperiencePayload {
  position: string;
  company: string;
  startDate: string;
  endDate?: string;
  description: string;
  variantIds?: number[];
}

// Corps de PATCH /experiences/:id : tous les champs sont envoyés.
// endDate = null vide la date de fin ; variantIds REMPLACE les liens.
export interface UpdateExperiencePayload {
  position: string;
  company: string;
  startDate: string;
  endDate: string | null;
  description: string;
  variantIds: number[];
}
