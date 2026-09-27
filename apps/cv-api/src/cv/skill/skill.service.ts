// src/cv/skill/skill.service.ts (fichier complet mis à jour)
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateSkillDto } from './dto/create-skill.dto.js';
import { UpdateSkillDto } from './dto/update-skill.dto.js';

@Injectable()
export class SkillService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.skill.findMany({
      include: { variants: { include: { variant: true } } },
    });
  }

  async findOne(id: number) {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
      include: { variants: { include: { variant: true } } },
    });
    if (!skill) {
      throw new NotFoundException(`Skill ${id} not found`);
    }
    return skill;
  }

  create(dto: CreateSkillDto) {
    const { variantIds, ...skillData } = dto;
    return this.prisma.skill.create({
      data: {
        ...skillData,
        variants: variantIds
          ? { create: variantIds.map((variantId) => ({ variantId })) }
          : undefined,
      },
      include: { variants: { include: { variant: true } } },
    });
  }

  async update(id: number, dto: UpdateSkillDto) {
    await this.findOne(id); // vérifie l'existence, lève 404 sinon
    const { variantIds, ...skillData } = dto;

    return this.prisma.$transaction(async (tx) => {
      if (variantIds !== undefined) {
        await tx.skillVariant.deleteMany({ where: { skillId: id } });
        if (variantIds.length > 0) {
          await tx.skillVariant.createMany({
            data: variantIds.map((variantId) => ({ skillId: id, variantId })),
          });
        }
      }

      return tx.skill.update({
        where: { id },
        data: skillData,
        include: { variants: { include: { variant: true } } },
      });
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.skill.delete({ where: { id } });
  }
}
