import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.project.findMany({
      include: { variants: { include: { variant: true } } },
    });
  }

  async findOne(id: number) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { variants: { include: { variant: true } } },
    });
    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    return project;
  }

  create(dto: CreateProjectDto) {
    const { variantIds, ...projectData } = dto;
    return this.prisma.project.create({
      data: {
        ...projectData,
        variants: variantIds
          ? { create: variantIds.map((variantId) => ({ variantId })) }
          : undefined,
      },
      include: { variants: { include: { variant: true } } },
    });
  }

  async update(id: number, dto: UpdateProjectDto) {
    await this.findOne(id); // vérifie l'existence, lève 404 sinon
    const { variantIds, ...projectData } = dto;

    return this.prisma.$transaction(async (tx) => {
      if (variantIds !== undefined) {
        await tx.projectVariant.deleteMany({ where: { projectId: id } });
        if (variantIds.length > 0) {
          await tx.projectVariant.createMany({
            data: variantIds.map((variantId) => ({ projectId: id, variantId })),
          });
        }
      }
      return tx.project.update({
        where: { id },
        data: projectData,
        include: { variants: { include: { variant: true } } },
      });
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.project.delete({ where: { id } });
  }
}
