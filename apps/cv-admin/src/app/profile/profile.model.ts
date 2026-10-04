// Charge utile du PATCH /profile. Le profil est une ressource unique :
// pas de payload de création. Le type Profile vient de shared-types.
export interface UpdateProfilePayload {
  fullName: string;
  title: string;
  summary: string; // colonne non nullable en base : jamais null
  email: string;
  phone: string | null;
  location: string | null;
  linkedin: string | null;
  github: string | null;
  website: string | null;
}
