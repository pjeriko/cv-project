import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateEducationDto } from './dto/create-education.dto.js';
import { UpdateEducationDto } from './dto/update-education.dto.js';

@Injectable()
export class EducationService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.education.findMany({
      include: { variants: { include: { variant: true } } },
    });
  }

  async findOne(id: number) {
    const education = await this.prisma.education.findUnique({
      where: { id },
      include: { variants: { include: { variant: true } } },
    });
    if (!education) {
      throw new NotFoundException(`Education ${id} not found`);
    }
    return education;
  }

  create(dto: CreateEducationDto) {
    const { variantIds, startDate, endDate, ...educationData } = dto;
    return this.prisma.education.create({
      data: {
        ...educationData,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        variants: variantIds
          ? { create: variantIds.map((variantId) => ({ variantId })) }
          : undefined,
      },
      include: { variants: { include: { variant: true } } },
    });
  }

  async update(id: number, dto: UpdateEducationDto) {
    await this.findOne(id); // vérifie l'existence, lève 404 sinon
    const { variantIds, startDate, endDate, ...educationData } = dto;

    return this.prisma.$transaction(async (tx) => {
      if (variantIds !== undefined) {
        await tx.educationVariant.deleteMany({ where: { educationId: id } });
        if (variantIds.length > 0) {
          await tx.educationVariant.createMany({
            data: variantIds.map((variantId) => ({
              educationId: id,
              variantId,
            })),
          });
        }
      }
      return tx.education.update({
        where: { id },
        data: {
          ...educationData,
          startDate: startDate !== undefined ? new Date(startDate) : undefined,
          endDate:
            endDate === undefined
              ? undefined
              : endDate === null
                ? null
                : new Date(endDate),
        },
        include: { variants: { include: { variant: true } } },
      });
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.education.delete({ where: { id } });
  }
}
