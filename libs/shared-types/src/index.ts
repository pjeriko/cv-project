export interface Variant {
  slug: string;
  label: string;
  summary: string | null;
}

export interface Profile {
  id: number;
  fullName: string;
  title: string;
  summary: string | null;
  email: string;
  phone: string | null;
  location: string | null;
  linkedin: string | null;
  github: string | null;
  website: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  level: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Experience {
  id: number;
  position: string;
  company: string;
  startDate: string;
  endDate: string | null;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Education {
  id: number;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  url: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface CvResponse {
  variant: Variant;
  profile: Profile;
  skills: Skill[];
  experiences: Experience[];
  educations: Education[];
  projects: Project[];
}
