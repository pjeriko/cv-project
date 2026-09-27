// src/cv/profile/profile.controller.ts (fichier complet mis à jour)
import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ProfileService } from './profile.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get()
  findOne() {
    return this.profileService.findOne();
  }

  @Patch()
  update(@Body() dto: UpdateProfileDto) {
    return this.profileService.update(dto);
  }
}
