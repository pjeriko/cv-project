// src/cv/profile/profile.service.ts (fichier complet mis à jour)
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

const PROFILE_ID = 1;

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async findOne() {
    const profile = await this.prisma.profile.findUnique({
      where: { id: PROFILE_ID },
    });
    if (!profile) {
      throw new NotFoundException('Profile not created yet');
    }
    return profile;
  }

  async update(dto: UpdateProfileDto) {
    await this.findOne(); // vérifie l'existence, lève 404 sinon
    return this.prisma.profile.update({ where: { id: PROFILE_ID }, data: dto });
  }
}
