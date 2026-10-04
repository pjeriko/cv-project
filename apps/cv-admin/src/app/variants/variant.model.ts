// Variante telle que renvoyée par l'API (type local : shared-types n'a pas d'id).
export interface Variant {
  id: number;
  slug: string;
  label: string;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
}
