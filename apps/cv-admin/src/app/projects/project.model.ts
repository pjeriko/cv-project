import type { Project } from '@cv-project/shared-types';
import type { VariantOption } from '../variants/variant.model';

export interface ProjectVariantLink {
  projectId: number;
  variantId: number;
  variant: VariantOption;
}

export interface ProjectWithVariants extends Project {
  variants: ProjectVariantLink[];
}

// Corps de POST /projects : url et variantIds vides sont OMIS.
// position est toujours envoyée (entier >= 0).
export interface CreateProjectPayload {
  name: string;
  description: string;
  url?: string;
  position: number;
  variantIds?: number[];
}

// Corps de PATCH /projects/:id : tous les champs sont envoyés.
// url = null vide l'adresse ; variantIds REMPLACE les liens.
export interface UpdateProjectPayload {
  name: string;
  description: string;
  url: string | null;
  position: number;
  variantIds: number[];
}
