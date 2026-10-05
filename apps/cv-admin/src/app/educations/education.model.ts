import type { Education } from '@cv-project/shared-types';
import type { VariantOption } from '../variants/variant.model';

export interface EducationVariantLink {
  educationId: number;
  variantId: number;
  variant: VariantOption;
}

export interface EducationWithVariants extends Education {
  variants: EducationVariantLink[];
}

// Corps de POST /educations : endDate et variantIds vides sont OMIS.
// Dates au format "YYYY-MM-DD".
export interface CreateEducationPayload {
  degree: string;
  institution: string;
  startDate: string;
  endDate?: string;
  variantIds?: number[];
}

// Corps de PATCH /educations/:id : tous les champs sont envoyés.
// endDate = null vide la date de fin ; variantIds REMPLACE les liens.
export interface UpdateEducationPayload {
  degree: string;
  institution: string;
  startDate: string;
  endDate: string | null;
  variantIds: number[];
}
