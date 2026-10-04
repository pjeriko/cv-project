import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateVariantDto } from './dto/create-variant.dto.js';
import { UpdateVariantDto } from './dto/update-variant.dto.js';

// P2002 = violation de contrainte d'unicité (ici, seul slug est @unique).
function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  );
}

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

  async create(dto: CreateVariantDto) {
    try {
      return await this.prisma.variant.create({ data: dto });
    } catch (error) {
      this.rethrow(error);
    }
  }

  async update(id: number, dto: UpdateVariantDto) {
    await this.findOne(id);
    try {
      return await this.prisma.variant.update({ where: { id }, data: dto });
    } catch (error) {
      this.rethrow(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.variant.delete({ where: { id } });
  }

  private rethrow(error: unknown): never {
    if (isUniqueViolation(error)) {
      throw new ConflictException('Slug déjà utilisé');
    }
    throw error;
  }
}
