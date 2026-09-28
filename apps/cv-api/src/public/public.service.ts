import { Injectable, NotFoundException } from '@nestjs/common';
import type { CvResponseEntity } from './public-response.entity.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProfileService } from '../cv/profile/profile.service.js';

@Injectable()
export class PublicService {
  constructor(
    private prisma: PrismaService,
    private profileService: ProfileService,
  ) {}

  async getCvByVariant(slug: string): Promise<CvResponseEntity> {
    const variant = await this.prisma.variant.findUnique({
      where: { slug },
      include: {
        skills: { include: { skill: true } },
        experiences: { include: { experience: true } },
        educations: { include: { education: true } },
        projects: { include: { project: true } },
      },
    });

    if (!variant) {
      throw new NotFoundException(`Variant "${slug}" not found`);
    }

    const profile = await this.profileService.findOne();

    return {
      variant: {
        slug: variant.slug,
        label: variant.label,
        summary: variant.summary,
      },
      profile,
      skills: variant.skills.map((sv) => sv.skill),
      experiences: variant.experiences.map((ev) => ev.experience),
      educations: variant.educations.map((ev) => ev.education),
      projects: variant.projects.map((pv) => pv.project),
    };
  }
}
