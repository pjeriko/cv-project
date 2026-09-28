export interface ProfileEntity {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface SkillEntity {
  id: number;
  name: string;
  category: string;
  level: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExperienceEntity {
  id: number;
  position: string;
  company: string;
  startDate: Date;
  endDate: Date | null;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EducationEntity {
  id: number;
  degree: string;
  institution: string;
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectEntity {
  id: number;
  name: string;
  description: string | null;
  url: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CvResponseEntity {
  variant: {
    slug: string;
    label: string;
    summary: string | null;
  };
  profile: ProfileEntity;
  skills: SkillEntity[];
  experiences: ExperienceEntity[];
  educations: EducationEntity[];
  projects: ProjectEntity[];
}
