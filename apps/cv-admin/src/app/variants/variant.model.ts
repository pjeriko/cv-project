// Variante telle que renvoyée par l'API (type local : shared-types n'a pas d'id).
export interface Variant {
  id: number;
  slug: string;
  label: string;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
}

// Corps de POST /variants : summary est OMIS s'il est vide, jamais envoyé à null.
export interface CreateVariantPayload {
  slug: string;
  label: string;
  summary?: string;
}

// Corps de PATCH /variants/:id : tous les champs sont envoyés.
// summary = null vide le résumé (la colonne est nullable).
export interface UpdateVariantPayload {
  slug: string;
  label: string;
  summary: string | null;
}

// Variante réduite, telle qu'incluse dans les liens bloc <-> variante.
export interface VariantOption {
  id: number;
  slug: string;
  label: string;
}
