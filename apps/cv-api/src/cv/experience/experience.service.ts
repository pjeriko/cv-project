import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateExperienceDto } from './dto/create-experience.dto.js';
import { UpdateExperienceDto } from './dto/update-experience.dto.js';

@Injectable()
export class ExperienceService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.experience.findMany({
      include: { variants: { include: { variant: true } } },
    });
  }

  async findOne(id: number) {
    const experience = await this.prisma.experience.findUnique({
      where: { id },
      include: { variants: { include: { variant: true } } },
    });
    if (!experience) {
      throw new NotFoundException(`Experience ${id} not found`);
    }
    return experience;
  }

  create(dto: CreateExperienceDto) {
    const { variantIds, startDate, endDate, ...experienceData } = dto;
    return this.prisma.experience.create({
      data: {
        ...experienceData,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        variants: variantIds
          ? { create: variantIds.map((variantId) => ({ variantId })) }
          : undefined,
      },
      include: { variants: { include: { variant: true } } },
    });
  }

  async update(id: number, dto: UpdateExperienceDto) {
    await this.findOne(id);
    const { variantIds, startDate, endDate, ...experienceData } = dto;

    return this.prisma.$transaction(async (tx) => {
      if (variantIds !== undefined) {
        await tx.experienceVariant.deleteMany({ where: { experienceId: id } });
        if (variantIds.length > 0) {
          await tx.experienceVariant.createMany({
            data: variantIds.map((variantId) => ({
              experienceId: id,
              variantId,
            })),
          });
        }
      }
      return tx.experience.update({
        where: { id },
        data: {
          ...experienceData,
          startDate: startDate !== undefined ? new Date(startDate) : undefined,
          endDate: endDate !== undefined ? new Date(endDate) : undefined,
        },
        include: { variants: { include: { variant: true } } },
      });
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.experience.delete({ where: { id } });
  }
}
