import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateVariantDto } from './dto/create-variant.dto.js';
import { UpdateVariantDto } from './dto/update-variant.dto.js';

@Injectable()
export class VariantService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.variant.findMany();
  }

  async findOne(id: number) {
    const variant = await this.prisma.variant.findUnique({ where: { id } });
    if (!variant) {
      throw new NotFoundException(`Variant ${id} not found`);
    }
    return variant;
  }

  create(dto: CreateVariantDto) {
    return this.prisma.variant.create({ data: dto });
  }

  async update(id: number, dto: UpdateVariantDto) {
    await this.findOne(id);
    return this.prisma.variant.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.variant.delete({ where: { id } });
  }
}
